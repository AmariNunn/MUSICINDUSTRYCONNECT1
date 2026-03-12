import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function initializeDatabase() {
  console.log("Creating database tables...");
  
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
    console.log("✓ Users table created");

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
    console.log("✓ Posts table created");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS connections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        connected_user_id INTEGER NOT NULL REFERENCES users(id),
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✓ Connections table created");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        favorite_user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✓ Favorites table created");

    console.log("\n✅ Database initialization complete!");
    process.exit(0);
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
}

initializeDatabase();
