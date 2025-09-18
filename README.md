# 🏫 LMS Project – Learning Management System

**Project Name:** LMS (Learning Management System)
**Version:** 1.0
**Author:** Samuel Oluwasegun
**Tech Stack:** TypeScript, Node.js, Express, PostgreSQL, Paystack (for payments), Cloudinary (for media storage)

---

## 📖 Overview

This LMS is a comprehensive platform designed for schools and educational institutions. It allows instructors to create courses, manage assignments, and track student progress, while parents can monitor their children’s learning journey.

The platform supports **five user roles**: Students, Parents, Instructors, Moderators, and Admins. Paid courses integrate with **Paystack**, and the system includes gamification, analytics, and discussion forums to enhance engagement.

---

## 💎 Why This LMS is Unique

1. **Parent-Focused Tracking:** Parents can register, add children, and monitor progress, assignments, and engagement.
2. **Custom User Codes:** Students, instructors, and parents get unique codes (e.g., STU12345, INS2345) separate from usernames.
3. **Gamification:** Earn badges and achievements to encourage engagement.
4. **Role Segmentation:** Five distinct roles with precise, customizable permissions.
5. **Paid & Free Courses:** Supports monetization via Paystack while keeping free courses accessible.
6. **Analytics & Tracking:** Detailed insights for students, instructors, and admins.
7. **Forums & Discussions:** Dedicated course forums for interaction.
8. **Integration-Ready:** Designed to connect with Zoom, Google Classroom, etc.
9. **Mobile-First Design:** Responsive and modern UI using Next.js + Tailwind.
10. **Security & Verification:** OTP/email verification, JWT authentication, and audit logs.
11. **Flexible Database Design:** Production-ready schema built for scalability and additional features.

---

## 🧑‍💻 User Roles & Permissions

| Role            | Permissions                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Students**    | View and enroll in courses, submit assignments, track progress, rate courses. Cannot sign up directly; must be added by parents. |
| **Parents**     | Register themselves, add children, monitor progress, view assignments and grades.                                                |
| **Instructors** | Create courses (free/paid), upload content, manage assignments, view student analytics, interact in forums.                      |
| **Moderators**  | Moderate forums, review content, manage user reports.                                                                            |
| **Admins**      | Full platform management, manage users and roles, oversee analytics, configure integrations.                                     |

---

## ⚡ Features

- **Course Management:** Free or paid courses with rich descriptions, thumbnails, and categories.
- **Enrollment & Payments:** Students enroll in courses; payments handled via Paystack.
- **Assignments & Submissions:** Instructors create assignments, students submit work, graded automatically or manually.
- **Progress Tracking:** Students and parents can see course completion stats and lesson progress.
- **Ratings & Reviews:** Students can rate courses and leave comments.
- **Discussion Forums:** Course-specific forums for student-instructor interaction.
- **Notifications:** Email and in-app notifications for updates, assignments, or system alerts.
- **Badges & Gamification:** Earn badges for achievements and milestones.
- **Analytics Dashboard:** For instructors and admins to monitor engagement and performance.
- **Parent Tracking:** Parents monitor children’s progress, assignments, and grades.
- **Integrations:** Connect with Zoom, Google Classroom, or other tools.
- **Mobile Responsiveness:** Fully optimized for mobile devices.

---

## 🗂 Architecture & Technology

- **Frontend:** The Repo will added here soooner but we are going with (Next.js or Angular)
- **Backend:** Node.js + Express (REST API)
- **Database:** PostgreSQL
- **Authentication:** JWT + OTP verification tokens
- **File Storage:** Cloudinary for course images & submissions
- **Payments:** Paystack integration for paid courses
- **Analytics & Tracking:** Custom tables for user activity, course progress, and engagement metrics

---

## ⚙️ Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/Oluwaseg/lms-api.git
cd lms
```

2. Install dependencies:

```bash
ppnpm install
```

3. Setup `.env` file with:

```
PORT=
DATABASE_URL=...
PAYSTACK_SECRET=...
CLOUDINARY_URL=...
JWT_SECRET=...
```

4. Run migrations & seed database:

```bash
pnpm run migrate
pnpm run seed
```

5. Start the development server:

```bash
pnpm run dev
```

6. Open in browser: `http://localhost:3000` or `http://localhost:${PORT}`

---

## 🗂 Database & Models

The system uses a relational database with key tables:

- `users`, `roles`, `verification_tokens`
- `parents_children`
- `courses`, `enrollments`, `payments`
- `assignments`, `submissions`
- `progress`, `ratings`
- `forums`, `forum_posts`
- `notifications`
- `badges`, `user_badges`
- `analytics`
- `integrations`
- `audit_logs`

### 🗄️ Database Design

We’ve designed a production-ready, scalable database schema to support all LMS features, including user roles, parent-child relationships, payments, analytics, and integrations.

- **ERD Image:** [`LMS-DATABASE-DESIGN.png`](./LMS-DATABASE-DESIGN.png)
- **ERD PDF:** [`LMS DATABASE DESIGN.pdf`](./LMS-DATABASE-DESIGN.pdf)
- **Database Documentation:** [`Database.md`](./Database.md)
- **Live Diagram (dbdiagram.io):** [View Online](https://dbdiagram.io/d/LMS-DATABASE-DESIGN-68cc2ad25779bb72651f3d14)

---

## 📌 Roadmap

**Phase 1 (Core MVP):**

- User management & roles
- Course creation & enrollment
- Assignment submission
- Payment integration (Paystack)

**Phase 2:**

- Parent tracking dashboards
- Ratings & reviews
- Gamification & badges
- Analytics & reporting

**Phase 3 (Optional / Future):**

- Zoom / Google Classroom integration
- Mobile app companion
- Advanced tracking & recommendation system

---

## 🛡 Security Considerations

- Passwords are hashed using **bcrypt**.
- JWT tokens used for authentication.
- OTP/email verification for sensitive actions.
- Audit logs track user actions for accountability.

---

## 📝 Contributing

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m "Description"`).
4. Push to branch (`git push origin feature-name`).
5. Open a pull request.

---

## 📧 Contact

- Author: Samuel Oluwasegun
- Email: \[[oluwasegunsam56@gmail.com](mailto:oluwasegunsam56@gmail.com)]
- GitHub: [https://github.com/Oluwaseg/lms-api.git](https://github.com/Oluwaseg/lms-api.git)
