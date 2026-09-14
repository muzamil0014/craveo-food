// ============================================================
// CRAVEO - MONGODB DATABASE CONNECTION
// NEXT.JS + MONGOOSE
// CONNECTION CACHE + TIMEOUT HANDLING
// ============================================================

import mongoose from "mongoose";

// ============================================================
// MONGODB URI
// ============================================================

const MONGODB_URI =
  process.env.MONGODB_URI;

// ============================================================
// ENV CHECK
// ============================================================

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is missing from .env.local"
  );
}

// ============================================================
// GLOBAL CACHE
//
// Next.js development / Turbopack multiple hot reloads ke
// dauran unnecessary MongoDB connections create nahi karega.
// ============================================================

let cached =
  global.mongoose;

if (!cached) {
  cached =
    global.mongoose = {
      conn: null,
      promise: null,
    };
}

// ============================================================
// CONNECT DATABASE
// ============================================================

export async function connectDB() {
  // ==========================================================
  // ALREADY CONNECTED
  // ==========================================================

  if (cached.conn) {
    return cached.conn;
  }

  // ==========================================================
  // CREATE CONNECTION PROMISE
  // ==========================================================

  if (!cached.promise) {
    const options = {
      // ======================================================
      // CONNECTION POOL
      // ======================================================

      maxPoolSize: 10,

      minPoolSize: 0,

      // ======================================================
      // TIMEOUTS
      //
      // MongoDB unavailable ho to 30+ sec wait nahi karega.
      // ======================================================

      serverSelectionTimeoutMS:
        10000,

      connectTimeoutMS:
        10000,

      socketTimeoutMS:
        20000,

      // ======================================================
      // HEARTBEAT
      // ======================================================

      heartbeatFrequencyMS:
        10000,

      // ======================================================
      // COMMAND BUFFERING
      // ======================================================

      bufferCommands: false,
    };

    cached.promise =
      mongoose
        .connect(
          MONGODB_URI,
          options
        )
        .then(
          (mongooseInstance) => {
            console.log(
              "MongoDB connected successfully."
            );

            return mongooseInstance;
          }
        )
        .catch(
          (error) => {
            // ================================================
            // IMPORTANT:
            // Failed promise cache nahi rehni chahiye.
            // Next request dobara connection try kar sake.
            // ================================================

            cached.promise =
              null;

            console.error(
              "MongoDB connection error:",
              error
            );

            throw error;
          }
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
    cached.conn = null;

    throw error;
  }
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default connectDB;