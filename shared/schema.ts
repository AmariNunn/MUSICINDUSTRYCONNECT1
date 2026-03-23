import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  pkaName: text("pka_name"), // Professional Known As name
  email: text("email").notNull().unique(),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth"),
  password: text("password").notNull(),
  profession: text("profession").array().notNull().default([]), // Max 2
  genre: text("genre").array().notNull().default([]), // Max 2
  location: text("location"), // City, ST, Country
  bio: text("bio"),
  avatar: text("avatar").notNull().default(""),
  verified: boolean("verified").notNull().default(false),
  memberLevel: text("member_level").notNull().default("Gold"), // Gold (Free) or Platinum (Paid)
  
  // Profile visibility settings
  showPicture: boolean("show_picture").notNull().default(true),
  showEmail: boolean("show_email").notNull().default(false),
  showPhone: boolean("show_phone").notNull().default(false),
  showDateOfBirth: boolean("show_dob").notNull().default(false),
  usePkaAsMain: boolean("use_pka_as_main").notNull().default(false),
  
  // Social links
  website: text("website"),
  socialInstagram: text("social_instagram"),
  socialTwitter: text("social_twitter"),
  socialFacebook: text("social_facebook"),
  socialTiktok: text("social_tiktok"),
  socialYoutube: text("social_youtube"),
  socialSpotify: text("social_spotify"),
  socialAppleMusic: text("social_apple_music"),
  socialSoundcloud: text("social_soundcloud"),
  
  // Music links
  musicSpotify: text("music_spotify"),
  musicAppleMusic: text("music_apple_music"),
  musicSoundcloud: text("music_soundcloud"),
  musicBandcamp: text("music_bandcamp"),
  
  // Stats
  followers: integer("followers").notNull().default(0),
  following: integer("following").notNull().default(0),
  projects: integer("projects").notNull().default(0),
  collaborations: integer("collaborations").notNull().default(0),
  gigs: integer("gigs").notNull().default(0),
  posts: integer("posts").notNull().default(0),
  eventsAttended: integer("events_attended").notNull().default(0),
  connections: integer("connections").notNull().default(0),
  favorites: integer("favorites").notNull().default(0),
  
  skills: text("skills").array().notNull().default([]),
  recentWork: text("recent_work").default(""),
  availability: text("availability").notNull().default("Available"),
  portfolio: text("portfolio").default("[]"), // JSON array of portfolio items
  bookedDates: text("booked_dates").default("[]"), // JSON array of booked date strings
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  type: text("type").notNull().default("post"), // post, opportunity, tip, milestone
  isPaid: boolean("is_paid").notNull().default(true), // For opportunities: paid or unpaid
  applicationQuestions: text("application_questions").default("[]"), // JSON array of custom questions for applicants
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  connectedUserId: integer("connected_user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("accepted"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  favoriteUserId: integer("favorite_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  avatar: true,
  verified: true,
  followers: true,
  following: true,
  projects: true,
  collaborations: true,
  gigs: true,
  posts: true,
  eventsAttended: true,
  connections: true,
  favorites: true,
  skills: true,
  recentWork: true,
  availability: true,
  memberLevel: true,
  showPicture: true,
  showEmail: true,
  showPhone: true,
  showDateOfBirth: true,
  usePkaAsMain: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  likes: true,
  comments: true,
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
