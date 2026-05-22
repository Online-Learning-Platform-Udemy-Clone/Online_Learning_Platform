# ONLINE LEARNING PLATFORM

ATP-Pro is a full-stack online learning platform built with React, Express, MongoDB, and Node.js. It supports three main roles: students, instructors, and admins. Students can browse and enroll in courses, instructors can create and manage course content, and admins can manage users and courses.

## Features

- User authentication with JWT cookies
- Role-based access for Student, Instructor, and Admin
- Student course browsing, wishlist, enrollment, and payment flow
- Course player with chapters, units, videos, documents, and quizzes
- Student progress tracking and completed course certificate page
- Course reviews and ratings
- Instructor course creation, editing, media upload, activation, and deactivation
- Student doubt system with class doubts, instructor doubts, peer answers, and instructor replies
- Similar doubt matching for recently posted class doubts
- Admin dashboards for managing users and courses
- Profile update, password change, logout, and forgot password flow
- Floating learning assistant for simple app guidance

## Tech Stack

**Frontend**

- React
- Vite
- React Router
- Tailwind CSS via Vite plugin

**Backend**

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs password hashing
- cookie-parser and CORS
- Busboy for media uploads

## Project Structure

```text
ATP-Pro/
|-- Backend/
|   |-- APIs/
|   |   |-- AdminAPI.js
|   |   |-- CommonAPI.js
|   |   |-- InstructorAPI.js
|   |   `-- StudentAPI.js
|   |-- Middlewares/
|   |   `-- verifyToken.js
|   |-- Models/
|   |   |-- CourseModel.js
|   |   |-- DoubtModel.js
|   |   |-- EnrollmentModel.js
|   |   |-- PaymentModel.js
|   |   |-- UserModel.js
|   |   `-- WishlistModel.js
|   |-- server.js
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   `-- App.jsx
|   `-- package.json
`-- README.md
```

## Prerequisites

- Node.js
- npm
- MongoDB database connection string

## Environment Variables

Create a `.env` file inside the `Backend` folder:

```env
DB_URL=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
PORT=1935
```

`PORT` is optional. If it is not provided, the backend runs on port `1935`.

## Installation

Install backend dependencies:

```bash
cd Backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Running The Project

Start the backend:

```bash
cd Backend
npm run dev
```

The backend will run at:

```text
http://localhost:1935
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The frontend will usually run at:

```text
http://localhost:5173
```

## Main Routes

### Public/Auth Routes

- `POST /auth/register` - Register a student or instructor
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user
- `GET /auth/check-auth` - Check current authentication
- `PUT /auth/forgot-password` - Reset password
- `GET /auth/courses` - View public active courses
- `GET /auth/profile` - Get logged-in profile
- `PUT /auth/profile` - Update logged-in profile
- `PUT /auth/password` - Change password

### Student Routes

- `GET /student-api/courses` - View active courses
- `POST /student-api/pay` - Add payment
- `GET /student-api/wishlist` - View wishlist
- `POST /student-api/wishlist` - Save course to wishlist
- `DELETE /student-api/wishlist/:courseId` - Remove course from wishlist
- `POST /student-api/enroll` - Enroll in a course
- `GET /student-api/course` - View enrolled courses
- `PATCH /student-api/course` - Update enrollment progress/status
- `PUT /student-api/course` - Add course review
- `GET /student-api/doubts` - View own doubts
- `GET /student-api/doubts/feed` - View class doubt feed
- `POST /student-api/doubts` - Post a doubt
- `POST /student-api/doubts/:doubtId/answers` - Answer a classmate doubt

### Instructor Routes

- `POST /instructor-api/media` - Upload course media
- `POST /instructor-api/course` - Create course
- `GET /instructor-api/courses` - View own courses
- `PUT /instructor-api/course` - Update course
- `PATCH /instructor-api/courses/activate` - Change course active state
- `PATCH /instructor-api/courses/deactivate` - Change course active state
- `GET /instructor-api/doubts` - View doubts from enrolled students
- `PATCH /instructor-api/doubts/:doubtId/reply` - Reply to a student doubt

### Admin Routes

Admin routes are available under:

```text
/admin-api
```

They are used by the admin dashboard to manage users and courses.

## Frontend Pages

- Home page
- Login and register
- Forgot password
- Profile
- Student dashboard
- Browse courses
- Course details
- Payment
- Wishlist
- Course player
- Rate course
- Certificate
- Completed courses
- Instructor dashboard
- Create course
- Edit course
- Instructor doubts
- Admin dashboard
- Manage users
- Manage courses

## Doubt System

The project includes a beginner-friendly doubt management system:

- Students can post class doubts.
- Students can send private doubts to instructors.
- Other enrolled students can answer class doubts.
- Instructors can reply to doubts from students in their own courses.
- Doubts can be marked as `Open`, `Matched`, or `Answered`.
- Similar recent doubts are matched using keyword similarity.
- Doubts can store course, chapter, and unit context.

## Notes

- The backend uses cookies for authentication, so frontend requests use `credentials: "include"`.
- CORS currently allows `http://localhost:5173` and `http://localhost:5174`.
- Uploaded media files are served from `/uploads`.
- The `.env` file and uploaded files are ignored by Git.

## Future Improvements

- Add accepted answers and helpful votes for doubts
- Add notifications for replies and answers
- Add search and filters for doubts
- Add stronger payment gateway integration
- Add automated tests
- Improve admin reporting and analytics
