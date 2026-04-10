# Facebook Reviews Integration

## Overview

Certxa supports collecting Facebook Page reviews/recommendations from your users' business pages. The integration uses Facebook's Graph API (`/{page-id}/ratings`) and requires a registered Facebook App with specific permissions approved through Facebook's App Review process.

This document covers everything needed to go from zero to a fully working live integration.

---

## How It Works (Current State)

The current implementation is a **two-phase approach**:

### Phase 1 — Manual Page Entry (Live Now)
Users go through a connect flow on the Reviews page:

```
Reviews → Google gate → Yelp gate → Facebook gate → Reviews dashboard
```

On the Facebook gate, clicking **"Connect to Facebook"** takes the user to a form where they enter their Facebook Page URL (e.g. `facebook.com/MyBusinessPage`). The Page ID is extracted and saved to the database. This lets you record which users have a Facebook page while the OAuth App is being set up and reviewed.

### Phase 2 — Full OAuth (Requires Facebook App Approval)
Once a Facebook App is approved, the manual form is replaced by a proper OAuth button that automatically fetches the user's page token and begins syncing reviews — no copy-paste required.

---

## Facebook API Details

### Endpoint
```
GET https://graph.facebook.com/v19.0/{page-id}/ratings
```

### Required Fields
| Field | Description |
|---|---|
| `reviewer` | Object with `name` and `id` of the reviewer |
| `rating` | Integer 1–5 (legacy star rating) |
| `recommendation_type` | `"positive"` or `"negative"` (current FB format) |
| `review_text` | The written review body |
| `created_time` | ISO 8601 timestamp |

**Note:** Facebook migrated from star ratings to a recommendations system in 2018. Pages created after that show `recommendation_type` instead of `rating`. Your API responses may contain either format depending on when the reviewer left their review. Handle both.

### Access Token Flow
Facebook requires a **Page Access Token** (not a User Access Token) to read ratings.

```
User logs in via Facebook Login OAuth
  → Get User Access Token
  → Call GET /me/accounts to list managed pages
  → Get Page Access Token for the target page
  → Store Page Access Token + Page ID
  → Call /{page-id}/ratings with Page Access Token
```

### Required Permissions
| Permission | Purpose | App Review Required |
|---|---|---|
| `public_profile` | Basic user identity | No |
| `pages_show_list` | List pages the user manages | Yes |
| `pages_read_engagement` | Read page ratings and reviews | Yes |

---

## Setting Up the Facebook App

### Step 1 — Create a Facebook App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click **My Apps → Create App**
3. Choose **"Business"** as the app type
4. Fill in:
   - **App Name:** `Certxa Reviews`
   - **App Contact Email:** your business email
   - **Business Account:** link to your Meta Business Manager account if you have one
5. Click **Create App**

### Step 2 — Add Facebook Login

1. On the App Dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **"Web"** as the platform
4. Enter your site URL (e.g. `https://your-app.replit.app`)
5. Click **Save**

### Step 3 — Configure OAuth Settings

Go to **Facebook Login → Settings** in the left sidebar:

1. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://your-app.replit.app/api/facebook/callback
   ```
   Add both your production domain and your Replit dev domain.

2. Toggle **"Login with the JavaScript SDK"** OFF (we use server-side OAuth)

3. Toggle **"Enforce HTTPS"** ON

4. Click **Save Changes**

### Step 4 — Add Required Permissions

Go to **App Review → Permissions and Features**:

1. Request `pages_show_list` — click **Request** and fill out the use-case form
2. Request `pages_read_engagement` — click **Request** and fill out the use-case form

For each permission you'll need to provide:
- A **screencast video** showing how your app uses the permission
- A **written description** of your use case
- A **test user** or test page Facebook can use to verify

**Example use-case statement for `pages_read_engagement`:**
> "Certxa is a business management platform. When a business owner connects their Facebook Page, we read public reviews and recommendations left by their customers using the `/{page-id}/ratings` endpoint. We display these reviews inside the business owner's dashboard so they can monitor and respond to customer feedback from one place. We never modify or delete any content on the Page."

### Step 5 — Get Your App Credentials

Go to **Settings → Basic**:

- Copy **App ID**
- Click **Show** next to **App Secret** and copy it

These go into your environment secrets (see below).

---

## Environment Variables

Add these two secrets to the project:

| Variable | Where to Find It |
|---|---|
| `FACEBOOK_APP_ID` | App Dashboard → Settings → Basic → App ID |
| `FACEBOOK_APP_SECRET` | App Dashboard → Settings → Basic → App Secret |

---

## App Review Timeline

Facebook's App Review process typically takes:

| Stage | Time |
|---|---|
| Submission | Immediate |
| Initial review | 2–5 business days |
| Additional info requested | Varies |
| Final approval | 1–3 days after any fixes |

**Tips to speed up approval:**
- Record a clear screencast (Loom works well) showing the exact steps: log in → connect Facebook page → see reviews appear in Certxa dashboard
- Use a real Facebook Page with at least a few public reviews in your demo
- Keep your privacy policy URL up to date on the App settings page
- Make sure your app's **Privacy Policy** explicitly mentions that you access Facebook review data

---

## Database Schema

The `facebook_page_id` column was added to the `locations` table:

```typescript
// shared/schema.ts
facebookPageId: text("facebook_page_id"),
```

This stores the Page username or ID entered by the user (e.g. `MyBusinessPage` or `123456789`).

---

## API Endpoint

A REST endpoint saves the Facebook Page ID for a store:

```
PUT /api/stores/:storeId/facebook-page
```

**Request body:**
```json
{ "facebookPageId": "MyBusinessPage" }
```

**Response:**
```json
{ "success": true, "facebookPageId": "MyBusinessPage" }
```

**Auth:** Requires active session. The endpoint verifies the store belongs to the authenticated user before saving.

---

## Implementing Phase 2 — Full OAuth Flow

When your Facebook App is approved, here is what needs to be built:

### Server-side (Express)

```typescript
// 1. Generate OAuth URL
app.get("/api/facebook/auth-url", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  req.session.facebookOAuthState = state;

  const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  url.searchParams.set("client_id", process.env.FACEBOOK_APP_ID!);
  url.searchParams.set("redirect_uri", process.env.FACEBOOK_REDIRECT_URI!);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "pages_show_list,pages_read_engagement");

  res.json({ authUrl: url.toString() });
});

// 2. Handle callback — exchange code for token
app.post("/api/facebook/callback", async (req, res) => {
  const { code, state, storeId } = req.body;

  // Verify CSRF state
  if (state !== req.session.facebookOAuthState) {
    return res.status(400).json({ message: "Invalid state" });
  }

  // Exchange code for user access token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token` +
    `?client_id=${process.env.FACEBOOK_APP_ID}` +
    `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
    `&redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI!)}` +
    `&code=${code}`
  );
  const { access_token } = await tokenRes.json();

  // List managed pages
  const pagesRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${access_token}`
  );
  const { data: pages } = await pagesRes.json();

  // Return pages to frontend for user to select
  res.json({ pages });
});

// 3. Sync reviews for a connected page
app.post("/api/facebook/sync-reviews/:storeId", async (req, res) => {
  const { pageId, pageAccessToken } = req.body;

  const reviewsRes = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/ratings` +
    `?fields=reviewer,rating,recommendation_type,review_text,created_time` +
    `&access_token=${pageAccessToken}&limit=100`
  );
  const { data: reviews } = await reviewsRes.json();

  // Save reviews to your database here
  // Map recommendation_type → rating: "positive" = 5, "negative" = 1
  res.json({ synced: reviews.length });
});
```

### Frontend — Replace Manual Form

Once OAuth is ready, swap `FacebookPageForm` with a button that calls `/api/facebook/auth-url` and redirects — the same pattern used for Google:

```typescript
async function handleFacebookConnect() {
  const res = await fetch("/api/facebook/auth-url", { credentials: "include" });
  const { authUrl } = await res.json();
  window.location.href = authUrl;
}
```

---

## Testing Without App Review

During development, only users who are **Admins, Developers, or Testers** of the Facebook App can use permissions that haven't been approved yet. To test:

1. Go to **Roles → Test Users** in the App Dashboard
2. Add yourself or a team member as a **Developer** on the app
3. Use a Facebook account that manages a real Business Page with public reviews

This lets you build and test the full OAuth flow before submitting for App Review.

---

## Privacy Policy Requirement

Facebook requires a publicly accessible Privacy Policy before approving any permissions. Make sure your privacy policy includes language like:

> "When you connect your Facebook Business Page, Certxa accesses your page's public reviews and recommendations through the Facebook Graph API. We use this data solely to display your customer feedback within your Certxa dashboard. We do not share this data with third parties, and we do not post, modify, or delete any content on your Facebook Page."

---

## Support Resources

- [Facebook Graph API — Ratings](https://developers.facebook.com/docs/graph-api/reference/page/ratings/)
- [Facebook Login — Permissions Reference](https://developers.facebook.com/docs/permissions)
- [App Review — Getting Started](https://developers.facebook.com/docs/app-review)
- [Facebook App Dashboard](https://developers.facebook.com/apps)
