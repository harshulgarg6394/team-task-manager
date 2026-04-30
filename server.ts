import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to ensure DB exists and get data
async function getDb() {
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    const initialDb = { users: [], projects: [], tasks: [] };
    await fs.writeFile(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
}

async function saveDb(db: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  
  // Auth
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name, role } = req.body;
    const db = await getDb();
    
    if (db.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      role: role || "member"
    };

    db.users.push(newUser);
    await saveDb(db);

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, email, name, role: newUser.role } });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const db = await getDb();
    const user = db.users.find((u: any) => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email, name: user.name, role: user.role } });
  });

  // Middleware for auth
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // Projects
  app.get("/api/projects", authenticate, async (req: any, res) => {
    const db = await getDb();
    if (req.user.role === "admin") {
      res.json(db.projects);
    } else {
      const projects = db.projects.filter((p: any) => 
        p.managerId === req.user.id || p.memberIds.includes(req.user.id)
      );
      res.json(projects);
    }
  });

  app.post("/api/projects", authenticate, async (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { name, description, memberIds } = req.body;
    const db = await getDb();
    const newProject = {
      id: uuidv4(),
      name,
      description,
      managerId: req.user.id,
      memberIds: memberIds || [],
      createdAt: new Date().toISOString()
    };
    db.projects.push(newProject);
    await saveDb(db);
    res.json(newProject);
  });

  // Tasks
  app.get("/api/tasks", authenticate, async (req: any, res) => {
    const db = await getDb();
    const { projectId } = req.query;
    
    let tasks = db.tasks;
    if (projectId) {
      tasks = tasks.filter((t: any) => t.projectId === projectId);
    }

    if (req.user.role !== "admin") {
      // Members see tasks in projects they belong to OR tasks assigned to them
      const myProjects = db.projects.filter((p: any) => 
        p.managerId === req.user.id || p.memberIds.includes(req.user.id)
      ).map((p: any) => p.id);
      
      tasks = tasks.filter((t: any) => myProjects.includes(t.projectId) || t.assigneeId === req.user.id);
    }

    res.json(tasks);
  });

  app.post("/api/tasks", authenticate, async (req: any, res) => {
    const { title, description, projectId, assigneeId, priority, dueDate } = req.body;
    const db = await getDb();

    // Check if project exists and user has access
    const project = db.projects.find((p: any) => p.id === projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (req.user.role !== "admin" && project.managerId !== req.user.id) {
      return res.status(403).json({ error: "Only admins or project managers can create tasks" });
    }

    const newTask = {
      id: uuidv4(),
      title,
      description,
      projectId,
      assigneeId,
      status: "todo",
      priority: priority || "medium",
      dueDate,
      createdAt: new Date().toISOString()
    };

    db.tasks.push(newTask);
    await saveDb(db);
    res.json(newTask);
  });

  app.patch("/api/tasks/:id", authenticate, async (req: any, res) => {
    const { id } = req.params;
    const updates = req.body; // title, description, status, priority, dueDate, assigneeId
    const db = await getDb();
    const taskIndex = db.tasks.findIndex((t: any) => t.id === id);

    if (taskIndex === -1) return res.status(404).json({ error: "Task not found" });

    const task = db.tasks[taskIndex];
    
    // Check if user has permission
    // Admin can update anything.
    // Assignee can update status.
    const project = db.projects.find((p: any) => p.id === task.projectId);
    
    const isAdmin = req.user.role === "admin";
    const isManager = project?.managerId === req.user.id;
    const isAssignee = task.assigneeId === req.user.id;

    if (!isAdmin && !isManager && !isAssignee) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Role-based field restrictions could be added here
    // For simplicity, we allow assignee to update status, and admin/manager to update anything
    if (!isAdmin && !isManager && isAssignee) {
        // Assignee only allowed to update status
        const allowedUpdates = ["status"];
        const extraFields = Object.keys(updates).filter(k => !allowedUpdates.includes(k));
        if (extraFields.length > 0) {
            return res.status(403).json({ error: "Assignees can only update task status" });
        }
    }

    db.tasks[taskIndex] = { ...task, ...updates, updatedAt: new Date().toISOString() };
    await saveDb(db);
    res.json(db.tasks[taskIndex]);
  });

  // Users lookup (for assignment)
  app.get("/api/users", authenticate, async (req, res) => {
    const db = await getDb();
    res.json(db.users.map((u: any) => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
