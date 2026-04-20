import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { locations, staff, passwordResetTokens } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { sendEmail } from "./mail";

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
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
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
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
      req.session.save((err) => {
        if (err) {
          console.error("Session save error after registration:", err);
          return res.status(500).json({ message: "Session could not be saved" });
        }
        res.status(201).json(safeUser);
      });
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
          return req.session.save((err) => {
            if (err) {
              console.error("Session save error after login:", err);
              return res.status(500).json({ message: "Session could not be saved" });
            }
            return res.json(safeUser);
          });
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
          const staffResponse = {
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
          };
          return req.session.save((err) => {
            if (err) {
              console.error("Session save error after staff login:", err);
              return res.status(500).json({ message: "Session could not be saved" });
            }
            return res.json(staffResponse);
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

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const normalizedEmail = email.toLowerCase().trim();
      const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));

      // Always return 200 to prevent email enumeration attacks
      if (!user) return res.json({ message: "If that email is registered, a reset link has been sent." });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      const appUrl = process.env.APP_URL || `https://${process.env.REPLIT_DEV_DOMAIN || "localhost:5000"}`;
      const resetUrl = `${appUrl}/reset-password?token=${token}`;

      const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Reset your Certxa password</h2>
          <p>Hi ${user.firstName || "there"},</p>
          <p>We received a request to reset your password. Click the link below to set a new one:</p>
          <p><a href="${resetUrl}" style="background:#111;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a></p>
          <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>`;

      await sendEmail(0, normalizedEmail, "Reset your Certxa password", html);

      res.json({ message: "If that email is registered, a reset link has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ message: "Token and password are required" });
      if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

      const now = new Date();
      const [resetRecord] = await db
        .select()
        .from(passwordResetTokens)
        .where(and(eq(passwordResetTokens.token, token), gt(passwordResetTokens.expiresAt, now)));

      if (!resetRecord) return res.status(400).json({ message: "Invalid or expired reset link. Please request a new one." });
      if (resetRecord.usedAt) return res.status(400).json({ message: "This reset link has already been used." });

      const hashed = await bcrypt.hash(password, 10);
      await db.update(users).set({ password: hashed }).where(eq(users.id, resetRecord.userId));
      await db.update(passwordResetTokens).set({ usedAt: now }).where(eq(passwordResetTokens.id, resetRecord.id));

      res.json({ message: "Password updated successfully. You can now log in." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
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
