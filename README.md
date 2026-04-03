# Smart Task & Notes Management System (MERN)

A premium, full-stack task and notes management application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features
- **Secure Authentication**: JWT with local storage persistence.
- **Full CRUD Operations**: Create, read, update, and delete tasks/notes.
- **Premium UI**: Glassmorphism aesthetic, dark mode, and smooth animations using Framer Motion.
- **Protected Routes**: Only authenticated users can access their personalized dashboard.
- **Responsive Design**: Works perfectly across desktop and mobile devices.

## Tech Stack
- **Frontend**: React, Vite, Framer Motion, Lucide icons, Axios, React Router.
- **Backend**: Node.js, Express, Mongoose (MongoDB).
- **Security**: JWT for tokens, Bcrypt for password hashing.

## Getting Started

### Prerequisites
- Node.js (v16.x or later)
- MongoDB (Running locally or MongoDB Atlas URI)

### Backend Setup
1. Open a terminal in the `backend` folder.
2. Run `npm install` to install dependencies.
3. Configure the `.env` file with your `MONGODB_URI` and `JWT_SECRET`.
4. Run `npm start` or `npm run dev` to start the server.

### Frontend Setup
1. Open a terminal in the `frontend` folder.
2. Run `npm install` to install dependencies.
3. Verify the `VITE_API_URL` in the `.env` file points to your backend server (default: http://localhost:5000/api).
4. Run `npm run dev` to start the React application.

## API Endpoints

### Auth
- `POST /api/auth/register` - Create a new user.
- `POST /api/auth/login` - Authenticate user and get token.

### Tasks (Protected)
- `GET /api/tasks` - Get all tasks for the logged-in user.
- `POST /api/tasks` - Create a new task.
- `PUT /api/tasks/:id` - Update an existing task.
- `DELETE /api/tasks/:id` - Remove a task.
