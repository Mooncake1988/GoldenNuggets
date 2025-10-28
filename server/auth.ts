import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment variables");
}

// Check if the password is a bcrypt hash or plain text
// Bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
const isPasswordHashed = ADMIN_PASSWORD.startsWith("$2") && ADMIN_PASSWORD.length === 60;

// Simple admin user object
interface AdminUser {
  id: string;
  username: string;
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 days
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport-local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Check if username matches
        if (username !== ADMIN_USERNAME) {
          return done(null, false, { message: "Invalid credentials" });
        }

        // Check password - either hashed or plain text for backward compatibility
        let isPasswordValid = false;
        if (isPasswordHashed) {
          // Compare with bcrypt hash
          isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD!);
        } else {
          // Plain text comparison (for backward compatibility)
          isPasswordValid = password === ADMIN_PASSWORD;
        }

        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid credentials" });
        }

        // Authentication successful
        const adminUser: AdminUser = {
          id: "admin",
          username: ADMIN_USERNAME,
        };
        return done(null, adminUser);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize user for session
  passport.serializeUser((user: Express.User, cb) => {
    cb(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user: Express.User, cb) => {
    cb(null, user);
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
