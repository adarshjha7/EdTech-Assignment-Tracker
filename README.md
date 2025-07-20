---

# 🎓 EduTracker - Assignment Management System

A full-stack EdTech platform with role-based authentication for students and teachers. Built with React, Express, SQLite, and TypeScript.

## ✨ Features

### 🔐 Authentication
- JWT security with role-based access (Student/Teacher)
- Protected routes and secure password hashing

### 👨‍🏫 Teacher Features
- Create/view assignments with statistics
- Monitor submissions and track progress
- Download student files

### 👨‍🎓 Student Features
- Submit assignments (text + files)
- Track submission status
- Organized dashboard

## 🚀 Quick Start

```bash
git clone <repo-url>
cd EduTracker
npm install
npm run dev
```

## 📚 Tech Stack

| Frontend          | Backend         | Tools            |
|-------------------|-----------------|------------------|
| React 18          | Express.js      | Vite             |
| TypeScript        | SQLite          | Vitest           |
| TailwindCSS       | JWT             | Prettier         |
| Radix UI          | bcryptjs        |                  |

## 🗄️ Database Schema
```sql
-- Users, Assignments, and Submissions tables
-- (See full schema in original README)
```

## 🔗 API Highlights
- `POST /api/login` - JWT authentication
- `GET /api/assignments` - Role-filtered assignments
- `POST /api/assignments/:id/submit` - Student submissions

## 📁 Project Structure
```
client/     # React frontend
server/     # Express backend
shared/     # TypeScript types
uploads/    # Student files
```


## 🖼️ Screenshots
<img width="1920" height="1080" alt="Screenshot (121)" src="https://github.com/user-attachments/assets/aae83098-55b8-4210-a39f-c9f0a42509fe" />

   <img width="1920" height="1080" alt="Screenshot (122)" src="https://github.com/user-attachments/assets/6c440be3-9622-4e1d-bcb5-573a2a60d05c" />
<img width="1920" height="1080" alt="Screenshot (123)" src="https://github.com/user-attachments/assets/03010be4-a578-4779-808c-27ce98d8c737" />

<img width="1920" height="1080" alt="Screenshot (124)" src="https://github.com/user-attachments/assets/0b66c617-cc8b-4b33-9c14-c22634aeeef4" />

<img width="1920" height="1080" alt="Screenshot (125)" src="https://github.com/user-attachments/assets/a9c7476f-7433-4557-ba0e-c34072e8729f" />

