# Course & Media API — Developer Guide

This document describes the server-side course creation and media upload flows used by the LMS API.

Environment required:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `JWT_SECRET`
- `REDIS_URL` (optional for local dev; required for rate-limiter middleware)

High-level approach

- The server owns a single Cloudinary account.
- Instructors upload thumbnails and short preview videos via server endpoints (multipart). The server streams or buffers and forwards to Cloudinary.
- Lesson videos are uploaded via a lesson-specific server endpoint that accepts multipart with `video` and streams the buffer to Cloudinary.
- The server stores secure Cloudinary `secure_url` values on the Course/Lesson records.

Common headers

- `Authorization: Bearer <JWT>` for authenticated instructor/student requests.

1. Upload course thumbnail (server-side)

- Endpoint: `POST /api/courses/:id/media/thumbnail`
- Auth: Instructor
- Content-Type: `multipart/form-data`
- Field: `thumbnail` (file)

Example (curl):

curl -X POST "http://localhost:3000/api/courses/COURSE_ID/media/thumbnail" \
 -H "Authorization: Bearer $TOKEN" \
 -F "thumbnail=@/path/to/thumb.jpg"

Response: 200 with `thumbnailUrl` in body.

2. Create course (JSON) — using server-saved `thumbnailUrl`

- Endpoint: `POST /api/courses`
- Auth: Instructor
- Body (JSON):
  {
  "title": "Intro to Algebra",
  "description": "<p>Course description...</p>",
  "thumbnailUrl": "https://res.cloudinary.com/.../v.../thumb.jpg",
  "priceCents": 0
  }

Response: 201 with `{ id: <courseId> }`.

Note: You can also create and upload the thumbnail in a single multipart request by sending `thumbnail` as a file and other fields as text form fields. The server will upload the thumbnail and attach `thumbnailUrl` before validation.

3. Create a lesson

- Endpoint: `POST /api/courses/:courseId/lessons`
- Auth: Instructor
- Body (JSON):
  {
  "title": "Lesson 1",
  "content": "<p>Lesson HTML</p>",
  "position": 1,
  "durationSeconds": 300
  }

Response: 201 with `{ id: <lessonId> }`.

4. Upload lesson video (server-side)

- Endpoint: `POST /api/courses/:courseId/lessons/:lessonId/media/video`
- Auth: Instructor
- Content-Type: `multipart/form-data`
- Field: `video` (file)

Example (curl):

curl -X POST "http://localhost:3000/api/courses/COURSE_ID/lessons/LESSON_ID/media/video" \
 -H "Authorization: Bearer $TOKEN" \
 -F "video=@/path/to/lesson.mp4"

Response: 200 with `videoUrl` in body.

5. Publish course

- Endpoint: `POST /api/courses/:id/publish`
- Auth: Instructor
- Response: 200 with course data.

6. Enroll (student)

- Endpoint: `POST /api/courses/:courseId/enroll`
- Auth: Student
- Response: 201 with `{ id: <enrollmentId> }`.

Notes & Recommendations

- Large files: lesson video upload endpoint uses memory buffer by default with a 500MB limit; for large production files consider using disk storage or direct signed uploads (not currently enabled).
- Security: tokens are never returned in API responses. Invite/verification tokens are emailed only.
- Rate limiting: media endpoints are protected by a Redis-backed rate limiter; ensure `REDIS_URL` is configured.

If you'd like, I can:

- Add client examples for the stepper UI flows (JS/React snippets), or
- Swap lesson video upload to disk-streaming to avoid high memory use for very large files.
