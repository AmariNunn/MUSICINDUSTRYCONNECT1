import { eq, or, ilike, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users, posts, connections, favorites, comments,
  type User, type InsertUser, type Post, type InsertPost,
  type Connection, type InsertConnection, type Favorite,
  type InsertFavorite, type Comment, type InsertComment
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySlug(slug: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  searchUsers(query: string, profession?: string, genre?: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;

  createPost(post: InsertPost): Promise<Post>;
  getPosts(): Promise<(Post & { author: User })[]>;
  getPostsByUser(userId: number): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined>;

  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnectionsByUser(userId: number): Promise<Connection[]>;
  updateConnectionStatus(id: number, status: string): Promise<Connection | undefined>;

  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  deleteFavorite(userId: number, favoriteUserId: number): Promise<boolean>;
  isFavorite(userId: number, favoriteUserId: number): Promise<boolean>;

  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<(Comment & { author: User })[]>;
  deleteComment(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserBySlug(slug: string): Promise<User | undefined> {
    const allUsers = await db.select().from(users);
    return allUsers.find(u => {
      const userSlug = `${u.firstName}-${u.lastName}`.toLowerCase().replace(/\s+/g, '-');
      return userSlug === slug.toLowerCase();
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const avatar = `${insertUser.firstName.charAt(0)}${insertUser.lastName.charAt(0)}`.toUpperCase();
    const result = await db.insert(users).values({
      ...insertUser,
      avatar,
    }).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async searchUsers(query: string, profession?: string, genre?: string): Promise<User[]> {
    const allUsers = await db.select().from(users);
    return allUsers.filter(user => {
      const matchesQuery = !query ||
        user.firstName.toLowerCase().includes(query.toLowerCase()) ||
        user.lastName.toLowerCase().includes(query.toLowerCase()) ||
        user.bio?.toLowerCase().includes(query.toLowerCase()) ||
        user.location?.toLowerCase().includes(query.toLowerCase());

      const matchesProfession = !profession ||
        user.profession.some(p => p.toLowerCase() === profession.toLowerCase());

      const matchesGenre = !genre ||
        user.genre.some(g => g.toLowerCase() === genre.toLowerCase());

      return matchesQuery && matchesProfession && matchesGenre;
    });
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(insertPost).returning();
    return result[0];
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async getPosts(): Promise<(Post & { author: User })[]> {
    const postsData = await db.select().from(posts).orderBy(sql`${posts.createdAt} DESC`);
    const allUsers = await db.select().from(users);
    const userMap = new Map(allUsers.map(u => [u.id, u]));

    return postsData
      .map(post => {
        const author = userMap.get(post.userId);
        if (!author) return null;
        return { ...post, author };
      })
      .filter((p): p is Post & { author: User } => p !== null);
  }

  async getPostsByUser(userId: number): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.userId, userId));
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const result = await db.update(posts).set(updates).where(eq(posts.id, id)).returning();
    return result[0];
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const result = await db.insert(connections).values(insertConnection).returning();
    return result[0];
  }

  async getConnectionsByUser(userId: number): Promise<Connection[]> {
    return db.select().from(connections).where(
      or(eq(connections.userId, userId), eq(connections.connectedUserId, userId))
    );
  }

  async updateConnectionStatus(id: number, status: string): Promise<Connection | undefined> {
    const result = await db.update(connections).set({ status }).where(eq(connections.id, id)).returning();
    return result[0];
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const result = await db.insert(favorites).values(insertFavorite).returning();
    return result[0];
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async deleteFavorite(userId: number, favoriteUserId: number): Promise<boolean> {
    const result = await db.delete(favorites)
      .where(sql`${favorites.userId} = ${userId} AND ${favorites.favoriteUserId} = ${favoriteUserId}`)
      .returning();
    return result.length > 0;
  }

  async isFavorite(userId: number, favoriteUserId: number): Promise<boolean> {
    const result = await db.select().from(favorites)
      .where(sql`${favorites.userId} = ${userId} AND ${favorites.favoriteUserId} = ${favoriteUserId}`)
      .limit(1);
    return result.length > 0;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values(insertComment).returning();
    return result[0];
  }

  async getCommentsByPost(postId: number): Promise<(Comment & { author: User })[]> {
    const commentsData = await db.select().from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(sql`${comments.createdAt} DESC`);

    const userIds = Array.from(new Set(commentsData.map(c => c.userId)));
    if (userIds.length === 0) return [];

    const authorsData = await db.select().from(users).where(sql`${users.id} = ANY(${userIds})`);
    const userMap = new Map(authorsData.map(u => [u.id, u]));

    return commentsData
      .map(comment => {
        const author = userMap.get(comment.userId);
        if (!author) return null;
        return { ...comment, author };
      })
      .filter((c): c is Comment & { author: User } => c !== null);
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
