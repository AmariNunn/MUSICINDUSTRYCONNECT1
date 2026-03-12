import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, insertConnectionSchema, insertFavoriteSchema, insertCommentSchema } from "@shared/schema";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { sendOpportunityApplicationEmail, sendNewConnectionEmail } from "./mailer";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const { query, profession, genre } = req.query;
      const users = await storage.searchUsers(
        query as string || "",
        profession as string,
        genre as string
      );
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user by slug (firstName-lastName)
  app.get("/api/users/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const user = await storage.getUserBySlug(slug);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Login endpoint - validates password and returns user without password
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Simple password check (in production, use bcrypt)
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid password" });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to authenticate" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid user data", error: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Log the request body size for debugging
      const bodySize = JSON.stringify(req.body).length;
      console.log(`PATCH /api/users/${id} - Body size: ${bodySize} characters`);

      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUser(id, req.body);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      res.json(updatedUser);
    } catch (error: any) {
      console.error(`Error patching user ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update user", error: error.message });
    }
  });

  // Post routes
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid post data", error: error.message });
    }
  });

  app.patch("/api/posts/:id/like", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingPost = await storage.getPostById(id);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      const post = await storage.updatePost(id, { likes: existingPost.likes + 1 });
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  // Comment routes
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPost(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const validatedData = insertCommentSchema.parse({ ...req.body, postId });
      const comment = await storage.createComment(validatedData);
      
      // Update comment count on the post
      const existingPost = await storage.getPostById(postId);
      if (existingPost) {
        await storage.updatePost(postId, { comments: existingPost.comments + 1 });
      }
      
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid comment data", error: error.message });
    }
  });

  app.delete("/api/posts/:postId/comments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const postId = parseInt(req.params.postId);
      const deleted = await storage.deleteComment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Decrement comment count on the post
      const existingPost = await storage.getPostById(postId);
      if (existingPost && existingPost.comments > 0) {
        await storage.updatePost(postId, { comments: existingPost.comments - 1 });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Connection routes
  app.get("/api/connections/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const connections = await storage.getConnectionsByUser(userId);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.post("/api/connections", async (req, res) => {
    try {
      const validatedData = insertConnectionSchema.parse(req.body);
      // Create connection as accepted immediately — no pending flow
      const connection = await storage.createConnection({ ...validatedData, status: "accepted" } as any);

      // Increment connection counts for both users right away
      await Promise.all([
        storage.incrementUserConnections(validatedData.userId),
        storage.incrementUserConnections(validatedData.connectedUserId),
      ]);

      // Send email notification to the recipient (fire and forget)
      try {
        const [sender, recipient] = await Promise.all([
          storage.getUser(validatedData.userId),
          storage.getUser(validatedData.connectedUserId),
        ]);
        if (sender && recipient) {
          const senderName = `${sender.firstName} ${sender.lastName}`;
          const recipientName = `${recipient.firstName} ${recipient.lastName}`;
          const recipientEmail = recipient.email.toLowerCase();
          console.log(`📧 Sending connection email: ${senderName} → ${recipientName} (${recipientEmail})`);
          sendNewConnectionEmail({
            recipientEmail,
            recipientName,
            senderName,
            senderProfession: sender.profession?.[0],
            senderLocation: sender.location ?? undefined,
          }).then(() => {
            console.log(`✅ Connection email delivered to ${recipientEmail}`);
          }).catch((err) => {
            console.error(`❌ Connection email failed for ${recipientEmail}:`, err?.message ?? JSON.stringify(err));
          });
        }
      } catch (emailErr) {
        console.error("Failed to send connection email:", emailErr);
      }

      res.status(201).json(connection);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid connection data", error: error.message });
    }
  });

  app.delete("/api/connections/:userId/:connectedUserId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const connectedUserId = parseInt(req.params.connectedUserId);
      const deleted = await storage.deleteConnection(userId, connectedUserId);
      if (!deleted) {
        return res.status(404).json({ message: "Connection not found" });
      }
      // Decrement counts for both users
      await Promise.all([
        storage.decrementUserConnections(userId),
        storage.decrementUserConnections(connectedUserId),
      ]);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to remove connection", error: error.message });
    }
  });

  // Favorite routes
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const favorites = await storage.getFavoritesByUser(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const validatedData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.createFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid favorite data", error: error.message });
    }
  });

  app.delete("/api/favorites/:userId/:favoriteUserId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const favoriteUserId = parseInt(req.params.favoriteUserId);
      const success = await storage.deleteFavorite(userId, favoriteUserId);
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      res.json({ message: "Favorite removed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get("/api/favorites/:userId/:favoriteUserId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const favoriteUserId = parseInt(req.params.favoriteUserId);
      const isFavorite = await storage.isFavorite(userId, favoriteUserId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  app.post("/api/setup-database", async (req, res) => {
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          pka_name TEXT,
          email TEXT NOT NULL UNIQUE,
          phone TEXT,
          date_of_birth TIMESTAMP,
          password TEXT NOT NULL,
          profession TEXT[] NOT NULL DEFAULT '{}',
          genre TEXT[] NOT NULL DEFAULT '{}',
          location TEXT,
          bio TEXT,
          avatar TEXT NOT NULL DEFAULT '',
          verified BOOLEAN NOT NULL DEFAULT FALSE,
          member_level TEXT NOT NULL DEFAULT 'Gold',
          show_picture BOOLEAN NOT NULL DEFAULT TRUE,
          show_email BOOLEAN NOT NULL DEFAULT FALSE,
          show_phone BOOLEAN NOT NULL DEFAULT FALSE,
          show_dob BOOLEAN NOT NULL DEFAULT FALSE,
          use_pka_as_main BOOLEAN NOT NULL DEFAULT FALSE,
          website TEXT,
          social_instagram TEXT,
          social_twitter TEXT,
          social_facebook TEXT,
          social_tiktok TEXT,
          social_youtube TEXT,
          social_spotify TEXT,
          social_apple_music TEXT,
          social_soundcloud TEXT,
          music_spotify TEXT,
          music_apple_music TEXT,
          music_soundcloud TEXT,
          music_bandcamp TEXT,
          followers INTEGER NOT NULL DEFAULT 0,
          following INTEGER NOT NULL DEFAULT 0,
          projects INTEGER NOT NULL DEFAULT 0,
          collaborations INTEGER NOT NULL DEFAULT 0,
          gigs INTEGER NOT NULL DEFAULT 0,
          posts INTEGER NOT NULL DEFAULT 0,
          events_attended INTEGER NOT NULL DEFAULT 0,
          connections INTEGER NOT NULL DEFAULT 0,
          favorites INTEGER NOT NULL DEFAULT 0,
          skills TEXT[] NOT NULL DEFAULT '{}',
          recent_work TEXT DEFAULT '',
          availability TEXT NOT NULL DEFAULT 'Available',
          portfolio TEXT DEFAULT '[]',
          booked_dates TEXT DEFAULT '[]',
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS posts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          content TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'post',
          is_paid BOOLEAN NOT NULL DEFAULT TRUE,
          application_questions TEXT DEFAULT '[]',
          likes INTEGER NOT NULL DEFAULT 0,
          comments INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS connections (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          connected_user_id INTEGER NOT NULL REFERENCES users(id),
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS favorites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          favorite_user_id INTEGER NOT NULL REFERENCES users(id),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      res.json({ success: true, message: "Database tables created successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to create tables", error: error.message });
    }
  });

  // Opportunity application with email notification
  app.post("/api/opportunities/apply", async (req, res) => {
    try {
      const { postId, applicantEmail, applicantPhone, answers } = req.body;
      if (!postId || !applicantEmail) {
        return res.status(400).json({ message: "postId and applicantEmail are required" });
      }

      const posts = await storage.getPosts();
      const post = posts.find(p => p.id === postId);
      if (!post) {
        return res.status(404).json({ message: "Opportunity not found" });
      }

      const poster = await storage.getUser(post.userId);
      if (!poster) {
        return res.status(404).json({ message: "Poster not found" });
      }

      if (!poster.email) {
        return res.status(400).json({ message: "Poster has no email configured" });
      }

      const posterName = poster.usePkaAsMain && poster.pkaName
        ? poster.pkaName
        : `${poster.firstName} ${poster.lastName}`;

      await sendOpportunityApplicationEmail({
        posterEmail: poster.email,
        posterName,
        applicantEmail,
        applicantPhone,
        opportunityContent: post.content,
        answers,
      });

      res.json({ success: true, message: "Application sent successfully" });
    } catch (error: any) {
      console.error("Failed to send application email:", error);
      res.status(500).json({ message: "Failed to send application", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
