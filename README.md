# TaskFlow – Team Task Manager

A full-stack collaborative task management web application built with React, Node.js, Express, and MongoDB.

---

## Live Demo

- **Frontend:** https://taskflow-frontend.up.railway.app
- **Backend API:** https://taskflow-backend.up.railway.app

---

## Features

- **JWT Authentication** – Signup, login, and secure sessions
- **Project Management** – Create projects, manage members, track progress
- **Kanban Task Board** – Drag-friendly To Do / In Progress / Done columns
- **Role-Based Access** – Admin (full control) vs Member (view + update own tasks)
- **Dashboard** – Stats, charts, overdue alerts
- **Team Members** – Invite users, promote/demote roles

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Axios, CSS Variables    |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB + Mongoose                |
| Auth      | JWT (jsonwebtoken) + bcryptjs     |
| Deploy    | Railway (Backend + Frontend)      |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   └── Task.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   ├── tasks.js
│   │   │   └── users.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── server.js
│   ├── .env.example
│   ├── railway.toml
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── api.js
│   │   └── index.js
│   ├── .env.example
│   ├── railway.toml
│   └── package.json
├── package.json
├── .gitignore
└── README.md
```

---

## Local Setup (Step by Step)

### Prerequisites

Make sure these are installed on your machine:

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) (local) OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/) (recommended)

---

### Step 1 – Clone or Create the Project

If you have the files already, open VS Code and open the `taskflow` folder:

```
File → Open Folder → select the taskflow folder
```

Or clone from GitHub:

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

---

### Step 2 – Set Up the Backend

Open a terminal in VS Code (`Ctrl + `` ` ``):

```bash
cd backend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_key_change_this
FRONTEND_URL=http://localhost:3000
```

> If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

Start the backend server:

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

Test it by visiting: http://localhost:5000/health

---

### Step 3 – Set Up the Frontend

Open a **second terminal** in VS Code:

```bash
cd frontend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

The default `.env` content:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

The app will open automatically at http://localhost:3000

---

### Step 4 – Create Your First Admin

1. Visit http://localhost:3000
2. Click **Create account**
3. Register with any name/email/password
4. Your account starts as **member** by default

To promote yourself to admin, open MongoDB Compass or the Mongo shell:

```js
use taskflow
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

Or use the provided seed script:

```bash
cd backend
node src/seed.js
```

This creates:
- **Admin:** admin@taskflow.com / admin123
- **Member:** member@taskflow.com / member123

---

### Running Both at Once (Optional)

From the root `taskflow/` folder:

```bash
npm install          # installs concurrently
npm run dev          # starts both backend and frontend
```

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login and get JWT |
| GET | /api/auth/me | Get current user |

### Projects
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/projects | List user's projects |
| POST | /api/projects | Create project (admin) |
| GET | /api/projects/:id | Get project by ID |
| PUT | /api/projects/:id | Update project (admin) |
| DELETE | /api/projects/:id | Delete project (admin) |

### Tasks
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/tasks?projectId= | Get tasks for project |
| GET | /api/tasks?assigneeId= | Get tasks for user |
| POST | /api/tasks | Create task (admin) |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task (admin) |
| GET | /api/tasks/dashboard/stats | Get dashboard stats |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/users | List all users (admin only) |
| PUT | /api/users/:id/role | Update user role (admin) |
| PUT | /api/users/me | Update own profile |

---

## Deployment on Railway

### Step 1 – Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

### Step 2 – Deploy Backend

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project → Deploy from GitHub repo**
3. Select your repo, set **Root Directory** to `backend`
4. Add environment variables in Railway dashboard:
   ```
   MONGODB_URI=your_atlas_connection_string
   JWT_SECRET=your_secret_key
   FRONTEND_URL=https://your-frontend.up.railway.app
   PORT=5000
   ```
5. Click **Deploy** – Railway gives you a public URL

### Step 3 – Deploy Frontend

1. In the same Railway project, click **New Service → GitHub Repo**
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.up.railway.app/api
   ```
4. Click **Deploy**

### Step 4 – Connect Frontend ↔ Backend

- Copy the backend Railway URL
- Set it as `REACT_APP_API_URL` in the frontend Railway service variables
- Redeploy frontend

---

## Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create project | ✅ | ❌ |
| Delete project | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create task | ✅ | ❌ |
| Delete task | ✅ | ❌ |
| Update any task field | ✅ | ❌ |
| Update own task status | ✅ | ✅ |
| View assigned projects | ✅ | ✅ |
| View dashboard | ✅ | ✅ |
| Manage user roles | ✅ | ❌ |

---

## Environment Variables Reference

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/taskflow |
| JWT_SECRET | Secret key for JWT signing | any_long_random_string |
| FRONTEND_URL | Frontend origin for CORS | http://localhost:3000 |

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API base URL | http://localhost:5000/api |
