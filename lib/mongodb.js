// ============================================================
// CRAVEO - MONGODB DATABASE CONNECTION
// NEXT.JS + VERCEL OPTIMIZED CONNECTION CACHE
// ============================================================

import mongoose from "mongoose";

// ============================================================
// MONGODB URI
// ============================================================

const MONGODB_URI =
  process.env.MONGODB_URI;

// ============================================================
// ENVIRONMENT CHECK
// ============================================================

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI environment variable is missing."
  );
}

// ============================================================
// GLOBAL MONGOOSE CACHE
//
// Vercel / Next.js server functions aur local Turbopack ke
// andar same runtime mein unnecessary new connections ko
// prevent karta hai.
// ============================================================

const globalForMongoose =
  globalThis;

if (
  !globalForMongoose
    .craveoMongooseCache
) {
  globalForMongoose.craveoMongooseCache = {
    conn: null,
    promise: null,
  };
}

const cached =
  globalForMongoose
    .craveoMongooseCache;

// ============================================================
// CONNECTION OPTIONS
// ============================================================

const mongooseOptions = {
  // ==========================================================
  // CONNECTION POOL
  // ==========================================================

  maxPoolSize: 5,

  minPoolSize: 0,

  // ==========================================================
  // TIMEOUTS
  // ==========================================================

  serverSelectionTimeoutMS:
    8000,

  connectTimeoutMS:
    8000,

  socketTimeoutMS:
    20000,

  // ==========================================================
  // IDLE CONNECTION
  // ==========================================================

  maxIdleTimeMS:
    30000,

  // ==========================================================
  // COMMAND BUFFERING
  // ==========================================================

  bufferCommands: false,
};

// ============================================================
// CONNECT DATABASE
// ============================================================

export async function connectDB() {
  // ==========================================================
  // ALREADY CONNECTED
  // ==========================================================

  if (
    cached.conn &&
    mongoose.connection
      .readyState === 1
  ) {
    return cached.conn;
  }

  // ==========================================================
  // CREATE CONNECTION PROMISE ONLY ONCE
  // ==========================================================

  if (!cached.promise) {
    cached.promise =
      mongoose.connect(
        MONGODB_URI,
        mongooseOptions
      );
  }

  // ==========================================================
  // WAIT FOR CONNECTION
  // ==========================================================

  try {
    cached.conn =
      await cached.promise;

    return cached.conn;
  } catch (error) {
    // ========================================================
    // FAILED CONNECTION SHOULD NOT STAY CACHED
    // ========================================================

    cached.conn = null;
    cached.promise = null;

    console.error(
      "MONGODB CONNECTION ERROR:",
      error
    );

    throw error;
  }
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default connectDB;