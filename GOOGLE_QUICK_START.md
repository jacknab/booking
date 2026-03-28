# Google Business Profile Integration - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Install Dependencies
Already done! Your `package.json` has been updated with:
- `googleapis` - Google APIs client
- `google-auth-library` - OAuth2 support

Run: `npm install`

### 2. Get Google Credentials (15 minutes)

Follow this condensed guide:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project → "Booking Platform - Google Reviews"
3. Search & enable APIs:
   - My Business Business Information API
   - My Business Account Management API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - User type: External
   - App name: Booking Platform - Google Reviews
   - Scopes: Add `https://www.googleapis.com/auth/business.manage`
6. Create Web Application credentials with redirect URIs:
   - http://localhost:5173/api/google-business/callback
   - http://localhost:3000/api/google-business/callback
   - https://yourdomain.com/api/google-business/callback (production)

### 3. Add Environment Variables

Create or update `.env`:

```bash
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:5173/api/google-business/callback
```

### 4. Database Migration

Run: `npm run db:push`

This creates tables:
- `google_business_profiles` - Stores connection info
- `google_reviews` - Stores fetched reviews
- `google_review_responses` - Stores staff responses

### 5. Restart Server

```bash
npm run dev
```

## 🎯 What You Get

### Backend Features
✅ OAuth2 authentication with Google  
✅ Review syncing from Google Business Profile  
✅ Draft/publish review responses  
✅ Review statistics & analytics  
✅ Automatic token refresh  

### Frontend Components
✅ Setup wizard for connecting Google account  
✅ Review list with filters (rating, response status)  
✅ Review detail view with response dialog  
✅ Review statistics dashboard  
✅ Sync trigger button  

### API Endpoints (13 total)
See full docs in `GOOGLE_BUSINESS_SETUP.md`

## 📧 Integration Points

### Next Steps (Optional but Recommended)

1. **Email Notifications**
```typescript
// Send email when new low-rating review arrives
if (review.rating <= 2) {
  await sendReviewAlertEmail(store.email, review);
}
```

2. **SMS Notifications**
```typescript
// Already have SMS system, use it for review alerts
if (review.rating >= 5 && !review.hasResponse) {
  await sendSMS(store.phone, `Great 5-star review! Respond to it.`);
}
```

3. **Dashboard Widget**
```typescript
// Add to dashboard
<ReviewStatsWidget storeId={storeId} />
```

4. **Automated Responses**
```typescript
// Optional: Template-based responses
const templates = {
  5: "Thank you so much for the amazing review!",
  4: "We're glad you had a great experience!",
  3: "Thank you for your feedback. We'd love to improve!",
  2: "We're sorry to hear this. Please contact us.",
  1: "We sincerely apologize. We'd like to make this right.",
};
```

## 🚀 Deploying to Production

1. Update redirect URIs in Google Cloud Console with your domain
2. Update `.env` with production Google credentials
3. Set `GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-business/callback`
4. Ensure HTTPS is enabled
5. Submit for Google approval (see `GOOGLE_APPROVAL_CHECKLIST.md`)
6. Deploy!

## 🐛 Testing Locally

1. Use test Google account (add to OAuth consent screen)
2. Test full flow:
   ```
   - Click "Connect Google"
   - Sign in with test account
   - Select business account
   - Select location
   - View reviews
   - Create response
   - Publish response
   ```

3. Check database:
   ```sql
   SELECT * FROM google_business_profiles WHERE store_id = YOUR_STORE_ID;
   SELECT * FROM google_reviews WHERE store_id = YOUR_STORE_ID LIMIT 5;
   ```

## 📁 Files Added/Modified

**New Files:**
- `/server/google-business-api.ts` - API client & sync logic
- `/client/src/components/GoogleReviewsManager.tsx` - Review list UI
- `/client/src/components/GoogleBusinessProfileSetup.tsx` - Setup wizard
- `/client/src/components/ReviewResponseDialog.tsx` - Response dialog
- `/migrations/0004_add_google_business_profile.sql` - Database schema
- `GOOGLE_BUSINESS_SETUP.md` - Detailed setup guide
- `GOOGLE_APPROVAL_CHECKLIST.md` - Approval requirements

**Modified Files:**
- `package.json` - Added dependencies
- `/shared/schema.ts` - Added DB tables & types
- `/server/routes.ts` - Added 13 API endpoints

## ⚠️ Important Notes

1. **Never commit credentials** - Use `.env` files
2. **Tokens are encrypted** - Sensitive data stored securely
3. **Users control access** - Can disconnect anytime
4. **No auto-deletion** - Reviews cannot be deleted programmatically
5. **Sync on demand** - Reviews sync when requested
6. **Rate limiting ready** - Handle Google's API limits gracefully

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Your Booking Platform                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend (React)                                         │
│  ├─ GoogleBusinessProfileSetup (OAuth flow)             │
│  ├─ GoogleReviewsManager (list & filter)                │
│  └─ ReviewResponseDialog (draft & publish)              │
│                                                           │
│  Backend (Express + Node.js)                            │
│  ├─ POST /api/google-business/auth-url                 │
│  ├─ POST /api/google-business/callback                 │
│  ├─ GET /api/google-business/reviews/:storeId          │
│  ├─ POST /api/google-business/review-response          │
│  └─ POST /api/google-business/review-response/publish  │
│                                                           │
│  Database (PostgreSQL)                                   │
│  ├─ google_business_profiles (OAuth tokens)            │
│  ├─ google_reviews (synced reviews)                    │
│  └─ google_review_responses (staff responses)          │
│                                                           │
│  Google APIs                                             │
│  ├─ My Business Account Management API                 │
│  └─ My Business Business Information API               │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## 🔗 Resources

- [Google My Business API Docs](https://developers.google.com/my-business/content/overview)
- [OAuth2 Guide](https://developers.google.com/identity/protocols/oauth2)
- [API Error Codes](https://developers.google.com/my-business/content/error-codes)
- [Rate Limits](https://developers.google.com/my-business/content/limits)

## 💡 Pro Tips

1. **Batch syncs** - Sync all stores at once during off-peak hours
2. **Cache reviews** - Don't re-fetch unchanged reviews
3. **Alert on events** - Email owner for negative reviews or unanswered reviews
4. **Widget on dashboard** - Show review stats at a glance
5. **Customer linking** - Map reviews to booking customers automatically
6. **Analytics** - Track review trends over time
7. **Bulk responses** - Template-based responses for common themes

## 🆘 Support

If you encounter issues:

1. Check `GOOGLE_BUSINESS_SETUP.md` for detailed setup
2. Review `GOOGLE_APPROVAL_CHECKLIST.md` for policy compliance
3. Check server logs: `npm run dev`
4. Check browser console for client-side errors
5. Verify `.env` variables are set correctly
6. Ensure Google APIs are enabled in Cloud Console

---

**You're ready to go! 🎉 Start with the setup wizard and let your users manage reviews directly in your platform.**
