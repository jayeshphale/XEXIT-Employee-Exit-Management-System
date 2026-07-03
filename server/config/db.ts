import mongoose from "mongoose";

let isConnected = false;

/**
 * Connects to MongoDB with robust error handling and connection pooling.
 * Falls back gracefully to guide the user if the URI is not configured yet,
 * preventing server startup crashes.
 */
export async function connectDB(): Promise<boolean> {
  if (isConnected) {
    return true;
  }

  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.warn("\n========================================================");
    console.warn("⚠️ WARNING: MONGODB_URI environment variable is missing!");
    console.warn("The backend will run in DEMO mode with in-memory fallback.");
    console.warn("To enable persistent cloud storage, please add MONGODB_URI");
    console.warn("to your Environment Secrets via the Settings menu.");
    console.warn("========================================================\n");
    return false;
  }

  try {
    const opts = {
      autoIndex: true, // Auto-build indexes in dev/production
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to connect for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    mongoose.connection.on("connected", () => {
      console.log("🚀 MongoDB connected successfully!");
      isConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected.");
      isConnected = false;
    });

    await mongoose.connect(mongoURI, opts);
    return true;
  } catch (error) {
    console.error("❌ Failed to establish initial MongoDB connection:", error);
    return false;
  }
}

/**
 * Checks if the database is currently connected.
 */
export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1 || isConnected;
}
