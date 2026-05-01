# 🗂️ TaskFlow — Team Task Manager

A full-stack **Team Task Manager** built with **React + Node.js + MongoDB**.  
Supports role-based access control, kanban boards, real-time task tracking, and a rich analytics dashboard.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JWT-based signup & login with bcrypt password hashing |
| 👥 **Role-Based Access** | Admin creates projects & tasks; Members update task status |
| 📁 **Project Management** | Create projects, add/remove team members by email |
| ✅ **Task Tracking** | Kanban board with Todo / In Progress / Done columns |
| 📊 **Dashboard** | Stats, completion chart, overdue alerts, recent tasks |
| 🔴 **Overdue Detection** | Automatic overdue highlighting with deadline tracking |
| 🛡️ **Security** | Helmet, rate limiting, MongoDB sanitization |
| 📱 **Responsive** | Works on mobile, tablet, and desktop |

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Auth**: JSON Web Tokens (JWT) + bcryptjs
- **Validation**: express-validator
- **Security**: helmet, express-mongo-sanitize, express-rate-limit

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: TailwindCSS v4 + Custom CSS
- **Date Handling**: date-fns

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| `POST` | `/signup` | Public | Create account |
| `POST` | `/login` | Public | Login & get token |
| `GET`  | `/me` | Protected | Get current user |

### Projects (`/api/projects`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| `POST` | `/` | Admin | Create project |
| `GET`  | `/` | All | List projects |
| `GET`  | `/:id` | Member/Admin | Get project details |
| `POST` | `/:id/members` | Admin | Add member by email |
| `DELETE` | `/:id/members/:memberId` | Admin | Remove member |
| `DELETE` | `/:id` | Admin | Delete project + tasks |

### Tasks (`/api/tasks`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| `POST` | `/` | Admin | Create task |
| `GET`  | `/` | All | List tasks (filtered by role) |
| `GET`  | `/:id` | All | Get task detail |
| `PUT`  | `/:id` | Admin/Assignee | Update task |
| `DELETE` | `/:id` | Admin | Delete task |

### Dashboard (`/api/dashboard`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| `GET` | `/` | All | Stats + recent + overdue tasks |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/task-manager.git
cd task-manager
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
cp .env.example .env
# Leave VITE_API_URL empty for local dev (Vite proxy handles it)
npm install
npm run dev
```

The app will be at **http://localhost:5173** and backend at **http://localhost:5000**.

---

## 🚀 Deployment on Railway

### Backend
1. Push code to GitHub
2. Create new Railway project → **Deploy from GitHub**
3. Select the `/backend` directory as root
4. Set environment variables in Railway dashboard:
   ```
   MONGO_URI=your_atlas_uri
   JWT_SECRET=your_long_random_secret
   JWT_EXPIRES_IN=7d
   CLIENT_URL=https://your-frontend-url.railway.app
   ADMIN_SIGNUP_CODE=your_admin_code
   NODE_ENV=production
   ```
5. Railway auto-runs `npm start` (uses `node server.js`)

### Frontend
1. Create a second Railway service → **Deploy from GitHub** → root: `/frontend`
2. Set build command: `npm run build`
3. Set start command: `npm run start`
4. Set environment variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

---

## 🔑 Demo Credentials

> These only work if you run the seed script: `node seed.js` inside `/backend`

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@demo.com` | `password123` |
| **Member** | `member@demo.com` | `password123` |

Admin signup code (for creating new admin accounts): `ADMIN2024`

---

## 📁 Project Structure

```
task-manager/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Route handlers (auth, projects, tasks, dashboard)
│   ├── middleware/       # JWT auth + adminOnly guards
│   ├── models/          # Mongoose schemas (User, Project, Task)
│   ├── routes/          # Express routers
│   ├── server.js        # App entry point
│   ├── seed.js          # Demo data seeder
│   └── .env.example     # Environment template
└── frontend/
    ├── src/
    │   ├── components/  # Layout, Sidebar, Navbar, StatCard, Toast
    │   ├── context/     # AuthContext
    │   ├── pages/       # Login, Signup, Dashboard, Projects, TaskBoard
    │   └── utils/       # Axios API client
    └── vite.config.js   # Dev server with /api proxy
```

---

## 🔐 Security Notes

- **Passwords** are hashed with bcrypt (12 salt rounds)
- **JWT tokens** expire in 7 days by default
- **Admin accounts** require a secret signup code
- **Rate limiting** on auth endpoints (20 requests/15 min)
- **NoSQL injection** prevented via `express-mongo-sanitize`
- **HTTP headers** hardened via `helmet`
- **Input validation** on all endpoints via `express-validator`

---

## 📄 License

MIT — free to use for personal and commercial projects.