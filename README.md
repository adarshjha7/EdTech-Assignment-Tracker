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
<img width="1920" height="1080" alt="Screenshot (121)" src="https://github.com/user-attachments/assets/ca58c3a6-cefd-467c-8816-741002188799" />
<img width="1920" height="1080" alt="Screenshot (122)" src="https://github.com/user-attachments/assets/c5565f72-2c0a-4a32-8325-67adac67453a" />
<img width="1920" height="1080" alt="Screenshot (124)" src="https://github.com/user-attachments/assets/aafa1875-da28-4919-8ec6-31733941fa2e" />
<img width="1920" height="1080" alt="Screenshot (123)" src="https://github.com/user-attachments/assets/60a0e42b-71d9-41ef-b9b7-936ebdc4f335" />
<img width="1920" height="1080" alt="Screenshot (125)" src="https://github.com/user-attachments/assets/30443ce5-4638-4951-983c-4c438ca3eec3" />


   
