import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, insertConnectionSchema, insertFavoriteSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { sql, eq } from "drizzle-orm";
import { users } from "@shared/schema";
import { sendOpportunityApplicationEmail, sendNewConnectionEmail } from "./mailer";
import multer from "multer";
import { randomUUID } from "crypto";
import {
  getObjectStorageClient,
  GALLERY_KEY_PREFIX,
  GALLERY_URL_PREFIX,
  isGalleryKey,
  galleryUrlToKey,
  deleteGalleryObject,
  AVATAR_KEY_PREFIX,
  AVATAR_URL_PREFIX,
  isAvatarKey,
  avatarUrlToKey,
  deleteAvatarObject,
} from "./object-storage";

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
      // The designated owner email is automatically promoted to admin on
      // registration. This is the only place the app sets is_admin = true
      // outside of a direct DB update / the startup routine.
      if (user.email.toLowerCase() === "themusicindustryconnect@gmail.com") {
        const promoted = await storage.setUserAdmin(user.id, true);
        return res.status(201).json(promoted ?? user);
      }
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
      // Strip admin flag and avatar from user-facing update endpoint.
      // Avatar is managed exclusively through POST/DELETE /api/users/:id/avatar.
      const { isAdmin: _ignoredAdmin, avatar: _ignoredAvatar, ...sanitizedUpdates } = req.body ?? {};
      const updatedUser = await storage.updateUser(id, sanitizedUpdates);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      res.json(updatedUser);
    } catch (error: any) {
      console.error(`Error patching user ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update user", error: error.message });
    }
  });

  // Avatar upload/serve/delete
  const avatarUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  });

  app.post(
    "/api/users/:id/avatar",
    avatarUpload.single("file"),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const actingId = parseInt(String(req.header("x-user-id") ?? "0"));
        if (!actingId || actingId !== id) {
          return res.status(403).json({ message: "Not authorized" });
        }
        const file = req.file;
        if (!file) return res.status(400).json({ message: "No file uploaded" });
        if (!file.mimetype.startsWith("image/")) {
          return res.status(400).json({ message: "Only image files are allowed" });
        }

        const existingUser = await storage.getUser(id);
        if (!existingUser) return res.status(404).json({ message: "User not found" });

        // Delete the old avatar blob if it was previously stored
        const oldKey = existingUser.avatar ? avatarUrlToKey(existingUser.avatar) : null;

        const ext = (file.originalname.split(".").pop() ?? "")
          .replace(/[^A-Za-z0-9]/g, "")
          .slice(0, 8);
        const key = `${AVATAR_KEY_PREFIX}${id}/${randomUUID()}${ext ? "." + ext : ""}`;
        const client = getObjectStorageClient();
        const result = await client.upload(key, file.buffer, file.mimetype);
        if (!result.ok) {
          return res.status(502).json({ message: `Storage upload failed: ${result.error}` });
        }

        const avatarUrl = AVATAR_URL_PREFIX + key;
        const updatedUser = await storage.updateUser(id, { avatar: avatarUrl });
        if (!updatedUser) return res.status(500).json({ message: "Failed to update user" });

        // Best-effort cleanup of old blob after successful save
        if (oldKey) await deleteAvatarObject(oldKey);

        res.status(201).json({ avatarUrl, user: updatedUser });
      } catch (error: any) {
        if (error?.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ message: "Image exceeds 10 MB limit" });
        }
        res.status(500).json({ message: error?.message ?? "Upload failed" });
      }
    }
  );

  app.delete("/api/users/:id/avatar", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const actingId = parseInt(String(req.header("x-user-id") ?? "0"));
      if (!actingId || actingId !== id) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const existingUser = await storage.getUser(id);
      if (!existingUser) return res.status(404).json({ message: "User not found" });

      const oldKey = existingUser.avatar ? avatarUrlToKey(existingUser.avatar) : null;
      const initials = `${existingUser.firstName.charAt(0)}${existingUser.lastName.charAt(0)}`.toUpperCase();
      const updatedUser = await storage.updateUser(id, { avatar: initials });
      if (!updatedUser) return res.status(500).json({ message: "Failed to update user" });

      if (oldKey) await deleteAvatarObject(oldKey);
      res.json({ user: updatedUser });
    } catch (error: any) {
      res.status(500).json({ message: error?.message ?? "Failed to remove avatar" });
    }
  });

  // Serve avatar blobs
  app.get(/^\/api\/avatar\/media\/(.+)$/, async (req, res) => {
    try {
      const params = req.params as unknown as Record<string, string>;
      const key = params[0];
      if (!key || !isAvatarKey(key)) return res.status(400).send("Invalid key");
      const client = getObjectStorageClient();
      const result = await client.downloadAsBytes(key);
      if (!result.ok) return res.status(404).send("Not found");
      const value: unknown = result.value;
      let bytes: Buffer;
      if (Buffer.isBuffer(value)) {
        bytes = value;
      } else if (Array.isArray(value) && Buffer.isBuffer(value[0])) {
        bytes = value[0];
      } else if (value instanceof Uint8Array) {
        bytes = Buffer.from(value);
      } else {
        return res.status(500).send("Unexpected storage payload");
      }
      const ext = key.split(".").pop()?.toLowerCase() ?? "";
      const contentType =
        ext === "png" ? "image/png" :
        ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
        ext === "gif" ? "image/gif" :
        ext === "webp" ? "image/webp" :
        "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.send(bytes);
    } catch {
      res.status(500).send("Failed to fetch avatar");
    }
  });

  // Admin guard — checks the x-user-id header (same trust model as the
  // gallery routes) and confirms that user has the is_admin flag set in
  // the database. Returns the admin user record if authorized.
  async function requireAdmin(req: any, res: any): Promise<{ id: number } | null> {
    const raw = req.header("x-user-id");
    const id = raw ? parseInt(String(raw)) : NaN;
    if (!Number.isFinite(id) || id <= 0) {
      res.status(401).json({ message: "Not authenticated" });
      return null;
    }
    const user = await storage.getUser(id);
    if (!user || !user.isAdmin) {
      res.status(403).json({ message: "Admin access required" });
      return null;
    }
    return user;
  }

  app.get("/api/admin/users", async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    try {
      const all = await storage.getAllUsers();
      res.json(all.map(({ password: _p, ...u }) => u));
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
  });

  app.patch("/api/admin/users/:id/member-level", async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    try {
      const id = parseInt(req.params.id);
      const { memberLevel } = req.body ?? {};
      if (memberLevel !== "Free" && memberLevel !== "Gold" && memberLevel !== "Platinum") {
        return res.status(400).json({ message: "memberLevel must be Free, Gold, or Platinum" });
      }
      const updated = await storage.updateUser(id, { memberLevel });
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password: _p, ...rest } = updated;
      res.json(rest);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update member level", error: error.message });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    try {
      const id = parseInt(req.params.id);
      if (id === admin.id) {
        return res.status(400).json({ message: "You cannot delete your own admin account" });
      }
      const ok = await storage.deleteUser(id);
      if (!ok) return res.status(404).json({ message: "User not found" });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
  });

  app.get("/api/admin/posts", async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    try {
      const all = await storage.getPosts();
      res.json(all);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch posts", error: error.message });
    }
  });

  app.delete("/api/admin/posts/:id", async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    try {
      const id = parseInt(req.params.id);
      const ok = await storage.deletePost(id);
      if (!ok) return res.status(404).json({ message: "Post not found" });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete post", error: error.message });
    }
  });

  app.post("/api/admin/posts", async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    try {
      const adminPostSchema = z.object({
        content: z.string().min(1),
        type: z
          .enum([
            "post",
            "community",
            "opportunity",
            "resource",
            "event",
            "tip",
            "milestone",
          ])
          .default("community"),
        isPaid: z.boolean().optional(),
        price: z.union([z.string(), z.number()]).optional(),
        applicationQuestions: z.array(z.string().trim().min(1)).optional(),
      });
      const data = adminPostSchema.parse(req.body);
      const isOpportunity = data.type === "opportunity";
      const post = await storage.createPost({
        userId: admin.id,
        content: data.content,
        type: data.type,
        isPaid: isOpportunity ? data.isPaid ?? true : true,
        price:
          isOpportunity && data.price !== undefined
            ? String(data.price).trim()
            : "",
        applicationQuestions:
          isOpportunity && data.applicationQuestions
            ? JSON.stringify(data.applicationQuestions)
            : "[]",
      });
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid post data", error: error.message });
    }
  });

  app.patch("/api/admin/posts/:id", async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid post id" });
      }
      const existing = await storage.getPostById(id);
      if (!existing) {
        return res.status(404).json({ message: "Post not found" });
      }
      const editPostSchema = z.object({
        content: z.string().trim().min(1).optional(),
        type: z
          .enum([
            "post",
            "opportunity",
            "tip",
            "milestone",
            "community",
            "resource",
            "event",
          ])
          .optional(),
        isPaid: z.boolean().optional(),
        price: z.union([z.string(), z.number()]).optional(),
        applicationQuestions: z.array(z.string().trim().min(1)).optional(),
      });
      const data = editPostSchema.parse(req.body);
      if (
        data.content === undefined &&
        data.type === undefined &&
        data.isPaid === undefined &&
        data.price === undefined &&
        data.applicationQuestions === undefined
      ) {
        return res.status(400).json({ message: "Nothing to update" });
      }
      const nextType = data.type ?? existing.type;
      const isOpportunity = nextType === "opportunity";
      const updatePayload: Record<string, unknown> = {};
      if (data.content !== undefined) updatePayload.content = data.content;
      if (data.type !== undefined) updatePayload.type = data.type;
      if (isOpportunity) {
        if (data.isPaid !== undefined) updatePayload.isPaid = data.isPaid;
        if (data.price !== undefined) updatePayload.price = String(data.price).trim();
        if (data.applicationQuestions !== undefined) {
          updatePayload.applicationQuestions = JSON.stringify(
            data.applicationQuestions,
          );
        }
      } else if (data.type !== undefined && existing.type === "opportunity") {
        updatePayload.isPaid = true;
        updatePayload.price = "";
        updatePayload.applicationQuestions = "[]";
      }
      const updated = await storage.updatePost(id, updatePayload);
      if (!updated) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid post data", error: error.message });
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

  // Recalculate denormalized counters from actual connection data
  app.post("/api/admin/recalc-counters", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      await Promise.all(allUsers.map(async (user) => {
        const { connections: allConns, connected: mutualConns } = await storage.getConnectionUsersForProfile(user.id);
        await db.update(users)
          .set({ connections: allConns.length, following: mutualConns.length })
          .where(eq(users.id, user.id));
      }));
      res.json({ success: true, updated: allUsers.length });
    } catch (error: any) {
      res.status(500).json({ message: "Recalc failed", error: error.message });
    }
  });

  // Connection routes
  app.get("/api/connections/:userId/with-users", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const data = await storage.getConnectionUsersForProfile(userId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch connection users" });
    }
  });

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

      const existing = await storage.getDirectionalConnection(validatedData.userId, validatedData.connectedUserId);
      if (existing) {
        return res.status(409).json({ message: "Connection already exists" });
      }

      const connection = await storage.createConnection(validatedData);

      await storage.incrementUserConnections(validatedData.connectedUserId);

      const reverseConnection = await storage.getDirectionalConnection(
        validatedData.connectedUserId,
        validatedData.userId
      );
      if (reverseConnection) {
        await Promise.all([
          storage.incrementUserFollowing(validatedData.userId),
          storage.incrementUserFollowing(validatedData.connectedUserId),
        ]);
      }

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

      const reverseConnection = await storage.getDirectionalConnection(connectedUserId, userId);

      const deleted = await storage.deleteDirectionalConnection(userId, connectedUserId);
      if (!deleted) {
        return res.status(404).json({ message: "Connection not found" });
      }

      await storage.decrementUserConnections(connectedUserId);

      if (reverseConnection) {
        await Promise.all([
          storage.decrementUserFollowing(userId),
          storage.decrementUserFollowing(connectedUserId),
        ]);
      }

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

  // Gallery routes
  const MAX_ITEMS_PER_POST = 10;
  const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
  const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB

  const galleryUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_VIDEO_BYTES },
  });

  // Allow only our own gallery-served URLs to be persisted as media URLs.
  // Files live in object storage and are served via /api/gallery/media/:key.
  const GALLERY_URL_PREFIX = "/api/gallery/media/";
  const isAllowedMediaUrl = (url: string) =>
    typeof url === "string" &&
    url.startsWith(GALLERY_URL_PREFIX) &&
    /^[A-Za-z0-9_\-./]+$/.test(url.slice(GALLERY_URL_PREFIX.length));

  const galleryItemInputSchema = z.object({
    mediaUrl: z.string().refine(isAllowedMediaUrl, {
      message: "mediaUrl must be a /api/gallery/media/<key> URL returned by upload",
    }),
    mediaType: z.enum(["image", "video"]),
    caption: z.string().max(500).default(""),
    orderIndex: z.number().int().min(0),
  });

  const createGalleryPostSchema = z.object({
    userId: z.number().int().positive(),
    caption: z.string().max(2000).default(""),
    items: z.array(galleryItemInputSchema).min(1).max(MAX_ITEMS_PER_POST),
  });

  app.get("/api/gallery/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const posts = await storage.getGalleryPostsByUser(userId);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch gallery", error: error.message });
    }
  });

  function getActingUserId(req: any): number | null {
    // The app's auth pattern stores currentUserId in localStorage on the
    // client. We require it to be echoed back in an x-user-id header so a
    // request can't post on behalf of a different account just by changing
    // the body. Same trust model as the rest of the app's routes.
    const raw = req.header("x-user-id");
    if (!raw) return null;
    const n = parseInt(String(raw));
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  // Upload a single file to object storage; returns the URL to embed in
  // a subsequent gallery post.
  app.post(
    "/api/gallery/upload",
    galleryUpload.single("file"),
    async (req, res) => {
      try {
        const actingId = getActingUserId(req);
        if (!actingId) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        const file = req.file;
        if (!file) return res.status(400).json({ message: "No file uploaded" });

        const isImage = file.mimetype.startsWith("image/");
        const isVideo = file.mimetype.startsWith("video/");
        if (!isImage && !isVideo) {
          return res.status(400).json({ message: "Only image or video files are allowed" });
        }
        const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
        if (file.size > limit) {
          return res
            .status(413)
            .json({ message: `${isVideo ? "Video" : "Image"} exceeds ${isVideo ? "50MB" : "10MB"} limit` });
        }

        const ext = (file.originalname.split(".").pop() ?? "")
          .replace(/[^A-Za-z0-9]/g, "")
          .slice(0, 8);
        const key = `${GALLERY_KEY_PREFIX}${actingId}/${randomUUID()}${ext ? "." + ext : ""}`;
        const client = getObjectStorageClient();
        const result = await client.upload(key, file.buffer, file.mimetype);
        if (!result.ok) {
          return res
            .status(502)
            .json({ message: `Storage upload failed: ${result.error}`, error: String(result.error) });
        }
        res.status(201).json({
          mediaUrl: GALLERY_URL_PREFIX + key,
          mediaType: isVideo ? "video" : "image",
        });
      } catch (error: any) {
        if (error?.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ message: "File exceeds size limit" });
        }
        res.status(500).json({ message: error?.message ?? "Upload failed", error: error?.message });
      }
    },
  );

  // Stream stored media back to the browser. Restricted to the gallery
  // namespace so it cannot be used to read unrelated objects in a
  // shared bucket.
  app.get(/^\/api\/gallery\/media\/(.+)$/, async (req, res) => {
    try {
      const params = req.params as unknown as Record<string, string>;
      const key = params[0];
      if (!key || !isGalleryKey(key)) {
        return res.status(400).send("Invalid key");
      }
      const client = getObjectStorageClient();
      const result = await client.downloadAsBytes(key);
      if (!result.ok) {
        return res.status(404).send("Not found");
      }
      const value: unknown = result.value;
      let bytes: Buffer;
      if (Buffer.isBuffer(value)) {
        bytes = value;
      } else if (Array.isArray(value) && Buffer.isBuffer(value[0])) {
        bytes = value[0];
      } else if (value instanceof Uint8Array) {
        bytes = Buffer.from(value);
      } else {
        return res.status(500).send("Unexpected storage payload");
      }
      const ext = key.split(".").pop()?.toLowerCase() ?? "";
      const contentType =
        ext === "mp4" ? "video/mp4" :
        ext === "mov" ? "video/quicktime" :
        ext === "webm" ? "video/webm" :
        ext === "png" ? "image/png" :
        ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
        ext === "gif" ? "image/gif" :
        ext === "webp" ? "image/webp" :
        "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.send(bytes);
    } catch (error: any) {
      res.status(500).send("Failed to fetch media");
    }
  });

  app.post("/api/gallery", async (req, res) => {
    try {
      const data = createGalleryPostSchema.parse(req.body);

      const actingId = getActingUserId(req);
      if (!actingId || actingId !== data.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const owner = await storage.getUser(data.userId);
      if (!owner) {
        return res.status(404).json({ message: "User not found" });
      }

      // Every media URL must be one this user uploaded — i.e. it must
      // resolve to a key under `gallery/<actingId>/...`. This prevents
      // a user from referencing another user's media (which could
      // otherwise be deleted later when this post is deleted).
      const requiredPrefix = `${GALLERY_KEY_PREFIX}${actingId}/`;
      for (const item of data.items) {
        const key = galleryUrlToKey(item.mediaUrl);
        if (!key || !key.startsWith(requiredPrefix)) {
          return res.status(403).json({
            message: "Media must be uploaded by the post owner",
          });
        }
      }

      const post = await storage.createGalleryPost(
        { userId: data.userId, caption: data.caption },
        data.items.map((item) => ({
          mediaUrl: item.mediaUrl,
          mediaType: item.mediaType,
          caption: item.caption ?? "",
          orderIndex: item.orderIndex,
        })),
      );
      res.status(201).json(post);
    } catch (error: any) {
      if (error?.name === "ZodError") {
        return res.status(400).json({ message: "Invalid gallery data", error: error.message });
      }
      res.status(500).json({ message: "Failed to create gallery post", error: error.message });
    }
  });

  app.delete("/api/gallery/:postId", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const actingId = getActingUserId(req);
      if (!actingId) return res.status(401).json({ message: "Not authenticated" });
      const existing = await storage.getGalleryPostById(postId);
      if (!existing) return res.status(404).json({ message: "Post not found" });
      if (existing.userId !== actingId) return res.status(403).json({ message: "Not authorized" });

      // Collect media keys before deleting DB rows so we can clean up
      // object storage. This is best-effort: a missing blob shouldn't
      // block the delete from succeeding.
      const fullPost = await storage.getGalleryPostsByUser(actingId);
      const target = fullPost.find((p) => p.id === postId);
      const keys =
        target?.items
          .map((it) => galleryUrlToKey(it.mediaUrl))
          .filter((k): k is string => k !== null) ?? [];

      const deleted = await storage.deleteGalleryPost(postId);
      if (!deleted) return res.status(500).json({ message: "Failed to delete post" });

      await Promise.all(keys.map((k) => deleteGalleryObject(k)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete gallery post", error: error.message });
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
          status TEXT NOT NULL DEFAULT 'accepted',
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

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS gallery_posts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          caption TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS gallery_items (
          id SERIAL PRIMARY KEY,
          post_id INTEGER NOT NULL REFERENCES gallery_posts(id),
          media_url TEXT NOT NULL,
          media_type TEXT NOT NULL,
          order_index INTEGER NOT NULL DEFAULT 0
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
