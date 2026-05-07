import { Router } from "express";
import { db, pool } from "../db";
import { locations } from "../../shared/schema";
import { users } from "../../shared/models/auth";
import { eq } from "drizzle-orm";

const router = Router();

// Lightweight auth guard — returns 401 if no session
function requireAuth(req: any, res: any, next: any) {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  next();
}

// GET /api/manage/overview
// Returns the logged-in user's profile, SalonOS stores, and LaunchSite websites.
router.get("/overview", requireAuth, async (req: any, res) => {
  try {
    const userId: string = req.session.userId;

    // User profile
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        subscriptionStatus: users.subscriptionStatus,
        trialEndsAt: users.trialEndsAt,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) return res.status(404).json({ error: "User not found" });

    // SalonOS stores owned by this user
    const stores = await db
      .select({
        id: locations.id,
        name: locations.name,
        bookingSlug: locations.bookingSlug,
        timezone: locations.timezone,
        phone: locations.phone,
        address: locations.address,
      })
      .from(locations)
      .where(eq(locations.userId, userId));

    // LaunchSite websites linked to user's email
    let websites: any[] = [];
    try {
      const result = await pool.query(
        `SELECT os.id, os.business_name, os.template_id, os.status, os.email,
                s.slug
         FROM   onboarding_submissions os
         LEFT   JOIN subdomains s ON s.submission_id = os.id
         WHERE  os.email = $1
         ORDER  BY os.id DESC`,
        [user.email]
      );
      websites = result.rows;
    } catch {
      // Table may not exist in this environment — gracefully return empty
      websites = [];
    }

    res.json({ user, salonos: { stores }, launchsite: { websites } });
  } catch (err: any) {
    console.error("[Manage] overview error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/manage/logout — shared logout that clears the cross-subdomain session
router.post("/logout", (req: any, res) => {
  req.session.destroy((err: any) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("connect.sid", {
      domain: process.env.NODE_ENV === "production" ? ".certxa.com" : undefined,
      path: "/",
    });
    res.json({ ok: true });
  });
});

export default router;
