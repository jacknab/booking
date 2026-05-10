<?php
define('BRAND_NAME',     'Certxa');
define('PAGE_TITLE',     'Terms of Service | Certxa');
define('PAGE_DESC',      'Certxa Terms of Service — the agreement between you and Certxa governing use of our salon management platform, including booking, payments, and Google Business Profile integrations.');
define('PAGE_KEYWORDS',  'certxa terms of service, terms and conditions, salon software agreement, user agreement');
define('PAGE_CANONICAL', 'https://certxa.com/terms');
define('PAGE_BREADCRUMBS', json_encode([
  ['name'=>'Home',             'url'=>'https://certxa.com/overview'],
  ['name'=>'Terms of Service', 'url'=>'https://certxa.com/terms'],
]));
require 'includes/header.php';
require 'includes/nav.php';

$updated = 'May 10, 2025';
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
  <h1>Terms of Service</h1>
  <p>Last updated: <?= $updated ?></p>
</div>

<div class="legal-wrap">

  <div class="notice-box">
    <p>Please read these Terms of Service carefully before using Certxa. By creating an account or using our platform, you agree to be bound by these terms. If you do not agree, do not use Certxa.</p>
  </div>

  <div class="toc">
    <p>Table of Contents</p>
    <ol>
      <li><a href="#acceptance">Acceptance of Terms</a></li>
      <li><a href="#description">Description of Service</a></li>
      <li><a href="#account">Account Registration</a></li>
      <li><a href="#subscription">Subscription &amp; Billing</a></li>
      <li><a href="#acceptable-use">Acceptable Use</a></li>
      <li><a href="#google-integration">Google Business Profile Integration</a></li>
      <li><a href="#client-data">Client Data &amp; Privacy</a></li>
      <li><a href="#intellectual-property">Intellectual Property</a></li>
      <li><a href="#disclaimer">Disclaimers &amp; Limitations</a></li>
      <li><a href="#termination">Termination</a></li>
      <li><a href="#governing-law">Governing Law</a></li>
      <li><a href="#changes">Changes to Terms</a></li>
      <li><a href="#contact">Contact</a></li>
    </ol>
  </div>

  <h2 id="acceptance">1. Acceptance of Terms</h2>
  <p>These Terms of Service ("Terms") constitute a binding legal agreement between you (the "User", "you") and Certxa ("Certxa", "we", "us"). By accessing or using the Certxa platform, website, mobile applications, or APIs (collectively, the "Service"), you agree to these Terms and our <a href="/privacy">Privacy Policy</a>.</p>
  <p>If you are using Certxa on behalf of a business, you represent that you have authority to bind that business to these Terms.</p>

  <h2 id="description">2. Description of Service</h2>
  <p>Certxa is a salon and beauty business management platform providing:</p>
  <ul>
    <li>Online appointment booking and calendar management</li>
    <li>Point-of-sale (POS) and payment processing</li>
    <li>Client relationship management (CRM)</li>
    <li>Staff scheduling and management</li>
    <li>Loyalty and gift card programs</li>
    <li>SMS and email marketing and reminders</li>
    <li>Google Business Profile review management (via Google API)</li>
    <li>Website builder (LaunchSite)</li>
  </ul>
  <p>We reserve the right to modify, suspend, or discontinue any feature of the Service at any time with reasonable notice.</p>

  <h2 id="account">3. Account Registration</h2>
  <ul>
    <li>You must be at least 18 years old to create an account.</li>
    <li>You must provide accurate, current, and complete information during registration.</li>
    <li>You are responsible for maintaining the security of your account credentials.</li>
    <li>You must notify us immediately at <a href="mailto:support@certxa.com">support@certxa.com</a> of any unauthorized access to your account.</li>
    <li>One person or entity may not maintain more than one free trial account.</li>
  </ul>

  <h2 id="subscription">4. Subscription &amp; Billing</h2>

  <h3>Free Trial</h3>
  <p>Certxa offers a free 60-day trial with full feature access. No credit card is required to start a trial. At the end of the trial, you must subscribe to continue using the Service.</p>

  <h3>Paid Subscriptions</h3>
  <ul>
    <li>Subscription fees are charged monthly in advance.</li>
    <li>Prices are listed at <a href="/pricing">certxa.com/pricing</a> and may change with 30 days' notice.</li>
    <li>All fees are non-refundable except where required by law.</li>
    <li>If payment fails, we may suspend your account after a 7-day grace period.</li>
  </ul>

  <h3>Cancellation</h3>
  <p>You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. You retain access to the Service until then.</p>

  <h3>Payment Processing</h3>
  <p>In-app payments are processed by Stripe. By using payment features, you also agree to <a href="https://stripe.com/legal/ssa" target="_blank" rel="noopener">Stripe's Services Agreement</a>. Payment processing fees (2.49% + $0.15 per transaction) are separate from subscription fees.</p>

  <h2 id="acceptable-use">5. Acceptable Use</h2>
  <p>You agree not to use the Service to:</p>
  <ul>
    <li>Violate any applicable law or regulation</li>
    <li>Transmit spam, unsolicited communications, or harass any person</li>
    <li>Upload malicious code, viruses, or interfere with the Service's infrastructure</li>
    <li>Attempt to gain unauthorized access to other accounts or systems</li>
    <li>Scrape, crawl, or extract data from the Service without our written permission</li>
    <li>Resell or sublicense the Service without written authorization</li>
    <li>Use the Service for any unlawful purpose, including fraud or money laundering</li>
    <li>Impersonate any person or entity</li>
  </ul>
  <p>We may suspend or terminate accounts that violate these restrictions.</p>

  <h2 id="google-integration">6. Google Business Profile Integration</h2>
  <p>Certxa offers optional integration with the Google Business Profile API. By connecting your Google account:</p>
  <ul>
    <li>You authorize Certxa to access your Google Business Profile accounts, locations, and reviews on your behalf, using the <code>business.manage</code> OAuth scope.</li>
    <li>You represent that you are the authorized owner or manager of the Google Business Profile(s) you connect.</li>
    <li>You agree to comply with <a href="https://policies.google.com/terms" target="_blank" rel="noopener">Google's Terms of Service</a> and the <a href="https://support.google.com/business/answer/7667250" target="_blank" rel="noopener">Google Business Profile policies</a>.</li>
    <li>Certxa will only access Google data as described in our <a href="/privacy#google-api">Privacy Policy</a> and in compliance with the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener">Google API Services User Data Policy</a>.</li>
    <li>You acknowledge that Certxa does not guarantee continuous availability of the Google integration, as it depends on Google's API availability and policies.</li>
    <li>You agree not to use the integration to manipulate, fabricate, or suppress reviews, which would violate Google's policies and these Terms.</li>
  </ul>

  <h2 id="client-data">7. Client Data &amp; Privacy</h2>
  <p>You ("data controller") own the client data you input into Certxa. Certxa acts as a data processor on your behalf. You are responsible for:</p>
  <ul>
    <li>Obtaining any necessary consents from your clients to store and use their data through Certxa</li>
    <li>Complying with applicable data protection laws (including GDPR, CCPA) in your jurisdiction</li>
    <li>Ensuring client data entered into Certxa is accurate and lawfully obtained</li>
  </ul>
  <p>We process your client data only to provide the Service as instructed by you. See our <a href="/privacy">Privacy Policy</a> for full details on how we handle all data.</p>

  <h2 id="intellectual-property">8. Intellectual Property</h2>
  <p>The Certxa platform, including its software, design, logos, and content, is owned by Certxa and protected by copyright, trademark, and other laws. You may not copy, modify, distribute, or create derivative works without our written permission.</p>
  <p>You retain ownership of all data and content you upload to Certxa. By uploading content, you grant Certxa a limited license to host and process it solely to provide the Service to you.</p>

  <h2 id="disclaimer">9. Disclaimers &amp; Limitation of Liability</h2>
  <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
  <p>TO THE FULLEST EXTENT PERMITTED BY LAW, CERTXA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE.</p>
  <p>OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM SHALL NOT EXCEED THE FEES YOU PAID TO CERTXA IN THE THREE MONTHS PRECEDING THE CLAIM.</p>
  <p>Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability, so some of the above may not apply to you.</p>

  <h2 id="termination">10. Termination</h2>
  <p>Either party may terminate the agreement at any time. We may suspend or terminate your account immediately if:</p>
  <ul>
    <li>You violate these Terms or our Acceptable Use Policy</li>
    <li>Your payment is overdue by more than 30 days</li>
    <li>We are required to do so by law or court order</li>
  </ul>
  <p>Upon termination, your right to use the Service ceases. We will provide you with an export of your data within 30 days of account closure upon request. After 90 days, we may delete your data permanently.</p>

  <h2 id="governing-law">11. Governing Law</h2>
  <p>These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-law principles. Any dispute arising from these Terms shall be resolved by binding arbitration in accordance with the American Arbitration Association rules, except that either party may seek injunctive relief in court to protect intellectual property rights.</p>

  <h2 id="changes">12. Changes to Terms</h2>
  <p>We may update these Terms from time to time. We will notify you by email and by posting a notice on the platform at least 14 days before material changes take effect. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>

  <h2 id="contact">13. Contact</h2>
  <p>Questions about these Terms? Contact us:</p>
  <ul>
    <li><strong>Email:</strong> <a href="mailto:support@certxa.com">support@certxa.com</a></li>
    <li><strong>Legal:</strong> <a href="mailto:legal@certxa.com">legal@certxa.com</a></li>
    <li><strong>Website:</strong> <a href="/contact">certxa.com/contact</a></li>
  </ul>

</div>

<?php require 'includes/footer.php'; ?>
