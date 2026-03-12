import { type User, type InsertUser, type Post, type InsertPost, type Connection, type InsertConnection, type Favorite, type InsertFavorite, type Comment, type InsertComment } from "@shared/schema";
import { supabase } from "./supabase";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySlug(slug: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  searchUsers(query: string, profession?: string, genre?: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;

  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(): Promise<(Post & { author: User })[]>;
  getPostsByUser(userId: number): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined>;

  // Connection operations
  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnectionsByUser(userId: number): Promise<Connection[]>;
  updateConnectionStatus(id: number, status: string): Promise<Connection | undefined>;

  // Favorite operations
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  deleteFavorite(userId: number, favoriteUserId: number): Promise<boolean>;
  isFavorite(userId: number, favoriteUserId: number): Promise<boolean>;

  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<(Comment & { author: User })[]>;
  deleteComment(id: number): Promise<boolean>;
}

function mapDbUserToUser(dbUser: any): User {
  return {
    id: dbUser.id,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    pkaName: dbUser.pka_name,
    email: dbUser.email,
    phone: dbUser.phone,
    dateOfBirth: dbUser.date_of_birth ? new Date(dbUser.date_of_birth) : null,
    password: dbUser.password,
    profession: dbUser.profession || [],
    genre: dbUser.genre || [],
    location: dbUser.location,
    bio: dbUser.bio,
    avatar: dbUser.avatar || '',
    verified: dbUser.verified || false,
    memberLevel: dbUser.member_level || 'Gold',
    showPicture: dbUser.show_picture ?? true,
    showEmail: dbUser.show_email ?? false,
    showPhone: dbUser.show_phone ?? false,
    showDateOfBirth: dbUser.show_dob ?? false,
    usePkaAsMain: dbUser.use_pka_as_main ?? false,
    website: dbUser.website,
    socialInstagram: dbUser.social_instagram,
    socialTwitter: dbUser.social_twitter,
    socialFacebook: dbUser.social_facebook,
    socialTiktok: dbUser.social_tiktok,
    socialYoutube: dbUser.social_youtube,
    socialSpotify: dbUser.social_spotify,
    socialAppleMusic: dbUser.social_apple_music,
    socialSoundcloud: dbUser.social_soundcloud,
    musicSpotify: dbUser.music_spotify,
    musicAppleMusic: dbUser.music_apple_music,
    musicSoundcloud: dbUser.music_soundcloud,
    musicBandcamp: dbUser.music_bandcamp,
    followers: dbUser.followers || 0,
    following: dbUser.following || 0,
    projects: dbUser.projects || 0,
    collaborations: dbUser.collaborations || 0,
    gigs: dbUser.gigs || 0,
    posts: dbUser.posts || 0,
    eventsAttended: dbUser.events_attended || 0,
    connections: dbUser.connections || 0,
    favorites: dbUser.favorites || 0,
    skills: dbUser.skills || [],
    recentWork: dbUser.recent_work || '',
    availability: dbUser.availability || 'Available',
    portfolio: dbUser.portfolio || '[]',
    bookedDates: dbUser.booked_dates || '[]',
    createdAt: new Date(dbUser.created_at)
  };
}

function mapDbPostToPost(dbPost: any): Post {
  return {
    id: dbPost.id,
    userId: dbPost.user_id,
    content: dbPost.content,
    type: dbPost.type || 'post',
    isPaid: dbPost.is_paid ?? false,
    applicationQuestions: dbPost.application_questions,
    likes: dbPost.likes || 0,
    comments: dbPost.comments || 0,
    createdAt: new Date(dbPost.created_at)
  };
}

function mapDbConnectionToConnection(dbConn: any): Connection {
  return {
    id: dbConn.id,
    userId: dbConn.user_id,
    connectedUserId: dbConn.connected_user_id,
    status: dbConn.status || 'pending',
    createdAt: new Date(dbConn.created_at)
  };
}

function mapDbFavoriteToFavorite(dbFav: any): Favorite {
  return {
    id: dbFav.id,
    userId: dbFav.user_id,
    favoriteUserId: dbFav.favorite_user_id,
    createdAt: new Date(dbFav.created_at)
  };
}

function mapDbCommentToComment(dbComment: any): Comment {
  return {
    id: dbComment.id,
    postId: dbComment.post_id,
    userId: dbComment.user_id,
    content: dbComment.content,
    createdAt: new Date(dbComment.created_at)
  };
}

export class SupabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return mapDbUserToUser(data);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return undefined;
    return mapDbUserToUser(data);
  }

  async getUserBySlug(slug: string): Promise<User | undefined> {
    // Slug format is firstname-lastname (lowercase, hyphenated)
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error || !data) return undefined;
    
    // Find user whose firstName-lastName matches the slug
    const user = data.find(u => {
      const userSlug = `${u.first_name}-${u.last_name}`.toLowerCase().replace(/\s+/g, '-');
      return userSlug === slug.toLowerCase();
    });
    
    return user ? mapDbUserToUser(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const avatar = `${insertUser.firstName.charAt(0)}${insertUser.lastName.charAt(0)}`.toUpperCase();
    
    const dbUser = {
      first_name: insertUser.firstName,
      last_name: insertUser.lastName,
      pka_name: insertUser.pkaName || null,
      email: insertUser.email,
      phone: insertUser.phone || null,
      date_of_birth: insertUser.dateOfBirth || null,
      password: insertUser.password,
      profession: insertUser.profession || [],
      genre: insertUser.genre || [],
      location: insertUser.location || null,
      bio: insertUser.bio || null,
      avatar,
      website: insertUser.website || null,
      social_instagram: insertUser.socialInstagram || null,
      social_twitter: insertUser.socialTwitter || null,
      social_facebook: insertUser.socialFacebook || null,
      social_tiktok: insertUser.socialTiktok || null,
      social_youtube: insertUser.socialYoutube || null,
      social_spotify: insertUser.socialSpotify || null,
      social_apple_music: insertUser.socialAppleMusic || null,
      social_soundcloud: insertUser.socialSoundcloud || null,
      music_spotify: insertUser.musicSpotify || null,
      music_apple_music: insertUser.musicAppleMusic || null,
      music_soundcloud: insertUser.musicSoundcloud || null,
      music_bandcamp: insertUser.musicBandcamp || null,
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(dbUser)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return mapDbUserToUser(data);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const dbUpdates: Record<string, any> = {};
    
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
    if (updates.pkaName !== undefined) dbUpdates.pka_name = updates.pkaName;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth;
    if (updates.password !== undefined) dbUpdates.password = updates.password;
    if (updates.profession !== undefined) dbUpdates.profession = updates.profession;
    if (updates.genre !== undefined) dbUpdates.genre = updates.genre;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.verified !== undefined) dbUpdates.verified = updates.verified;
    if (updates.memberLevel !== undefined) dbUpdates.member_level = updates.memberLevel;
    if (updates.showPicture !== undefined) dbUpdates.show_picture = updates.showPicture;
    if (updates.showEmail !== undefined) dbUpdates.show_email = updates.showEmail;
    if (updates.showPhone !== undefined) dbUpdates.show_phone = updates.showPhone;
    if (updates.showDateOfBirth !== undefined) dbUpdates.show_dob = updates.showDateOfBirth;
    if (updates.usePkaAsMain !== undefined) dbUpdates.use_pka_as_main = updates.usePkaAsMain;
    if (updates.website !== undefined) dbUpdates.website = updates.website;
    if (updates.socialInstagram !== undefined) dbUpdates.social_instagram = updates.socialInstagram;
    if (updates.socialTwitter !== undefined) dbUpdates.social_twitter = updates.socialTwitter;
    if (updates.socialFacebook !== undefined) dbUpdates.social_facebook = updates.socialFacebook;
    if (updates.socialTiktok !== undefined) dbUpdates.social_tiktok = updates.socialTiktok;
    if (updates.socialYoutube !== undefined) dbUpdates.social_youtube = updates.socialYoutube;
    if (updates.socialSpotify !== undefined) dbUpdates.social_spotify = updates.socialSpotify;
    if (updates.socialAppleMusic !== undefined) dbUpdates.social_apple_music = updates.socialAppleMusic;
    if (updates.socialSoundcloud !== undefined) dbUpdates.social_soundcloud = updates.socialSoundcloud;
    if (updates.musicSpotify !== undefined) dbUpdates.music_spotify = updates.musicSpotify;
    if (updates.musicAppleMusic !== undefined) dbUpdates.music_apple_music = updates.musicAppleMusic;
    if (updates.musicSoundcloud !== undefined) dbUpdates.music_soundcloud = updates.musicSoundcloud;
    if (updates.musicBandcamp !== undefined) dbUpdates.music_bandcamp = updates.musicBandcamp;
    if (updates.followers !== undefined) dbUpdates.followers = updates.followers;
    if (updates.following !== undefined) dbUpdates.following = updates.following;
    if (updates.projects !== undefined) dbUpdates.projects = updates.projects;
    if (updates.collaborations !== undefined) dbUpdates.collaborations = updates.collaborations;
    if (updates.gigs !== undefined) dbUpdates.gigs = updates.gigs;
    if (updates.posts !== undefined) dbUpdates.posts = updates.posts;
    if (updates.eventsAttended !== undefined) dbUpdates.events_attended = updates.eventsAttended;
    if (updates.connections !== undefined) dbUpdates.connections = updates.connections;
    if (updates.favorites !== undefined) dbUpdates.favorites = updates.favorites;
    if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
    if (updates.recentWork !== undefined) dbUpdates.recent_work = updates.recentWork;
    if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
    if (updates.portfolio !== undefined) dbUpdates.portfolio = updates.portfolio;
    if (updates.bookedDates !== undefined) dbUpdates.booked_dates = updates.bookedDates;
    
    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return mapDbUserToUser(data);
  }

  async searchUsers(query: string, profession?: string, genre?: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error || !data) return [];
    
    const users = data.map(mapDbUserToUser);
    
    return users.filter(user => {
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
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error || !data) return [];
    return data.map(mapDbUserToUser);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const dbPost = {
      user_id: insertPost.userId,
      content: insertPost.content,
      type: insertPost.type || 'post',
      is_paid: insertPost.isPaid ?? false,
      application_questions: insertPost.applicationQuestions || null,
    };
    
    const { data, error } = await supabase
      .from('posts')
      .insert(dbPost)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create post: ${error.message}`);
    return mapDbPostToPost(data);
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return mapDbPostToPost(data);
  }

  async getPosts(): Promise<(Post & { author: User })[]> {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (postsError || !postsData) return [];
    
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError || !usersData) return [];
    
    const userMap = new Map(usersData.map(u => [u.id, mapDbUserToUser(u)]));
    
    const postsWithAuthors = postsData.map(post => {
      const author = userMap.get(post.user_id);
      if (!author) return null;
      return { ...mapDbPostToPost(post), author };
    }).filter((post): post is Post & { author: User } => post !== null);
    
    return postsWithAuthors;
  }

  async getPostsByUser(userId: number): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId);
    
    if (error || !data) return [];
    return data.map(mapDbPostToPost);
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const dbUpdates: Record<string, any> = {};
    
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;
    if (updates.applicationQuestions !== undefined) dbUpdates.application_questions = updates.applicationQuestions;
    if (updates.likes !== undefined) dbUpdates.likes = updates.likes;
    if (updates.comments !== undefined) dbUpdates.comments = updates.comments;
    
    const { data, error } = await supabase
      .from('posts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return mapDbPostToPost(data);
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const dbConnection = {
      user_id: insertConnection.userId,
      connected_user_id: insertConnection.connectedUserId,
    };
    
    const { data, error } = await supabase
      .from('connections')
      .insert(dbConnection)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create connection: ${error.message}`);
    return mapDbConnectionToConnection(data);
  }

  async getConnectionsByUser(userId: number): Promise<Connection[]> {
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`);
    
    if (error || !data) return [];
    return data.map(mapDbConnectionToConnection);
  }

  async updateConnectionStatus(id: number, status: string): Promise<Connection | undefined> {
    const { data, error } = await supabase
      .from('connections')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return mapDbConnectionToConnection(data);
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const dbFavorite = {
      user_id: insertFavorite.userId,
      favorite_user_id: insertFavorite.favoriteUserId,
    };
    
    const { data, error } = await supabase
      .from('favorites')
      .insert(dbFavorite)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create favorite: ${error.message}`);
    return mapDbFavoriteToFavorite(data);
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId);
    
    if (error || !data) return [];
    return data.map(mapDbFavoriteToFavorite);
  }

  async deleteFavorite(userId: number, favoriteUserId: number): Promise<boolean> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('favorite_user_id', favoriteUserId);
    
    return !error;
  }

  async isFavorite(userId: number, favoriteUserId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('favorite_user_id', favoriteUserId)
      .single();
    
    return !error && !!data;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const dbComment = {
      post_id: insertComment.postId,
      user_id: insertComment.userId,
      content: insertComment.content,
    };
    
    const { data, error } = await supabase
      .from('comments')
      .insert(dbComment)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create comment: ${error.message}`);
    return mapDbCommentToComment(data);
  }

  async getCommentsByPost(postId: number): Promise<(Comment & { author: User })[]> {
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    
    if (error || !comments) return [];
    
    // Get all unique user IDs
    const userIds = Array.from(new Set(comments.map(c => c.user_id)));
    
    // Fetch all authors
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);
    
    if (usersError || !users) return [];
    
    const userMap = new Map(users.map(u => [u.id, mapDbUserToUser(u)]));
    
    return comments.map(comment => {
      const author = userMap.get(comment.user_id);
      if (!author) return null;
      return { ...mapDbCommentToComment(comment), author };
    }).filter((c): c is Comment & { author: User } => c !== null);
  }

  async deleteComment(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    
    return !error;
  }
}

// Using Supabase for permanent data storage
export const storage = new SupabaseStorage();
