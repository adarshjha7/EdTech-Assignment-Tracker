import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { database } from "./database.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken,
  requireRole,
  AuthRequest,
} from "./auth.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({ storage });

export function createServer() {
  const app = express();

  // Initialize database
  database.init().catch(console.error);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static("uploads"));

  // Health check
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "EdTech Assignment Tracker API" });
  });

  // Auth routes
  app.post("/api/signup", async (req, res) => {
    try {
      const { email, password, role, name } = req.body;

      if (!email || !password || !role || !name) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (role !== "student" && role !== "teacher") {
        return res
          .status(400)
          .json({ error: "Role must be student or teacher" });
      }

      const existingUser = await database.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await hashPassword(password);
      const userId = await database.createUser(
        email,
        hashedPassword,
        role,
        name,
      );

      // const user = { id: userId, email, role, name };
      const user = {
        id: userId as number,
        email: email as string,
        role: role as "student" | "teacher",
        name: name as string,
      };

      const token = generateToken(user);

      res.status(201).json({ token, user });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const user = await database.getUserByEmail(email);
      if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user);
      const userResponse = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };

      res.json({ token, user: userResponse });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Assignment routes
  app.post(
    "/api/assignments",
    authenticateToken,
    requireRole("teacher"),
    async (req: AuthRequest, res) => {
      try {
        const { title, description, dueDate } = req.body;

        if (!title || !description || !dueDate) {
          return res
            .status(400)
            .json({ error: "Title, description, and due date are required" });
        }

        const assignmentId = await database.createAssignment(
          title,
          description,
          dueDate,
          req.user!.id,
        ) as number;

        const assignment = await database.getAssignmentById(assignmentId);
        res.status(201).json(assignment);
      } catch (error) {
        console.error("Create assignment error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  app.get(
    "/api/assignments",
    authenticateToken,
    async (req: AuthRequest, res) => {
      try {
        let assignments;
        if (req.user!.role === "teacher") {
          assignments = await database.getAssignmentsByTeacher(req.user!.id);
        } else {
          assignments = await database.getAllAssignments();
        }
        res.json(assignments);
      } catch (error) {
        console.error("Get assignments error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  app.get(
    "/api/assignments/:id",
    authenticateToken,
    async (req: AuthRequest, res) => {
      try {
        const assignment = await database.getAssignmentById(
          parseInt(req.params.id),
        );
        if (!assignment) {
          return res.status(404).json({ error: "Assignment not found" });
        }
        res.json(assignment);
      } catch (error) {
        console.error("Get assignment error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  app.post(
    "/api/assignments/:id/submit",
    authenticateToken,
    requireRole("student"),
    upload.single("file"),
    async (req: AuthRequest, res) => {
      try {
        const { content } = req.body;
        const assignmentId = parseInt(req.params.id);

        if (!content) {
          return res
            .status(400)
            .json({ error: "Submission content is required" });
        }

        const assignment = await database.getAssignmentById(assignmentId);
        if (!assignment) {
          return res.status(404).json({ error: "Assignment not found" });
        }

        const filePath = req.file ? req.file.path : undefined;
        const submissionId = await database.submitAssignment(
          assignmentId,
          req.user!.id,
          content,
          filePath,
        );

        res
          .status(201)
          .json({
            id: submissionId,
            message: "Assignment submitted successfully",
          });
      } catch (error) {
        console.error("Submit assignment error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  app.get(
    "/api/assignments/:id/submissions",
    authenticateToken,
    requireRole("teacher"),
    async (req: AuthRequest, res) => {
      try {
        const assignmentId = parseInt(req.params.id);
        const assignment = await database.getAssignmentById(assignmentId);

        if (!assignment) {
          return res.status(404).json({ error: "Assignment not found" });
        }

        if (assignment.teacher_id !== req.user!.id) {
          return res
            .status(403)
            .json({
              error: "You can only view submissions for your assignments",
            });
        }

        const submissions =
          await database.getSubmissionsByAssignment(assignmentId);
        res.json(submissions);
      } catch (error) {
        console.error("Get submissions error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  app.get(
    "/api/assignments/:id/my-submission",
    authenticateToken,
    requireRole("student"),
    async (req: AuthRequest, res) => {
      try {
        const assignmentId = parseInt(req.params.id);
        const submission = await database.getStudentSubmission(
          assignmentId,
          req.user!.id,
        );

        if (!submission) {
          return res.status(404).json({ error: "No submission found" });
        }

        res.json(submission);
      } catch (error) {
        console.error("Get student submission error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  // User profile
  app.get("/api/me", authenticateToken, async (req: AuthRequest, res) => {
    res.json(req.user);
  });

  return app;
}
