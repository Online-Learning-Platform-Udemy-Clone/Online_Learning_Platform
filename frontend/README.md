# Frontend

This is the React frontend for ATP-Pro, an online learning platform with Student, Instructor, and Admin dashboards.

## Tech Stack

- React
- Vite
- React Router
- Tailwind CSS
- ESLint

## Main Features

- Public home page with course previews
- Login, register, forgot password, and logout flow
- Protected routes based on user role
- Student dashboard
- Course browsing and course details
- Wishlist
- Payment page
- Course player with chapters, units, quizzes, and learning progress
- Course review and certificate pages
- Instructor dashboard
- Instructor course creation and editing
- Instructor doubt reply page
- Admin dashboard
- User and course management pages
- Profile page for all logged-in users
- Floating learning assistant

## Folder Structure

```text
frontend/
|-- public/
|-- src/
|   |-- components/
|   |   |-- LearningAssistant.jsx
|   |   |-- Navbar.jsx
|   |   `-- Protectedroute.jsx
|   |-- context/
|   |   |-- AuthContext.jsx
|   |   |-- ThemeContext.jsx
|   |   `-- theme.js
|   |-- pages/
|   |   |-- admin/
|   |   |-- instructor/
|   |   |-- student/
|   |   |-- HomePage.jsx
|   |   |-- Login.jsx
|   |   |-- Register.jsx
|   |   |-- ForgotPassword.jsx
|   |   `-- Profile.jsx
|   |-- utils/
|   |-- App.jsx
|   |-- bootstrap.jsx
|   |-- index.css
|   `-- main.jsx
|-- index.html
|-- package.json
`-- vite.config.js
```

## Installation

From the `frontend` folder, install dependencies:

```bash
npm install
```

## Running The Frontend

Start the development server:

```bash
npm run dev
```

The app usually runs at:

```text
http://localhost:5173
```

## Backend Requirement

The frontend expects the backend API to be running separately.

Default backend URL:

```text
http://localhost:1935
```

The backend should allow frontend origins such as:

```text
http://localhost:5173
http://localhost:5174
```

Authentication uses cookies, so API requests use:

```js
credentials: "include"
```

## Available Scripts

```bash
npm run dev
```

Runs the frontend in development mode.

```bash
npm run build
```

Creates a production build.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs ESLint checks.

## Main Routes

### Public

- `/`
- `/login`
- `/register`
- `/forgot-password`

### Student

- `/student/dashboard`
- `/student/courses`
- `/student/wishlist`
- `/student/courses/:id`
- `/student/payment/:courseId`
- `/student/learn/:id`
- `/student/review/:courseId`
- `/student/certificate/:courseId`
- `/student/completed-courses`

### Instructor

- `/instructor/dashboard`
- `/instructor/doubts`
- `/instructor/courses/new`
- `/instructor/courses/:id/edit`

### Admin

- `/admin/dashboard`
- `/admin/users`
- `/admin/courses`

### Common Protected Route

- `/profile`

## Notes

- `AuthContext.jsx` manages logged-in user state.
- `Protectedroute.jsx` protects pages based on allowed roles.
- `Navbar.jsx` changes navigation based on the logged-in user's role.
- `LearningAssistant.jsx` gives simple guidance inside the app.
- Student and instructor doubt features connect to the backend doubt APIs.
