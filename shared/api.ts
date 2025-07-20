/**
 * Shared types between client and server for EdTech Assignment Tracker
 */

export interface User {
  id: number;
  email: string;
  role: "student" | "teacher";
  name: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  teacher_id: number;
  teacher_name?: string;
  created_at: string;
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  content: string;
  file_path?: string;
  submitted_at: string;
  grade?: number;
  feedback?: string;
  student_name?: string;
  student_email?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignupRequest {
  email: string;
  password: string;
  role: "student" | "teacher";
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  dueDate: string;
}

export interface SubmitAssignmentRequest {
  content: string;
  file?: File;
}

export interface ApiError {
  error: string;
}

export interface DemoResponse {
  message: string;
}

