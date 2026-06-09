# Backend

This is the Express and MongoDB backend for ATP-Pro. It provides authentication, role-based APIs, course management, enrollment, payment records, reviews, wishlist, doubts, and admin management.

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Token
- bcryptjs
- cookie-parser
- CORS
- dotenv
- Busboy for file uploads

## Folder Structure

```text
Backend/
|-- APIs/
|   |-- AdminAPI.js
|   |-- CommonAPI.js
|   |-- InstructorAPI.js
|   `-- StudentAPI.js
|-- Middlewares/
|   `-- verifyToken.js
|-- Models/
|   |-- CourseModel.js
|   |-- DoubtModel.js
|   |-- EnrollmentModel.js
|   |-- PaymentModel.js
|   |-- UserModel.js
|   `-- WishlistModel.js
|-- server.js
|-- package.json
`-- README.md
```

## Installation

From the `Backend` folder, install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file inside the `Backend` folder:

```env
DB_URL=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
PORT=1935
```

`PORT` is optional. If it is not provided, the server runs on port `1935`.

## Running The Server

Run in development mode:

```bash
npm run dev
```

Run normally:

```bash
npm start
```

Default API URL:

```text
http://localhost:1935
```

Health check route:

```text
GET /
```

## Authentication

The backend uses JWT authentication. After login, the token is stored in an HTTP-only cookie named `token`.

Protected routes use the `verifyToken` middleware:

```js
verifyToken("STUDENT")
verifyToken("INSTRUCTOR")
verifyToken("ADMIN")
```

The frontend should send requests with:

```js
credentials: "include"
```

## API Route Groups

The backend is divided into four main route groups:

```text
/auth
/student-api
/instructor-api
/admin-api
```

## Auth Routes

- `POST /auth/register` - Register a student or instructor
- `POST /auth/login` - Login user and create auth cookie
- `GET /auth/logout` - Clear auth cookie
- `GET /auth/check-auth` - Check if user is logged in
- `PUT /auth/forgot-password` - Reset password
- `GET /auth/courses` - Get public active courses
- `GET /auth/profile` - Get logged-in user profile
- `PUT /auth/profile` - Update logged-in user profile
- `PUT /auth/password` - Change password

## Student Routes

- `GET /student-api/courses` - Get active courses
- `POST /student-api/pay` - Add payment record
- `GET /student-api/wishlist` - Get wishlist
- `POST /student-api/wishlist` - Add course to wishlist
- `DELETE /student-api/wishlist/:courseId` - Remove course from wishlist
- `POST /student-api/enroll` - Enroll in a course
- `GET /student-api/course` - Get enrolled courses
- `PATCH /student-api/course` - Update course progress, status, or study time
- `PUT /student-api/course` - Add course review
- `GET /student-api/doubts` - Get student's own doubts
- `GET /student-api/doubts/feed` - Get class doubt feed
- `POST /student-api/doubts` - Post a doubt
- `POST /student-api/doubts/:doubtId/answers` - Answer a classmate's doubt

## Instructor Routes

- `POST /instructor-api/media` - Upload course media
- `POST /instructor-api/course` - Create a course
- `GET /instructor-api/courses` - Get instructor's own courses
- `PUT /instructor-api/course` - Update a course
- `PATCH /instructor-api/courses/activate` - Update course active state
- `PATCH /instructor-api/courses/deactivate` - Update course active state
- `GET /instructor-api/doubts` - Get doubts from enrolled students
- `PATCH /instructor-api/doubts/:doubtId/reply` - Reply to a doubt

## Admin Routes

- `GET /admin-api/users` - Get all users
- `PATCH /admin-api/users/deactivate` - Deactivate a user
- `PATCH /admin-api/users/activate` - Activate a user
- `DELETE /admin-api/users/:userId` - Delete a user
- `GET /admin-api/courses` - Get all courses
- `GET /admin-api/analytics` - Get admin analytics
- `PATCH /admin-api/courses/deactivate` - Deactivate a course
- `PATCH /admin-api/courses/activate` - Activate a course

## Database Models

### User

Stores user details, role, profile data, hashed password, and active status.

Roles:

- `STUDENT`
- `INSTRUCTOR`
- `ADMIN`

### Course

Stores instructor, title, category, price, content, thumbnail, demo video, chapters, units, quizzes, reviews, and active status.

### Enrollment

Stores student-course relationship, payment reference, progress, study time, completed chapters, and enrollment status.

### Payment

Stores student payment details for course enrollment.

### Wishlist

Stores saved courses for students.

### Doubt

Stores student doubts, class or instructor audience, course/unit context, matched doubts, peer answers, instructor replies, and status.

Statuses:

- `Open`
- `Matched`
- `Answered`

## Media Uploads

Instructor media uploads are handled by:

```text
POST /instructor-api/media
```

Uploaded files are stored in:

```text
Backend/uploads
```

They are served publicly from:

```text
/uploads
```

Allowed file types include images, videos, PDFs, documents, presentations, and text files.

## CORS

The backend currently allows these frontend origins:

```text
http://localhost:5173
http://localhost:5174
```

Cookies are enabled with:

```js
credentials: true
```

## Notes

- Keep `.env` private and do not commit it.
- MongoDB must be running or available through the `DB_URL`.
- The backend uses `strict: "throw"` in Mongoose schemas, so unknown fields may cause validation errors.
- API test files such as `student-req.http`, `instructor-req.http`, `admin-req.http`, and `common-req.http` can be used for manual request testing.
