import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").notNull().default("employee"), // 'admin' or 'employee'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  completed: boolean("completed").notNull().default(false),
  completedBy: integer("completed_by").references(() => users.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const taskNotes = pgTable("task_notes", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  userId: integer("user_id").notNull().references(() => users.id),
  notes: text("notes").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const importantMessages = pgTable("important_messages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messageAcknowledgements = pgTable("message_acknowledgements", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => importantMessages.id),
  userId: integer("user_id").notNull().references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at").notNull().defaultNow(),
});

export const employeeNotes = pgTable("employee_notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  completed: true,
  completedBy: true,
  completedAt: true,
  createdAt: true,
});

export const insertTaskNoteSchema = createInsertSchema(taskNotes).omit({
  id: true,
  createdAt: true,
});

export const insertImportantMessageSchema = createInsertSchema(importantMessages).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeNoteSchema = createInsertSchema(employeeNotes).omit({
  id: true,
  resolved: true,
  resolvedAt: true,
  createdAt: true,
});

// Types
// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  taskNotes: many(taskNotes),
  messageAcknowledgements: many(messageAcknowledgements),
  employeeNotes: many(employeeNotes),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  completedByUser: one(users, {
    fields: [tasks.completedBy],
    references: [users.id],
  }),
  taskNotes: many(taskNotes),
}));

export const taskNotesRelations = relations(taskNotes, ({ one }) => ({
  task: one(tasks, {
    fields: [taskNotes.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskNotes.userId],
    references: [users.id],
  }),
}));

export const importantMessagesRelations = relations(importantMessages, ({ many }) => ({
  messageAcknowledgements: many(messageAcknowledgements),
}));

export const messageAcknowledgementsRelations = relations(messageAcknowledgements, ({ one }) => ({
  message: one(importantMessages, {
    fields: [messageAcknowledgements.messageId],
    references: [importantMessages.id],
  }),
  user: one(users, {
    fields: [messageAcknowledgements.userId],
    references: [users.id],
  }),
}));

export const employeeNotesRelations = relations(employeeNotes, ({ one }) => ({
  user: one(users, {
    fields: [employeeNotes.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TaskNote = typeof taskNotes.$inferSelect;
export type InsertTaskNote = z.infer<typeof insertTaskNoteSchema>;
export type ImportantMessage = typeof importantMessages.$inferSelect;
export type InsertImportantMessage = z.infer<typeof insertImportantMessageSchema>;
export type MessageAcknowledgement = typeof messageAcknowledgements.$inferSelect;
export type EmployeeNote = typeof employeeNotes.$inferSelect;
export type InsertEmployeeNote = z.infer<typeof insertEmployeeNoteSchema>;
