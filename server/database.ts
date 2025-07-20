import sqlite3 from "sqlite3";
import { promisify } from "util";

const DATABASE_PATH = "./edtech.db";

export class Database {
  private db: sqlite3.Database;
  private runAsync: (sql: string, params?: any[]) => Promise<any>;
  private allAsync: (sql: string, params?: any[]) => Promise<any[]>;
  private getAsync: (sql: string, params?: any[]) => Promise<any>;

  constructor() {
    this.db = new sqlite3.Database(DATABASE_PATH);
    this.runAsync = promisify(this.db.run.bind(this.db));
    this.allAsync = promisify(this.db.all.bind(this.db));
    this.getAsync = promisify(this.db.get.bind(this.db));
    // Enable WAL mode for better concurrency
    this.db.run("PRAGMA journal_mode = WAL;");
    this.db.run("PRAGMA foreign_keys = ON;");
  }

  async init() {
    await this.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.runAsync(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        due_date DATETIME NOT NULL,
        teacher_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users (id)
      )
    `);

    await this.runAsync(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        file_path TEXT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        grade INTEGER CHECK (grade >= 0 AND grade <= 100),
        feedback TEXT,
        FOREIGN KEY (assignment_id) REFERENCES assignments (id),
        FOREIGN KEY (student_id) REFERENCES users (id),
        UNIQUE (assignment_id, student_id)
      )
    `);
  }

  async createUser(
    email: string,
    password: string,
    role: "student" | "teacher",
    name: string,
  ) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)",
        [email, password, role, name],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        },
      );
    });
  }

  async getUserByEmail(email: string) {
    return await this.getAsync("SELECT * FROM users WHERE email = ?", [email]);
  }

  async getUserById(id: number) {
    return await this.getAsync("SELECT * FROM users WHERE id = ?", [id]);
  }

  async createAssignment(
    title: string,
    description: string,
    dueDate: string,
    teacherId: number,
  ) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO assignments (title, description, due_date, teacher_id) VALUES (?, ?, ?, ?)",
        [title, description, dueDate, teacherId],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        },
      );
    });
  }

  async getAssignmentsByTeacher(teacherId: number) {
    return await this.allAsync(
      "SELECT * FROM assignments WHERE teacher_id = ? ORDER BY created_at DESC",
      [teacherId],
    );
  }

  async getAllAssignments() {
    return await this.allAsync(`
      SELECT a.*, u.name as teacher_name 
      FROM assignments a 
      JOIN users u ON a.teacher_id = u.id 
      ORDER BY a.created_at DESC
    `);
  }

  async getAssignmentById(id: number) {
    return await this.getAsync(
      `
      SELECT a.*, u.name as teacher_name 
      FROM assignments a 
      JOIN users u ON a.teacher_id = u.id 
      WHERE a.id = ?
    `,
      [id],
    );
  }

  async submitAssignment(
    assignmentId: number,
    studentId: number,
    content: string,
    filePath?: string,
  ) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT OR REPLACE INTO submissions (assignment_id, student_id, content, file_path) VALUES (?, ?, ?, ?)",
        [assignmentId, studentId, content, filePath],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        },
      );
    });
  }

  async getSubmissionsByAssignment(assignmentId: number) {
    return await this.allAsync(
      `
      SELECT s.*, u.name as student_name, u.email as student_email
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      WHERE s.assignment_id = ?
      ORDER BY s.submitted_at DESC
    `,
      [assignmentId],
    );
  }

  async getStudentSubmission(assignmentId: number, studentId: number) {
    return await this.getAsync(
      "SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?",
      [assignmentId, studentId],
    );
  }

  close() {
    this.db.close();
  }
}

export const database = new Database();
