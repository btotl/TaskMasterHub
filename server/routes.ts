import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertUserSchema, insertImportantMessageSchema, insertEmployeeNoteSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Store user session
      (req.session as any).user = { id: user.id, username: user.username, role: user.role };
      res.json({ user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const user = (req.session as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json({ user });
  });

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!(req.session as any).user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  // Middleware to check admin role
  const requireAdmin = (req: any, res: any, next: any) => {
    const user = (req.session as any).user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  };

  // Task routes
  app.get('/api/tasks', requireAuth, async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  app.post('/api/tasks', requireAdmin, upload.single('image'), async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      if (req.file) {
        taskData.imageUrl = `/uploads/${req.file.filename}`;
      }
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create task' });
    }
  });

  app.put('/api/tasks/:id', requireAdmin, upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      if (req.file) {
        updateData.imageUrl = `/uploads/${req.file.filename}`;
      }
      const task = await storage.updateTask(id, updateData);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update task' });
    }
  });

  app.delete('/api/tasks/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });

  app.post('/api/tasks/:id/complete', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req.session as any).user.id;
      const task = await storage.completeTask(id, userId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Failed to complete task' });
    }
  });

  // Task notes routes
  app.get('/api/tasks/:id/notes', requireAuth, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const notes = await storage.getTaskNotes(taskId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch task notes' });
    }
  });

  app.post('/api/tasks/:id/notes', requireAuth, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = (req.session as any).user.id;
      const { notes } = req.body;
      
      const note = await storage.createTaskNote({
        taskId,
        userId,
        notes
      });
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create task note' });
    }
  });

  // Important messages routes
  app.get('/api/messages', requireAuth, async (req, res) => {
    try {
      const messages = await storage.getActiveImportantMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.get('/api/messages/all', requireAdmin, async (req, res) => {
    try {
      const messages = await storage.getAllImportantMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch all messages' });
    }
  });

  app.post('/api/messages', requireAdmin, async (req, res) => {
    try {
      const messageData = insertImportantMessageSchema.parse(req.body);
      const message = await storage.createImportantMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create message' });
    }
  });

  app.put('/api/messages/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.updateImportantMessage(id, req.body);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update message' });
    }
  });

  app.delete('/api/messages/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteImportantMessage(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete message' });
    }
  });

  // Message acknowledgement routes
  app.post('/api/messages/:id/acknowledge', requireAuth, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const userId = (req.session as any).user.id;
      const acknowledgement = await storage.acknowledgeMessage(messageId, userId);
      res.json(acknowledgement);
    } catch (error) {
      res.status(500).json({ message: 'Failed to acknowledge message' });
    }
  });

  app.get('/api/messages/:id/acknowledgements', requireAdmin, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const acknowledgements = await storage.getMessageAcknowledgements(messageId);
      res.json(acknowledgements);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch acknowledgements' });
    }
  });

  // Employee notes routes
  app.get('/api/employee-notes', requireAdmin, async (req, res) => {
    try {
      const notes = await storage.getAllEmployeeNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch employee notes' });
    }
  });

  app.get('/api/employee-notes/unresolved', requireAdmin, async (req, res) => {
    try {
      const notes = await storage.getUnresolvedEmployeeNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch unresolved notes' });
    }
  });

  app.post('/api/employee-notes', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).user.id;
      const { content } = req.body;
      const note = await storage.createEmployeeNote({ userId, content });
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create employee note' });
    }
  });

  app.post('/api/employee-notes/:id/resolve', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.resolveEmployeeNote(id);
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: 'Failed to resolve note' });
    }
  });

  // User management routes (admin only)
  app.get('/api/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't send passwords
      const safeUsers = users.map(user => ({
        ...user,
        password: undefined
      }));
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.post('/api/users', requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ message: 'Failed to create user' });
    }
  });

  app.put('/api/users/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.updateUser(id, req.body);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ message: 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
