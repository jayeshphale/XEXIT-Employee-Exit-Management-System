# XEXIT – Employee Resignation & Exit Interview Management System

XEXIT is a modern, enterprise-ready, full-stack **Employee Resignation and Exit Interview Management System** designed to streamline offboarding operations. By centralizing the exit workflow, XEXIT provides automated validation, real-time tracking, structured communication, and data-driven insights to both employees and HR leaders.

---

## 🚀 Core Features

### 👤 Employee Self-Service Workspace
- **Secure Registration & Login**: Single-pane registration and token-based authenticated login.
- **Resignation File Submission**: File resignation with a comprehensive workflow, including:
  - Last Working Day (LWD) selection.
  - Notice period calculation.
  - Resignation reason and detailed notes.
- **Robust Date Validation**: Automated checks verifying selected LWD:
  - **Weekend Check**: Rejects Saturday/Sunday selections.
  - **Public Holiday Check**: Rejects holiday dates (powered by Calendarific API with local offline fallback).
- **One Active File Guard**: Restricts employees to a single active resignation in the pipeline.
- **Exit Interview Hub**: Once HR approves a resignation, employees unlock access to the multi-question Exit Interview form to share confidential feedback. Built-in mechanisms prevent duplicate exit responses.

### 💼 HR Admin Control Panel (Console)
- **Centralized Dashboard**: Track offboarding metrics, active requests, overall feedback ratings, and exit patterns.
- **Resignation Grid**: Search, sort, and filter resignations by employee name, status, and departure dates.
- **Conclude Resignations**: Process pending resignations directly:
  - **Approve**: Lock in departures, optionally modify the final Last Working Date, and write official remarks.
  - **Reject**: Decline requests with explicit HR remarks.
- **Real-Time Exit Reviews**: View and analyze confidential exit interview feedback from approved employee offboardings. HR can query, but is strictly prohibited from editing or deleting feedback responses.

---

## 🎨 System Architecture

XEXIT is built using the **MERN (MongoDB, Express, React, Node.js)** stack with strict compliance to **SOLID**, **DRY**, and **Clean Architecture** design principles.

```
┌────────────────────────────────────────────────────────┐
│                      Web Client                        │
│               React + Vite + Tailwind CSS              │
└───────────────────────────┬────────────────────────────┘
                            │ (HTTPS / JSON + JWT)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Express.js Server                    │
│    Helmet, CORS, Rate Limiting, Authenticate Middleware│
└──────┬────────────────────┬────────────────────┬───────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌────────────────┐
│  Mongoose/DB │    │ Calendarific │    │   Nodemailer   │
│ MongoDB Atlas│    │ Holiday API  │    │ Email Service  │
└──────────────┘    └──────────────┘    └────────────────┘
```

### Key Architectural Highlights
- **Service Layer Pattern**: Separate controller layers from data-access layers via a centralized repository system (`dbStore.ts`).
- **Graceful DB Fallbacks**: Connects automatically to Cloud MongoDB Atlas when configured, and gracefully falls back to a pre-seeded, high-fidelity in-memory/JSON mock database in standard development containers.
- **Secure Auth Pipeline**: JWT is signed server-side using HS256 encryption. Frontend clients store the credentials securely in `localStorage` and inject them via Axios interceptors.

---

## 📂 Project Structure

```
├── /server                 # Backend API Application
│   ├── /config             # Configuration (Database connection, pooling)
│   ├── /controllers        # Route handlers (Business logic & API layer)
│   ├── /middleware         # Express Request filters (Auth, JWT, Role Access)
│   ├── /models             # Database Schemas & Mongoose definitions
│   ├── /routes             # Modular Express Router bindings
│   ├── /services           # Core infrastructure services (Mailer, Calendarific)
│   ├── app.ts              # API Application setup and middlewares
│   ├── dbStore.ts          # Centralized data repository and mock fallback
│   └── server.ts           # Production server launch and static file mapping
│
├── /src                    # Frontend SPA (React + TypeScript)
│   ├── /api                # Axios endpoints, instances, and interceptors
│   ├── /components         # UI Layouts, drawer menus, theme controllers
│   ├── /pages              # Screen views (Dashboard, Resignation, Profile, Login)
│   ├── /store              # Redux State Management toolkit slices
│   ├── App.tsx             # Application routing mapping
│   ├── main.tsx            # App bootstrap and global configurations
│   ├── theme.ts            # Theme palettes (Support light and dark modes)
│   └── types.ts            # Type safety definitions & Interfaces
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Redux Toolkit, React Router v7, Material-UI, Lucide-Icons, Tailwind CSS, React-Hot-Toast
- **Backend**: Express, TypeScript, tsx, esbuild
- **Database**: MongoDB & Mongoose ORM
- **Security**: JWT (jsonwebtoken), bcryptjs, Helmet, Express-Rate-Limit, CORS
- **Third-Party APIs**: Calendarific, Nodemailer (Gmail integration)

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root of the project. Reference the variables defined in `.env.example`:

```env
# Server Ingress Settings
PORT=3000

# Security Credentials
JWT_SECRET="your-secure-jwt-key"

# Database Configuration (MongoDB Atlas Cluster URL)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/xexit"

# Holiday Validation API Key (From calendarific.com)
CALENDARIFIC_API_KEY="your-calendarific-key"

# Mail Configuration (Gmail App Password)
EMAIL_USER="your-corporate-email@gmail.com"
EMAIL_PASS="your-gmail-app-password"

# Frontend Integration URL (Only needed for split SPA hostings)
VITE_API_BASE_URL=""
```

---

## 💻 Running Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A free MongoDB Atlas cluster or a local MongoDB database instance

### 2. Installation
Clone the repository and install all dependencies:
```bash
# Clone the repository
git clone https://github.com/yourusername/xexit.git
cd xexit

# Install packages
npm install
```

### 3. Startup and Live Preview
Start the Express server and Vite builder in concurrent mode:
```bash
npm run dev
```
The server will boot up and bind to **http://localhost:3000** (default). Open this URL in your web browser to view and test the application live.

---

## 🔌 API Endpoints Contract

### Authentication Router (`/api/auth`)
- `POST /api/auth/register` - Registers a new Employee profile.
- `POST /api/auth/login` - Authenticates credentials. Supports credentials-based Employee login and direct HR fixed Admin login (`admin` / `admin`).
- `GET /api/auth/me` - Retreives current user session metadata.

### Employee Router (`/api/user`)
- `PUT /api/user/profile` - Updates employee contact fields.
- `PUT /api/user/change-password` - Changes employee passwords securely.
- `POST /api/user/resign` - Submits a new resignation request (validates weekend, holiday, and active-status restrictions).
- `GET /api/user/resign` - Retrieves all historical resignation requests submitted by the logged-in employee.
- `POST /api/user/responses` - Submits Exit Interview feedback. (Only accessible if resignation status is approved; blocks duplicate entries).
- `GET /api/user/responses/resignation/:resignationId` - Gets exit responses matching a particular resignation file.

### Admin Router (`/api/admin`)
- `GET /api/admin/resignations` - Retrieves all employee resignation records. Supports page pagination, search, status filters, and sorting.
- `PUT /api/admin/conclude_resignation` - Approves or Rejects a resignation. Supports modifying final Last Working Dates and logging remarks.
- `GET /api/admin/exit_responses` - Retrieves completed Exit Interview feedback records.

---

## 🔔 Email Notification Flow

XEXIT comes configured with **Nodemailer** integration. Automatic HTML emails are fired under the following business scenarios:

1. **Submission Notification**: Sent to the employee and HR upon filing a new resignation.
2. **Approval Update**: Sent to the employee immediately when HR approves their resignation, featuring the official/modified Last Working Date, HR remarks, and instructions to fill out the Exit Interview.
3. **Rejection Update**: Sent to the employee immediately when HR rejects the file, containing the explanation remarks from HR.
4. **Rescheduling Update**: Sent to the employee if the HR modifies their final Last Working Date post-approval.

---

## 🌐 Production Deployment

### 1. Deploying Backend (e.g., Render / Fly.io / Heroku)
- Log in to your Render Dashboard, click **New Web Service**, and link your GitHub repository.
- Configure settings:
  - **Environment**: Node
  - **Build Command**: `npm run build`
  - **Start Command**: `npm run start`
- Define the following Environment variables in Render's configuration pane:
  - `PORT=10000` (Render binds this dynamically)
  - `NODE_ENV=production`
  - `MONGODB_URI` (MongoDB Atlas link)
  - `JWT_SECRET`
  - `CALENDARIFIC_API_KEY`
  - `EMAIL_USER` / `EMAIL_PASS`

### 2. Deploying Frontend (e.g., Vercel / Netlify / Cloudflare Pages)
- Connect your GitHub repository to Vercel.
- Configure settings:
  - **Build Command**: `vite build`
  - **Output Directory**: `dist`
- Configure Environment variables:
  - `VITE_API_BASE_URL` - Set to your deployed Render URL (e.g., `https://xexit-api.onrender.com`).

---

## 🔒 Security Best Practices
- **Helmet**: Enforces standard HTTP security response headers.
- **Rate Limiting**: Defends the API endpoints against bruteforce/DDoS vector abuses.
- **JWT Cryptography**: Fully verified server-side.
- **Password Protection**: Salted and encrypted using BCrypt hash cycles (strength 10).
- **CORS Policies**: Explicitly scoped.
- **Database Protections**: Mongoose type schemas, structured relationship integrity, and input validation layers protect the database against NoSQL injection vectors.

---

## 📄 License & Contact
This project is licensed under the MIT License. Developed for Crio offboarding evaluations and enterprise ready.

- **Author**: Enterprise Team
- **GitHub**: [https://github.com/yourusername](https://github.com/yourusername)
- **LinkedIn**: [https://linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
