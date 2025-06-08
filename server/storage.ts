import { 
  users, tasks, taskNotes, importantMessages, messageAcknowledgements, employeeNotes,
  type User, type InsertUser, type Task, type InsertTask, 
  type TaskNote, type InsertTaskNote, type ImportantMessage, 
  type InsertImportantMessage, type MessageAcknowledgement,
  type EmployeeNote, type InsertEmployeeNote
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Task operations
  getAllTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  completeTask(id: number, userId: number): Promise<Task | undefined>;

  // Task notes operations
  getTaskNotes(taskId: number): Promise<TaskNote[]>;
  createTaskNote(note: InsertTaskNote): Promise<TaskNote>;
  updateTaskNote(id: number, notes: string): Promise<TaskNote | undefined>;

  // Important messages operations
  getAllImportantMessages(): Promise<ImportantMessage[]>;
  getActiveImportantMessages(): Promise<ImportantMessage[]>;
  createImportantMessage(message: InsertImportantMessage): Promise<ImportantMessage>;
  updateImportantMessage(id: number, message: Partial<InsertImportantMessage>): Promise<ImportantMessage | undefined>;
  deleteImportantMessage(id: number): Promise<boolean>;

  // Message acknowledgements operations
  acknowledgeMessage(messageId: number, userId: number): Promise<MessageAcknowledgement>;
  getMessageAcknowledgements(messageId: number): Promise<MessageAcknowledgement[]>;
  getUserAcknowledgements(userId: number): Promise<MessageAcknowledgement[]>;

  // Employee notes operations
  getAllEmployeeNotes(): Promise<EmployeeNote[]>;
  getUnresolvedEmployeeNotes(): Promise<EmployeeNote[]>;
  createEmployeeNote(note: InsertEmployeeNote): Promise<EmployeeNote>;
  resolveEmployeeNote(id: number): Promise<EmployeeNote | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private taskNotes: Map<number, TaskNote>;
  private importantMessages: Map<number, ImportantMessage>;
  private messageAcknowledgements: Map<number, MessageAcknowledgement>;
  private employeeNotes: Map<number, EmployeeNote>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.taskNotes = new Map();
    this.importantMessages = new Map();
    this.messageAcknowledgements = new Map();
    this.employeeNotes = new Map();
    this.currentId = 1;

    // Initialize with admin user
    this.createUser({
      username: "admin",
      password: "Thecure93",
      email: "admin@company.com",
      role: "admin"
    });

    // Initialize with sample employee
    this.createUser({
      username: "employee",
      password: "password123",
      email: "employee@company.com",
      role: "employee"
    });

    // Initialize with sample tasks
    this.createTask({
      title: "Clean reception area and lobby",
      description: "Clean and organize the reception area and main lobby",
      imageUrl: null
    });

    this.createTask({
      title: "Stock coffee supplies",
      description: "Restock coffee, tea, and related supplies in the kitchen",
      imageUrl: null
    });

    this.createTask({
      title: "Update inventory spreadsheet",
      description: "Update the daily inventory tracking spreadsheet",
      imageUrl: null
    });

    // Initialize with sample important message
    this.createImportantMessage({
      title: "Shift Completion Reminder",
      content: "Remember to complete all tasks before end of shift!",
      active: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email || null,
      role: insertUser.role || "employee",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Task operations
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentId++;
    const task: Task = {
      id,
      title: insertTask.title,
      description: insertTask.description || null,
      imageUrl: insertTask.imageUrl || null,
      completed: false,
      completedBy: null,
      completedAt: null,
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updateData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async completeTask(id: number, userId: number): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = {
      ...task,
      completed: true,
      completedBy: userId,
      completedAt: new Date()
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  // Task notes operations
  async getTaskNotes(taskId: number): Promise<TaskNote[]> {
    return Array.from(this.taskNotes.values()).filter(note => note.taskId === taskId);
  }

  async createTaskNote(insertNote: InsertTaskNote): Promise<TaskNote> {
    const id = this.currentId++;
    const note: TaskNote = {
      ...insertNote,
      id,
      createdAt: new Date()
    };
    this.taskNotes.set(id, note);
    return note;
  }

  async updateTaskNote(id: number, notes: string): Promise<TaskNote | undefined> {
    const note = this.taskNotes.get(id);
    if (!note) return undefined;
    
    const updatedNote = { ...note, notes };
    this.taskNotes.set(id, updatedNote);
    return updatedNote;
  }

  // Important messages operations
  async getAllImportantMessages(): Promise<ImportantMessage[]> {
    return Array.from(this.importantMessages.values());
  }

  async getActiveImportantMessages(): Promise<ImportantMessage[]> {
    return Array.from(this.importantMessages.values()).filter(msg => msg.active);
  }

  async createImportantMessage(insertMessage: InsertImportantMessage): Promise<ImportantMessage> {
    const id = this.currentId++;
    const message: ImportantMessage = {
      id,
      title: insertMessage.title,
      content: insertMessage.content,
      active: insertMessage.active ?? true,
      createdAt: new Date()
    };
    this.importantMessages.set(id, message);
    return message;
  }

  async updateImportantMessage(id: number, updateData: Partial<InsertImportantMessage>): Promise<ImportantMessage | undefined> {
    const message = this.importantMessages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, ...updateData };
    this.importantMessages.set(id, updatedMessage);
    return updatedMessage;
  }

  async deleteImportantMessage(id: number): Promise<boolean> {
    return this.importantMessages.delete(id);
  }

  // Message acknowledgements operations
  async acknowledgeMessage(messageId: number, userId: number): Promise<MessageAcknowledgement> {
    const id = this.currentId++;
    const acknowledgement: MessageAcknowledgement = {
      id,
      messageId,
      userId,
      acknowledgedAt: new Date()
    };
    this.messageAcknowledgements.set(id, acknowledgement);
    return acknowledgement;
  }

  async getMessageAcknowledgements(messageId: number): Promise<MessageAcknowledgement[]> {
    return Array.from(this.messageAcknowledgements.values()).filter(ack => ack.messageId === messageId);
  }

  async getUserAcknowledgements(userId: number): Promise<MessageAcknowledgement[]> {
    return Array.from(this.messageAcknowledgements.values()).filter(ack => ack.userId === userId);
  }

  // Employee notes operations
  async getAllEmployeeNotes(): Promise<EmployeeNote[]> {
    return Array.from(this.employeeNotes.values());
  }

  async getUnresolvedEmployeeNotes(): Promise<EmployeeNote[]> {
    return Array.from(this.employeeNotes.values()).filter(note => !note.resolved);
  }

  async createEmployeeNote(insertNote: InsertEmployeeNote): Promise<EmployeeNote> {
    const id = this.currentId++;
    const note: EmployeeNote = {
      ...insertNote,
      id,
      resolved: false,
      resolvedAt: null,
      createdAt: new Date()
    };
    this.employeeNotes.set(id, note);
    return note;
  }

  async resolveEmployeeNote(id: number): Promise<EmployeeNote | undefined> {
    const note = this.employeeNotes.get(id);
    if (!note) return undefined;
    
    const updatedNote = {
      ...note,
      resolved: true,
      resolvedAt: new Date()
    };
    this.employeeNotes.set(id, updatedNote);
    return updatedNote;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }

  async completeTask(id: number, userId: number): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({
        completed: true,
        completedBy: userId,
        completedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async getTaskNotes(taskId: number): Promise<TaskNote[]> {
    return await db.select().from(taskNotes).where(eq(taskNotes.taskId, taskId));
  }

  async createTaskNote(insertNote: InsertTaskNote): Promise<TaskNote> {
    const [note] = await db
      .insert(taskNotes)
      .values(insertNote)
      .returning();
    return note;
  }

  async updateTaskNote(id: number, notes: string): Promise<TaskNote | undefined> {
    const [note] = await db
      .update(taskNotes)
      .set({ notes })
      .where(eq(taskNotes.id, id))
      .returning();
    return note || undefined;
  }

  async getAllImportantMessages(): Promise<ImportantMessage[]> {
    return await db.select().from(importantMessages);
  }

  async getActiveImportantMessages(): Promise<ImportantMessage[]> {
    return await db.select().from(importantMessages).where(eq(importantMessages.active, true));
  }

  async createImportantMessage(insertMessage: InsertImportantMessage): Promise<ImportantMessage> {
    const [message] = await db
      .insert(importantMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async updateImportantMessage(id: number, updateData: Partial<InsertImportantMessage>): Promise<ImportantMessage | undefined> {
    const [message] = await db
      .update(importantMessages)
      .set(updateData)
      .where(eq(importantMessages.id, id))
      .returning();
    return message || undefined;
  }

  async deleteImportantMessage(id: number): Promise<boolean> {
    const result = await db.delete(importantMessages).where(eq(importantMessages.id, id));
    return result.rowCount > 0;
  }

  async acknowledgeMessage(messageId: number, userId: number): Promise<MessageAcknowledgement> {
    const [acknowledgement] = await db
      .insert(messageAcknowledgements)
      .values({ messageId, userId })
      .returning();
    return acknowledgement;
  }

  async getMessageAcknowledgements(messageId: number): Promise<MessageAcknowledgement[]> {
    return await db.select().from(messageAcknowledgements).where(eq(messageAcknowledgements.messageId, messageId));
  }

  async getUserAcknowledgements(userId: number): Promise<MessageAcknowledgement[]> {
    return await db.select().from(messageAcknowledgements).where(eq(messageAcknowledgements.userId, userId));
  }

  async getAllEmployeeNotes(): Promise<EmployeeNote[]> {
    return await db.select().from(employeeNotes);
  }

  async getUnresolvedEmployeeNotes(): Promise<EmployeeNote[]> {
    return await db.select().from(employeeNotes).where(eq(employeeNotes.resolved, false));
  }

  async createEmployeeNote(insertNote: InsertEmployeeNote): Promise<EmployeeNote> {
    const [note] = await db
      .insert(employeeNotes)
      .values(insertNote)
      .returning();
    return note;
  }

  async resolveEmployeeNote(id: number): Promise<EmployeeNote | undefined> {
    const [note] = await db
      .update(employeeNotes)
      .set({
        resolved: true,
        resolvedAt: new Date()
      })
      .where(eq(employeeNotes.id, id))
      .returning();
    return note || undefined;
  }
}

export const storage = new DatabaseStorage();
