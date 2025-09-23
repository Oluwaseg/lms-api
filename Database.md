# 📘 LMS Database Documentation

This document explains the purpose of each table in the Learning Management System (LMS). It’s designed for developers, admins, and stakeholders to understand how data is structured and connected.

---

## 1. Roles & Users

### **roles**

Stores all registered accounts.
Includes profile info (`name`, `email`, `phone`, `address`, `picture`) and system details (`role_id`, `status`, verification flags).
`email` and `code` are indexed and unique in the schema.
Each user has a **unique code** (`STU12345`, `INS5678`, etc.) separate from their username.
Field names in the codebase: `is_verified` (boolean), `last_login` (timestamp), and `deleted_at` (nullable timestamp) are used to manage lifecycle and soft-deletes.

### **users**

### **verification_tokens**

Manages token verification used for email verification, password reset and onboarding flows.
The implementation stores only a hashed lookup value in `token_hash` (HMAC-SHA256 with a server secret) for security. The DB/entity does not store raw tokens in production; a temporary plaintext token column may exist during development/migrations but should be removed before production deployment.
Tokens include `type`, `expires_at`, `used` and `created_at` fields and are linked by `user_id`.

- Includes profile info (name, email, phone, address, picture) and system details (role, status, verification).

### **parents_children**

Links **parent accounts** to their **child/student accounts**.
Implemented with explicit foreign key columns named `parent_id` and `child_id` (matching the migration and entity join columns).
Includes `relationship` (e.g., father, mother, guardian) and `created_at` timestamp.
A unique constraint enforces that the same child cannot be linked multiple times to the same parent.

### **verification_tokens**

- Manages OTP/token verification (for email, password reset, onboarding).
- Tokens have expiration and usage status.

### **parents_children**

- Links **parent accounts** to their **child/student accounts**.
- Includes `relationship` (e.g., father, mother, guardian).
- Enforces uniqueness so the same child isn’t duplicated under the same parent.

---

## 2. Courses & Enrollments

### **courses**

- Represents courses uploaded by instructors.
- Includes metadata like title, description, category, price, paid/free status, thumbnail, and publish state.
- Supports soft deletion with `deleted_at`.

### **enrollments**

- Tracks which students are enrolled in which courses.
- Stores `payment_status` (free, pending, paid).

### **payments**

- Handles transactions for course enrollments.
- Supports multiple providers (Paystack, Flutterwave, etc.).
- Tracks `amount`, `currency`, `payment_method`, and transaction status.

---

## 3. Assignments & Submissions

### **assignments**

- Instructor-created tasks for courses.
- Includes title, description, due date, and maximum score.

### **submissions**

- Tracks student assignment submissions.
- Stores written answers, uploaded files, score, and grading timestamps.

---

## 4. Progress & Ratings

### **progress**

- Tracks how far a student has progressed in a course.
- Stores lesson completion counts, percentage, and last accessed time.

### **ratings**

- Students can rate courses (1–5 stars) and leave comments.
- Helps feedback loop for course quality.

---

## 5. Forums & Posts

### **forums**

- Course-specific discussion boards.
- Each forum belongs to a course.

### **forum_posts**

- Individual posts in a forum by students, instructors, or moderators.
- Supports threaded community interaction.

---

## 6. Notifications

### **notifications**

- Stores messages sent to users (email, in-app, SMS).
- Tracks read/unread state for user engagement.

---

## 7. Badges & Gamification

### **badges**

- Defines achievement badges (e.g., “Top Scorer”, “Completed 10 Courses”).
- Includes criteria and icon.

### **user_badges**

- Connects users with badges they’ve earned.
- Stores timestamp of achievement.

---

## 8. Analytics

### **analytics**

- Stores recorded metrics per user (e.g., time spent, logins, lesson completions).
- Used for tracking student engagement and reporting.

---

## 9. Integrations

### **integrations**

- Stores third-party tool connections (Zoom, Google Classroom).
- Configurable via JSON for flexibility.
- Tracks whether integration is enabled and when it was connected.

---

## 10. Security & Audit

### **audit_logs**

- Tracks user actions for accountability and security.
- Logs `action` (login, profile update, course delete), `IP address`, `user agent`, and timestamp.
