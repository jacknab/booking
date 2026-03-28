import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { locations, staff } from "@shared/schema";
import { eq } from "drizzle-orm";

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    tableName: "sessions",
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
      },
    })
  );

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { password, firstName, lastName } = req.body;
      const email = typeof req.body.email === "string" ? req.body.email.toLowerCase().trim() : req.body.email;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const [existing] = await db.select().from(users).where(eq(users.email, email));
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const [user] = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          firstName: firstName || null,
          lastName: lastName || null,
        })
        .returning();

      (req.session as any).userId = user.id;
      const { password: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // --- Check users table first ---
      const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));

      if (user) {
        // Google OAuth users have an empty password — they must use Google Sign-In
        if (user.googleId && (!user.password || user.password === "")) {
          return res.status(400).json({
            message: "This account was created with Google. Please use the 'Sign in with Google' button to log in.",
          });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (valid) {
          (req.session as any).userId = user.id;
          const { password: _, ...safeUser } = user;
          return res.json(safeUser);
        }

        // User exists but password is wrong — don't fall through to staff table
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // --- Fallback: check staff table directly ---
      // Staff members created with a password in the staff profile can log in here
      const [staffMember] = await db.select().from(staff).where(eq(staff.email, normalizedEmail));

      if (staffMember && staffMember.password) {
        const validStaffPw = await bcrypt.compare(password, staffMember.password);
        if (validStaffPw) {
          (req.session as any).staffId = staffMember.id;
          const { password: _pw, ...safeStaff } = staffMember;
          // Return a user-compatible shape so the client can work normally
          return res.json({
            id: `staff-${staffMember.id}`,
            email: staffMember.email ?? "",
            role: "staff",
            staffId: staffMember.id,
            firstName: staffMember.name?.split(" ")[0] ?? null,
            lastName: staffMember.name?.split(" ").slice(1).join(" ") || null,
            onboardingCompleted: true,
            passwordChanged: true,
            googleId: null,
            profileImageUrl: staffMember.avatarUrl ?? null,
            subscriptionStatus: "active",
            trialStartedAt: null,
            trialEndsAt: null,
            createdAt: null,
            updatedAt: null,
          });
        }
      }

      return res.status(401).json({ message: "Invalid email or password" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    const userId = (req.session as any)?.userId;
    const staffId = (req.session as any)?.staffId;

    if (!userId && !staffId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // --- Normal user session ---
      if (userId) {
        let [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        if (!user.onboardingCompleted) {
          const userStores = await db.select().from(locations).where(eq(locations.userId, userId));
          if (userStores.length > 0) {
            await db.update(users).set({ onboardingCompleted: true }).where(eq(users.id, userId));
            [user] = await db.select().from(users).where(eq(users.id, userId));
          }
        }

        const { password: _, ...safeUser } = user;
        return res.json(safeUser);
      }

      // --- Staff-only session (logged in via staff table credentials) ---
      if (staffId) {
        const [staffMember] = await db.select().from(staff).where(eq(staff.id, staffId));
        if (!staffMember) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const { password: _pw, ...safeStaff } = staffMember;
        return res.json({
          id: `staff-${staffMember.id}`,
          email: staffMember.email ?? "",
          role: "staff",
          staffId: staffMember.id,
          firstName: staffMember.name?.split(" ")[0] ?? null,
          lastName: staffMember.name?.split(" ").slice(1).join(" ") || null,
          onboardingCompleted: true,
          passwordChanged: true,
          googleId: null,
          profileImageUrl: staffMember.avatarUrl ?? null,
          subscriptionStatus: "active",
          trialStartedAt: null,
          trialEndsAt: null,
          createdAt: null,
          updatedAt: null,
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export const isAdminAuthenticated: RequestHandler = async (req, res, next) => {
  // For development, allow access with a simple admin key or session
  const adminKey = req.headers['x-admin-key'];
  const userId = (req.session as any)?.userId;
  
  // Allow access if either:
  // 1. User is authenticated via session
  // 2. Admin key is provided (for development/testing)
  if (userId || adminKey === 'dev-admin-key-2024') {
    return next();
  }
  
  return res.status(401).json({ message: "Admin access required" });
};
