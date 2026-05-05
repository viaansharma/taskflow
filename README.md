# TaskFlow – Team Task Manager

A full-stack collaborative task management web application built with React, Node.js, Express, and MongoDB.

---

## 🚀 Live Demo

- **Frontend:** https://prolific-education-production-a537.up.railway.app
- **Backend API:** https://appealing-adaptation.up.railway.app
- **GitHub Repository:** https://github.com/viaansharma/taskflow

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@taskflow.com` | `admin123` |
| **Member** | `bob@taskflow.com` | `member123` |
| **Member** | `carol@taskflow.com` | `member123` |
| **Member** | `dan@taskflow.com` | `member123` |

---

## ✨ Features

### Core Features
- **JWT Authentication** – Secure signup, login, and session management
- **Project Management** – Create, edit, and delete projects with team members
- **Kanban Task Board** – Drag-and-drop interface with To Do, In Progress, Done columns
- **Role-Based Access Control** – Admin (full control) vs Member (limited access)
- **Interactive Dashboard** – Real-time statistics, charts, and overdue alerts
- **Team Management** – Invite users, promote/demote roles

### Technical Highlights
- ✅ Full CRUD operations on projects and tasks
- ✅ Responsive dark theme UI
- ✅ RESTful API design
- ✅ MongoDB data persistence with Mongoose ODM
- ✅ CORS enabled for secure cross-origin requests
- ✅ Environment variable configuration
- ✅ Deployed on Railway with automatic HTTPS

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.2.0 |
| | Axios | 1.6.2 |
| | CSS3 (Custom Variables) | - |
| **Backend** | Node.js | 18.x |
| | Express.js | 4.18.2 |
| **Database** | MongoDB Atlas | 6.0+ |
| | Mongoose | 7.0.0 |
| **Authentication** | JSON Web Token | 9.0.0 |
| | Bcryptjs | 2.4.3 |
| **Deployment** | Railway | - |

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js          # User schema with role (admin/member)
│   │   │   ├── Project.js       # Project schema with members
│   │   │   └── Task.js          # Task schema with status/priority
│   │   ├── routes/
│   │   │   ├── auth.js          # Login, signup, verify
│   │   │   ├── projects.js      # CRUD operations for projects
│   │   │   ├── tasks.js         # CRUD operations for tasks
│   │   │   └── users.js         # User management (admin only)
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT verification
│   │   └── server.js            # Express app entry point
│   ├── .env.example             # Environment variables template
│   ├── railway.json             # Railway deployment config
│   ├── seed.js                  # Demo data population script
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   ├── App.css              # Dark theme styles
│   │   ├── api.js               # Axios API client
│   │   └── index.js             # React entry point
│   ├── .env.example
│   ├── railway.json
│   └── package.json
├── .gitignore
└── README.md
```

---

## 💻 Local Setup (Step by Step)

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier) OR local MongoDB
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/) (recommended)

---

### Step 1 – Clone the Repository

```bash
git clone https://github.com/viaansharma/taskflow.git
cd taskflow
```

### Step 2 – Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster (M0 Sandbox)
3. Create a database user and password
4. Add your IP address to whitelist (`0.0.0.0/0` for development)
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
   ```

### Step 3 – Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5001
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

**Expected output:**
```
✅ MongoDB connected
🚀 Server running on port 5001
```

Test the API:
```bash
curl http://localhost:5001/api/health
# Response: {"status":"ok","mongodb":true}
```

### Step 4 – Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5001/api
```

Start the React app:

```bash
npm start
```

The app will open at `http://localhost:3000`

### Step 5 – Seed Demo Data

```bash
cd backend
node src/seed.js
```

This creates:
- 4 users (1 admin, 3 members)
- 3 projects
- 9 tasks

### Step 6 – Login

Open `http://localhost:3000` and use:
- **Admin:** `admin@taskflow.com` / `admin123`
- **Member:** `bob@taskflow.com` / `member123`

---

## 🔧 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user info |

### Projects (Requires Auth)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/projects` | Get user's projects | All |
| POST | `/api/projects` | Create new project | Admin only |
| PUT | `/api/projects/:id` | Update project | Admin only |
| DELETE | `/api/projects/:id` | Delete project | Admin only |

### Tasks (Requires Auth)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tasks` | Get tasks (filter by project/assignee) | All |
| POST | `/api/tasks` | Create task | Admin only |
| PUT | `/api/tasks/:id` | Update task | Admin or assignee |
| DELETE | `/api/tasks/:id` | Delete task | Admin only |

### Users (Requires Auth)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | List all users | Admin only |
| PUT | `/api/users/:id/role` | Update user role | Admin only |
| PUT | `/api/users/me` | Update own profile | All |

---

## 🚢 Deployment on Railway

### Step 1 – Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2 – Deploy Backend

1. Go to [Railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. Select `viaansharma/taskflow`
4. **Root Directory:** `backend`
5. **Add Environment Variables:**
   ```
   PORT=8080
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secret_key
   NODE_ENV=production
   ```
6. Click **Deploy**

### Step 3 – Deploy Frontend

1. **New Service** → **Deploy from GitHub** (same repo)
2. **Root Directory:** `frontend`
3. **Add Environment Variable:**
   ```
   REACT_APP_API_URL=https://your-backend-url.up.railway.app/api
   ```
4. Click **Deploy**

### Step 4 – Connect Services

1. Copy frontend URL (e.g., `https://frontend.up.railway.app`)
2. Go to backend service → **Variables**
3. Add:
   ```
   FRONTEND_URL=https://frontend.up.railway.app
   ```
4. Save (auto-redeploys)

### Step 5 – Seed Production Database

```bash
# From your local machine, using Railway's MongoDB URI:
MONGODB_URI="your_railway_mongodb_uri" node backend/src/seed.js
```

---

## 👥 Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create/Delete Project | ✅ | ❌ |
| Add/Remove Team Members | ✅ | ❌ |
| Change User Roles | ✅ | ❌ |
| Create/Delete Tasks | ✅ | ❌ |
| Update Any Task | ✅ | ❌ |
| Update Own Task Status | ✅ | ✅ |
| View Dashboard | ✅ | ✅ |
| View Assigned Projects | ✅ | ✅ |
| Update Own Profile | ✅ | ✅ |

---

## 🌐 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing key | `your_secret_key` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` or `production` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5001/api` |

---

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl https://appealing-adaptation.up.railway.app/api/health

# Login
curl -X POST https://appealing-adaptation.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@taskflow.com","password":"admin123"}'

# Get projects (with token)
curl -X GET https://appealing-adaptation.up.railway.app/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Frontend

1. Open browser to frontend URL
2. Login with demo credentials
3. Create a project
4. Add a task
5. Move task between columns

---

## 📝 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Add `0.0.0.0/0` to Atlas IP whitelist |
| CORS error | Set `FRONTEND_URL` in backend variables |
| 404 on API calls | Ensure `/api` prefix in URLs |
| Build fails on Railway | Add `legacy-peer-deps=true` to `.npmrc` |
| Health check fails | Verify start command: `node src/server.js` |

---

## 📄 License

This project is created for educational purposes as part of a full-stack development assignment.

---

## 🙏 Acknowledgments

- MongoDB Atlas for free database hosting
- Railway for easy deployment
- React and Node.js communities

---

## 📧 Contact

**Developer:** Viaan Sharma  
**GitHub:** [viaansharma](https://github.com/viaansharma)  
**Project Link:** [https://github.com/viaansharma/taskflow](https://github.com/viaansharma/taskflow)

---

## 🎯 Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/viaansharma/taskflow.git
cd taskflow

# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm start

# Seed database
cd backend && node src/seed.js
```

---

**⭐ Star this repository if you find it useful!**
