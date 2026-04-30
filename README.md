# TeamSync Task Manager

A comprehensive full-stack team task management application featuring project organization, real-time task tracking, role-based access control, and a data-driven dashboard.

## 🚀 Features

- **Authentication**: Secure signup and login with JWT and password hashing.
- **Project Management**: Organize work into projects with specific members and managers.
- **Task Tracking**: Create, assign, and track tasks with status, priority, and due dates.
- **Dashboard**: High-level overview of team performance, overdue tasks, and project health.
- **Role-Based Access (RBAC)**:
  - **Admin**: Full access to all projects and tasks.
  - **Member**: Access to projects they are part of and tasks assigned to them.
- **Responsive Design**: Modern, polished UI built with Tailwind CSS and Motion.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Node.js, Express.
- **Database**: File-based persistent storage (JSON).
- **Security**: JWT Authentication, Bcrypt password hashing.

## ⚙️ Setup & Deployment

The application is configured to run as a full-stack app.

### Deployment on Railway

1. Push this repository to GitHub.
2. Link your GitHub repo to Railway.
3. Add the following environment variables in Railway:
   - `JWT_SECRET`: A secure random string for signing tokens.
   - `NODE_ENV`: `production`
4. The application will automatically build and deploy using the `npm run build` and `npm start` scripts.

## 📝 Assignment Requirements Handled

- [x] Authentication (Signup/Login)
- [x] Project & team management
- [x] Task creation, assignment & status tracking
- [x] Dashboard (tasks, status, overdue)
- [x] REST APIs + Database
- [x] Role-based access control (Admin/Member)
