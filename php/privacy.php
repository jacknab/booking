<?php
define('BRAND_NAME',     'Certxa');
define('PAGE_TITLE',     'Privacy Policy | Certxa');
define('PAGE_DESC',      'Certxa Privacy Policy — how we collect, use, and protect your personal data, including information obtained through Google Business Profile API integration.');
define('PAGE_KEYWORDS',  'certxa privacy policy, data protection, GDPR, Google Business Profile API, salon software privacy');
define('PAGE_CANONICAL', 'https://certxa.com/privacy');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home',           'url'=>'https://certxa.com/overview.php'],
  ['name'=>'Privacy Policy', 'url'=>'https://certxa.com/privacy'],
]));
require 'includes/header.php';
require 'includes/nav.php';

$updated = 'May 10, 2025';
$effective = 'May 10, 2025';
?>

<style>
.legal-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 80px 24px 60px;
  text-align: center;
  color: #fff;
}
.legal-hero h1 {
  font-family: 'Inter', sans-serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  letter-spacing: -.03em;
  margin: 0 0 12px;
}
.legal-hero p {
  color: #94a3b8;
  font-size: 1rem;
  margin: 0;
  font-family: 'Inter', sans-serif;
}
.legal-wrap {
  max-width: 820px;
  margin: 0 auto;
  padding: 64px 24px 100px;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
  line-height: 1.75;
}
.legal-wrap h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin: 52px 0 12px;
  letter-spacing: -.02em;
  padding-bottom: 10px;
  border-bottom: 2px solid #f1f5f9;
}
.legal-wrap h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin: 28px 0 8px;
}
.legal-wrap p, .legal-wrap li {
  font-size: .96rem;
  color: #334155;
}
.legal-wrap ul, .legal-wrap ol {
  margin: 10px 0 16px;
  padding-left: 22px;
}
.legal-wrap li { margin-bottom: 6px; }
.legal-wrap a { color: #6366f1; text-decoration: none; }
.legal-wrap a:hover { text-decoration: underline; }
.notice-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 20px 24px;
  margin: 32px 0;
}
.notice-box p { margin: 0; color: #1e40af; font-size: .92rem; }
.google-box {
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 10px;
  padding: 24px 28px;
  margin: 24px 0;
}
.google-box h3 { color: #15803d; margin-top: 0; }
.google-box p, .google-box li { color: #166534; }
.toc {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px 28px;
  margin: 28px 0 40px;
}
.toc p { font-weight: 700; margin: 0 0 10px; font-size: .9rem; color: #0f172a; }
.toc ol { margin: 0; padding-left: 18px; }
.toc li { font-size: .88rem; margin-bottom: 4px; }
</style>

<div class="legal-hero">
  <h1>Privacy Policy</h1>
  <p>Effective: <?= $effective ?> &nbsp;·&nbsp; Last updated: <?= $updated ?></p>
</div>

<div class="legal-wrap">

  <div class="notice-box">
    <p><strong>Plain-English summary:</strong> Certxa collects only what we need to run our service. We never sell your data. We never share it with third parties for advertising. If you connect Google Business Profile, your Google data is used solely to display and manage your reviews inside Certxa. You can disconnect at any time.</p>
  </div>

  <div class="toc">
    <p>Table of Contents</p>
    <ol>
      <li><a href="#who-we-are">Who We Are</a></li>
      <li><a href="#data-we-collect">Data We Collect</a></li>
      <li><a href="#google-api">Google Business Profile API Data</a></li>
      <li><a href="#how-we-use">How We Use Your Data</a></li>
      <li><a href="#sharing">Data Sharing &amp; Third Parties</a></li>
      <li><a href="#retention">Data Retention</a></li>
      <li><a href="#security">Security</a></li>
      <li><a href="#your-rights">Your Rights</a></li>
      <li><a href="#cookies">Cookies &amp; Tracking</a></li>
      <li><a href="#children">Children's Privacy</a></li>
      <li><a href="#changes">Changes to This Policy</a></li>
      <li><a href="#contact">Contact Us</a></li>
    </ol>
  </div>

  <!-- 1 -->
  <h2 id="who-we-are">1. Who We Are</h2>
  <p>Certxa ("Certxa", "we", "us", "our") operates the salon management platform available at <a href="https://certxa.com">certxa.com</a> and its sub-domains. We provide appointment scheduling, point-of-sale, client management, loyalty programs, and Google Business Profile review management to beauty and wellness professionals.</p>
  <p>For questions about this policy, contact us at <a href="mailto:privacy@certxa.com">privacy@certxa.com</a>.</p>

  <!-- 2 -->
  <h2 id="data-we-collect">2. Data We Collect</h2>

  <h3>Account &amp; Profile Data</h3>
  <ul>
    <li>Name, email address, phone number</li>
    <li>Business name, address, and type (salon, barbershop, spa, etc.)</li>
    <li>Password (stored as a salted bcrypt hash — never in plain text)</li>
    <li>Profile photo (if uploaded)</li>
    <li>Billing information (processed by Stripe — we do not store full card numbers)</li>
  </ul>

  <h3>Operational Data</h3>
  <ul>
    <li>Appointment records, service history, and client notes</li>
    <li>Staff schedules and commission rates</li>
    <li>Payment records and cash drawer logs</li>
    <li>Inventory and product records</li>
    <li>SMS and email communication logs</li>
  </ul>

  <h3>Client Data You Provide</h3>
  <p>When you add clients to Certxa, you provide us with their names, phone numbers, email addresses, and service history. You represent that you have obtained any necessary consent from your clients to provide this information to us and to contact them through our platform.</p>

  <h3>Usage &amp; Technical Data</h3>
  <ul>
    <li>Log data: IP address, browser type, pages visited, timestamps</li>
    <li>Device information: screen resolution, operating system</li>
    <li>Session tokens (stored in encrypted, server-side sessions)</li>
  </ul>

  <!-- 3 -->
  <h2 id="google-api">3. Google Business Profile API Data</h2>

  <div class="google-box">
    <h3>Google API Services User Data Policy</h3>
    <p>Certxa's use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" style="color:#15803d;">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
  </div>

  <h3>What We Access</h3>
  <p>When you choose to connect your Google Business Profile to Certxa, we request the following OAuth 2.0 scope:</p>
  <ul>
    <li><code>https://www.googleapis.com/auth/business.manage</code> — allows us to list your Google Business accounts, locations, and read/respond to reviews on your behalf.</li>
  </ul>
  <p>Using this scope, we access:</p>
  <ul>
    <li>Your Google Business account name(s) and account IDs</li>
    <li>Business location names, addresses, and location IDs</li>
    <li>Customer reviews posted on your Google Business Profile (reviewer name, star rating, review text, and date)</li>
    <li>Your existing review replies (if any)</li>
  </ul>

  <h3>What We Do With This Data</h3>
  <ul>
    <li><strong>Display:</strong> We show your Google reviews inside the Certxa dashboard so you can read and respond to them without leaving the app.</li>
    <li><strong>Store:</strong> We store a copy of your reviews in our database to power search, filtering, and analytics features within your account.</li>
    <li><strong>Respond:</strong> When you write a reply in Certxa, we post it to Google on your behalf using the API.</li>
    <li><strong>Sync:</strong> We periodically sync new reviews automatically (every 6 hours) so your dashboard stays current.</li>
  </ul>

  <h3>What We Do NOT Do</h3>
  <ul>
    <li>We do <strong>not</strong> sell, rent, or share your Google review data with any third party.</li>
    <li>We do <strong>not</strong> use your Google data to serve you advertisements.</li>
    <li>We do <strong>not</strong> automatically delete, hide, or manipulate any reviews.</li>
    <li>We do <strong>not</strong> generate or post fake reviews.</li>
    <li>We do <strong>not</strong> transfer your Google data to any AI model training pipeline.</li>
    <li>We do <strong>not</strong> use Google data for any purpose other than providing the review management features you requested.</li>
  </ul>

  <h3>OAuth Tokens</h3>
  <p>When you authorize Google access, Google provides Certxa with an access token and a refresh token. These tokens:</p>
  <ul>
    <li>Are stored encrypted in our database (never in browser storage or logs)</li>
    <li>Are never transmitted to your browser or to any third party</li>
    <li>Are used exclusively to make API calls on your behalf</li>
    <li>Are deleted from our database when you disconnect your Google account</li>
  </ul>

  <h3>Disconnecting Google</h3>
  <p>You can disconnect your Google Business Profile at any time by navigating to <strong>Settings → Integrations → Google Business Profile → Disconnect</strong>. Upon disconnection:</p>
  <ul>
    <li>Your OAuth tokens are deleted immediately from our database</li>
    <li>Automatic review syncing stops immediately</li>
    <li>Previously synced reviews remain in your Certxa account unless you also request data deletion (see Section 7)</li>
  </ul>
  <p>You can also revoke access independently through your <a href="https://myaccount.google.com/permissions">Google Account permissions page</a>.</p>

  <!-- 4 -->
  <h2 id="how-we-use">4. How We Use Your Data</h2>
  <ul>
    <li><strong>To provide the service:</strong> Running your calendar, bookings, payments, and client management</li>
    <li><strong>To communicate with you:</strong> Account alerts, billing notices, product updates (you can opt out of marketing)</li>
    <li><strong>To support you:</strong> Diagnosing and fixing technical issues</li>
    <li><strong>To improve Certxa:</strong> Aggregated, anonymised usage analytics (never individual-level data shared externally)</li>
    <li><strong>To comply with law:</strong> Fraud prevention, legal obligations, and enforcement of our Terms of Service</li>
  </ul>

  <!-- 5 -->
  <h2 id="sharing">5. Data Sharing &amp; Third Parties</h2>
  <p>We do not sell your personal data. We share data only with the following categories of service providers, strictly to operate Certxa:</p>
  <ul>
    <li><strong>Stripe</strong> — payment processing (governed by Stripe's privacy policy)</li>
    <li><strong>Twilio</strong> — SMS delivery for appointment reminders</li>
    <li><strong>Mailgun / Postmark</strong> — transactional email</li>
    <li><strong>Google APIs</strong> — only data you explicitly authorise us to send/receive</li>
    <li><strong>Cloud hosting</strong> — our servers where your data is stored</li>
  </ul>
  <p>We require all service providers to maintain appropriate data protection standards. We do not allow them to use your data for their own purposes.</p>
  <p>We may disclose data if required by law, court order, or to protect the rights, property, or safety of Certxa, our users, or the public.</p>

  <!-- 6 -->
  <h2 id="retention">6. Data Retention</h2>
  <ul>
    <li><strong>Active accounts:</strong> Data is retained for the duration of your subscription.</li>
    <li><strong>Cancelled accounts:</strong> We retain data for 90 days after cancellation to allow account recovery, then delete or anonymise it.</li>
    <li><strong>Google API data:</strong> OAuth tokens are deleted immediately on disconnection. Synced review records are deleted within 30 days of account deletion.</li>
    <li><strong>Billing records:</strong> Retained for 7 years as required by financial regulations.</li>
    <li><strong>Logs:</strong> Server logs are retained for 30 days for security monitoring, then purged.</li>
  </ul>

  <!-- 7 -->
  <h2 id="security">7. Security</h2>
  <ul>
    <li>All data is transmitted over HTTPS/TLS — never plain HTTP</li>
    <li>Passwords are stored using bcrypt with per-user salts</li>
    <li>OAuth tokens are stored encrypted at rest</li>
    <li>Client secrets and API keys are stored as server-side environment secrets, never committed to source code or logged</li>
    <li>Session tokens use HttpOnly, Secure, SameSite=Lax cookies</li>
    <li>Database access is restricted to application servers; no public access</li>
    <li>We perform periodic security reviews and dependency audits</li>
  </ul>
  <p>If you believe you have found a security vulnerability, please report it to <a href="mailto:security@certxa.com">security@certxa.com</a>.</p>

  <!-- 8 -->
  <h2 id="your-rights">8. Your Rights</h2>
  <p>Depending on your jurisdiction, you may have the following rights:</p>
  <ul>
    <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
    <li><strong>Correction:</strong> Correct inaccurate or incomplete data</li>
    <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
    <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
    <li><strong>Objection:</strong> Object to processing for direct marketing purposes</li>
    <li><strong>Restriction:</strong> Request we restrict processing in certain circumstances</li>
  </ul>
  <p>To exercise any of these rights, email <a href="mailto:privacy@certxa.com">privacy@certxa.com</a>. We will respond within 30 days. For Google-specific data, you may also manage access via your <a href="https://myaccount.google.com/permissions">Google Account</a>.</p>

  <!-- 9 -->
  <h2 id="cookies">9. Cookies &amp; Tracking</h2>
  <p>We use the following types of cookies:</p>
  <ul>
    <li><strong>Strictly necessary:</strong> Session cookie for authentication — cannot be disabled</li>
    <li><strong>Functional:</strong> Remember your UI preferences (e.g., theme, timezone)</li>
    <li><strong>Analytics:</strong> Aggregated, anonymised page-view analytics — no cross-site tracking</li>
  </ul>
  <p>We do not use third-party advertising cookies. You can manage cookies through your browser settings.</p>

  <!-- 10 -->
  <h2 id="children">10. Children's Privacy</h2>
  <p>Certxa is a business platform intended for users aged 18 and over. We do not knowingly collect personal data from children under 13. If we become aware that we have collected data from a child under 13, we will delete it promptly.</p>

  <!-- 11 -->
  <h2 id="changes">11. Changes to This Policy</h2>
  <p>We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email (to the address on your account) and post the updated policy here with a revised "Last updated" date. Continued use of Certxa after the effective date constitutes acceptance of the updated policy.</p>

  <!-- 12 -->
  <h2 id="contact">12. Contact Us</h2>
  <p>For privacy-related questions, data requests, or to exercise your rights:</p>
  <ul>
    <li><strong>Email:</strong> <a href="mailto:privacy@certxa.com">privacy@certxa.com</a></li>
    <li><strong>Support:</strong> <a href="mailto:support@certxa.com">support@certxa.com</a></li>
    <li><strong>Website:</strong> <a href="/contact.php">certxa.com/contact</a></li>
  </ul>

</div>

<?php require 'includes/footer.php'; ?>
