# 🎓 LMS Project Plan

## User Roles

### 1. Students

- Cannot sign up directly; they must be added by parents.
- Enroll in free or paid courses.
- Track progress, complete assignments, and earn badges.

### 2. Instructors

- Can upload courses, which can be free or paid.
- Course creation uses a **WYSIWYG editor** (title, description, images sanitized).
- Track student engagement via analytics dashboard.

### 3. Parents

- Can sign up with email & password.
- Add/manage children’s accounts.
- Monitor their child’s progress, assignments, and overall performance.

### 4. Moderators

- Review/sanitize course content.
- Ensure compliance with platform standards.
- (More details can be fleshed out further).

### 5. Admins

- Manage users, roles, and platform-wide settings.
- Access full analytics.

---

## Core Features

### Course Management

- Free & paid courses (Paystack for payments).
- WYSIWYG course creation with content sanitization.

### Progress & Tracking

- **Students:** View tasks, assignments, progress reports.
- **Parents:** Monitor their child’s progress, assignments, and performance.
- **Instructors:** View course performance analytics.
- **Admins:** Access global platform analytics.

### Engagement & Community

- Rating system for courses.
- Discussion forums.
- Notifications (assignments, course updates, payments).
- Gamification (badges, achievements).

### Business Model

- Reusable API + frontend.
- Base version with core features.
- Custom school features (e.g., parent role, analytics, integrations).
- Potential school-targeted sales.

### Tech & Scalability

- Database design with role-based permissions.
- CI/CD setup (already in place).
- Mobile responsiveness.
- Possible integrations: **Google Classroom, Zoom**.

---

## Next Steps

- **Database Schema + ERD Design** for:
  - Roles & Permissions
  - Users (Students, Parents, Instructors, Moderators, Admins)
  - Parent-Child relationships
  - Courses & Enrollments
  - Assignments & Progress Tracking
  - Ratings & Forums
  - Notifications
  - Payments & Analytics
  - Integrations (Google Classroom, Zoom)
