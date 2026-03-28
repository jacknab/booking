import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Last Updated: March 5, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
            <p>
              Certxa ("Company," "we," "our," or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our booking and business management platform, including
              our services related to Google Business Profile integration.
            </p>
            <p>
              Please read this Privacy Policy carefully. If you do not agree with our policies
              and practices, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Information You Directly Provide</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Account Registration: Name, email address, phone number, business information, and password</li>
              <li>Business Details: Store/location information, hours of operation, services offered, pricing</li>
              <li>Staff Information: Staff member names, emails, phone numbers, roles, and availability</li>
              <li>Customer Information: Customer names, email addresses, phone numbers, and booking history</li>
              <li>Payment Information: Processed securely through third-party payment processors (we don't store full credit card numbers)</li>
              <li>Support Communications: Messages sent through contact forms, email support, or chat</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Information Automatically Collected</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Device Information: Browser type, operating system, device type, and device identifiers</li>
              <li>Usage Information: Pages visited, features used, time spent, actions taken in the app</li>
              <li>Log Data: IP address, access times, referring/exit pages, and interaction patterns</li>
              <li>Cookies and Similar Technologies: For authentication, preferences, and analytics</li>
              <li>Location Information: If permitted, approximate location data from IP address</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Information from Google Business Profile API</h3>
            <p className="mb-2">
              When you connect your Google Business Profile account to Certxa, we collect:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Google Account Email: The email associated with your Google Business Profile</li>
              <li>Business Account Information: Business name, business account ID, and account resource names</li>
              <li>Location Information: Location ID, location name, and location resource names from Google</li>
              <li>Review Data: Review content, reviewer names, ratings, review creation/update times, and review images (if present)</li>
              <li>OAuth Tokens: Access tokens and refresh tokens necessary to communicate with Google APIs (not visible to users)</li>
              <li>Review Responses: Any replies you draft or publish to customer reviews</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Important:</strong> You control what data we access. We only receive access to information necessary to synchronize and help you manage your Google Business Profile reviews. We never access your Google Drive, Gmail, Calendar, or other Google services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Primary Uses</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Providing and maintaining our service and features</li>
              <li>Processing bookings, appointments, and payments</li>
              <li>Managing your Google Business Profile reviews within our platform</li>
              <li>Responding to your inquiries and customer support requests</li>
              <li>Personalizing your experience and remembering your preferences</li>
              <li>Notifying you about changes to our service or policy</li>
              <li>Sending promotional communications (if you've opted in)</li>
              <li>Detecting, preventing, and addressing fraud and other illegal activity</li>
              <li>Improving and optimizing our service based on user behavior and feedback</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Google Business Profile Review Management</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Synchronizing reviews from your Google Business Profile to our platform</li>
              <li>Displaying reviews in a centralized dashboard for easy management</li>
              <li>Allowing you to view review statistics and analytics</li>
              <li>Enabling you to draft responses to reviews within our platform</li>
              <li>Publishing your responses back to Google Business Profile</li>
              <li>Notifying you of new reviews or important review activity</li>
              <li>Providing analytics on review ratings and response rates</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.3 What We Do NOT Do With Your Data</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We do NOT automatically delete, suppress, or hide reviews based on ratings</li>
              <li>We do NOT automatically post reviews or responses on your behalf</li>
              <li>We do NOT use reviews to identify individuals for targeting without consent</li>
              <li>We do NOT share review data with competitors or unaffiliated third parties</li>
              <li>We do NOT use review data to train AI models without your explicit consent</li>
              <li>We do NOT sell review data to third parties</li>
              <li>We do NOT modify review content before displaying it to you</li>
              <li>We do NOT prevent you from accessing your reviews on Google</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">4. How We Share Your Information</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Service Providers</h3>
            <p className="mb-4">
              We may share information with third-party service providers who assist us in operating
              our website and conducting our business, subject to strict confidentiality agreements:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Cloud Hosting Providers: For storing and processing your data</li>
              <li>Payment Processors: For securely processing payments</li>
              <li>Email Service Providers: For sending transactional and promotional emails</li>
              <li>Analytics Services: For understanding usage patterns and improving the service</li>
              <li>Twilio (SMS Service): For sending SMS messages if you've enabled SMS features</li>
              <li>Mailgun (Email Service): For sending email messages</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              All service providers are required to maintain the confidentiality and security of your information
              and use it only for the purposes we specify.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Google Business Profile API</h3>
            <p className="mb-4">
              When you authorize access to your Google Business Profile:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We authenticate with Google using OAuth 2.0 (industry-standard secure authorization)</li>
              <li>We request only the specific permissions needed to read reviews and post responses</li>
              <li>Google will never share your data with us; we request it directly through authenticated API calls</li>
              <li>Your Google account remains separate and secure with two-factor authentication if you have it enabled</li>
              <li>You can revoke our access at any time through Google Account settings</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Legal Requirements</h3>
            <p>
              We may disclose your information if required by law or in good faith belief that such action is
              necessary to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Comply with subpoena, court order, or legal process</li>
              <li>Enforce our Terms of Service and other agreements</li>
              <li>Protect the security or integrity of our service</li>
              <li>Protect the rights, privacy, safety, or property of Certxa, users, or the public</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.4 Business Transfers</h3>
            <p>
              If Certxa is involved in a merger, acquisition, bankruptcy, dissolution, reorganization,
              similar transaction or proceeding, your information may be transferred as part of that transaction.
              We will provide notice before your information becomes subject to a different privacy policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Data Security</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Security Measures</h3>
            <p className="mb-4">
              We implement comprehensive security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Encryption: All data in transit uses HTTPS/TLS encryption</li>
              <li>Database Security: Sensitive data at rest is encrypted</li>
              <li>OAuth Tokens: Google API tokens are encrypted and never logged</li>
              <li>Access Control: Strict access controls limit who can view data</li>
              <li>Security Audits: Regular security reviews and penetration testing</li>
              <li>Authentication: Secure password hashing using bcrypt</li>
              <li>Session Management: Secure session tokens with automatic expiration</li>
              <li>No Unnecessary Data: We don't store data we don't need</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.2 What You Should Know</h3>
            <p>
              No method of transmission over the Internet or method of electronic storage is 100% secure.
              While we use industry-standard security measures, we cannot guarantee absolute security.
              We encourage you to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Use strong, unique passwords for your Certxa account</li>
              <li>Enable two-factor authentication on your Google Business Profile</li>
              <li>Regularly review your connected apps in Google Account settings</li>
              <li>Never share your account credentials with others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Data Retention</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.1 How Long We Keep Your Data</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Account Information:</strong> Retained while your account is active, plus 30 days after deletion for recovery purposes</li>
              <li><strong>Google Reviews:</strong> Stored in sync with Google Business Profile; deleted within 30 days of you disconnecting from Google</li>
              <li><strong>Review Responses:</strong> Stored while your account is active; deleted within 30 days of you disconnecting from Google</li>
              <li><strong>Booking/Appointment History:</strong> Retained for 7 years for legal/tax compliance purposes</li>
              <li><strong>Payment Records:</strong> Retained for 7 years for legal/tax compliance purposes</li>
              <li><strong>Log Files:</strong> Retained for 90 days for security monitoring purposes</li>
              <li><strong>Support Communications:</strong> Retained for 1 year unless needed for legal purposes</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Disconnecting from Google</h3>
            <p>
              When you disconnect your Google Business Profile from Certxa:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We immediately revoke all permissions and API access</li>
              <li>We delete all stored OAuth tokens within 24 hours</li>
              <li>We delete all synced reviews and responses within 30 days</li>
              <li>Your Google Business Profile remains completely unchanged</li>
              <li>You can revoke access at any time through Google Account settings</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">7. Your Rights and Choices</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Access and Correction</h3>
            <p>
              You have the right to access, correct, or update your personal information. You can do this by:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Logging into your Certxa account and editing your profile</li>
              <li>Contacting us at privacy@certxa.com for assistance</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Right to Delete</h3>
            <p>
              You may request deletion of your account and associated data. Upon request, we will:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Delete your account and personal information within 30 days</li>
              <li>Maintain booking history for 7 years if required by law</li>
              <li>Delete all Google review data within 30 days</li>
              <li>Revoke all API access and permissions</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Delete your account by going to Settings → Account → Delete Account or contact privacy@certxa.com.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.3 Cookies and Tracking</h3>
            <p>
              Most web browsers are set to accept cookies by default. You can usually change your browser
              settings to refuse cookies or to alert you when cookies are being sent. Please note that disabling
              cookies may affect the functionality of our service.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.4 Marketing Communications</h3>
            <p>
              You can opt out of promotional communications by:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Clicking "unsubscribe" in any promotional email</li>
              <li>Adjusting your preferences in your account settings</li>
              <li>Contacting us at privacy@certxa.com</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              We will continue to send transactional emails (confirmations, receipts, password resets) regardless of your preference.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.5 Google Business Profile Control</h3>
            <p>
              You have full control over your Google Business Profile integration:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Disconnect at any time through Certxa settings</li>
              <li>Revoke access through Google Account settings (accounts.google.com)</li>
              <li>View, edit, or delete your reviews directly on Google Business Profile</li>
              <li>Certxa cannot force you to respond to or hide reviews</li>
              <li>Your reviews remain on Google regardless of Certxa status</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Children's Privacy</h2>

            <p>
              Certxa is not intended for children under the age of 13, and we do not knowingly collect
              personal information from children under 13. If we become aware that we have collected personal
              information from a child under 13, we will delete it immediately.
            </p>
            <p>
              If you are a parent or guardian and believe your child has provided information to Certxa,
              please contact us immediately at privacy@certxa.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">9. Third-Party Links</h2>

            <p>
              Our service may contain links to third-party websites and services that are not operated by us.
              This Privacy Policy does not apply to third-party websites, and we are not responsible for their
              privacy practices. We encourage you to review their privacy policies before providing your information.
            </p>
            <p>
              Third parties may collect information when you interact with them, including through our platform
              (e.g., payment processors, review services, analytics providers).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">10. International Data Transfers</h2>

            <p>
              Your information may be transferred to, stored in, and processed in countries other than your country
              of residence. These countries may have data protection laws that differ from your country of residence.
            </p>
            <p>
              By using Certxa, you consent to the transfer of your information to countries outside your country
              of residence, which may include countries that do not have the same level of data protection as your
              country of residence. We will ensure that such transfers comply with applicable law and that adequate
              safeguards are in place.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">11. California Privacy Rights (CCPA)</h2>

            <p>
              If you are a California resident, you have the following rights under the California Consumer
              Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Right to Know:</strong> You can request what personal information we have collected about you</li>
              <li><strong>Right to Delete:</strong> You can request deletion of your personal information</li>
              <li><strong>Right to Opt-Out:</strong> You can opt out of the sale or sharing of your personal information (we do not sell or share your data)</li>
              <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at privacy@certxa.com. We will respond to verified requests
              within 45 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">12. GDPR Compliance (EU/UK)</h2>

            <p>
              If you are located in the European Union or United Kingdom, the General Data Protection Regulation (GDPR)
              applies to us. You have the following rights:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
              <li><strong>Right to Restrict Processing:</strong> Request limitation of data processing</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Right to Object:</strong> Object to processing of your data</li>
              <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local privacy authority</li>
            </ul>
            <p>
              Our legal basis for processing your data includes: performance of contract, compliance with legal obligations,
              and legitimate interests (providing and improving our service, detecting fraud, ensuring security).
            </p>
            <p>
              To exercise GDPR rights, contact us at privacy@certxa.com or our Data Protection Officer at dpo@certxa.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">13. Changes to This Privacy Policy</h2>

            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices,
              technology, legal requirements, or other factors. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Posting the updated Privacy Policy on our website</li>
              <li>Updating the "Last Updated" date at the beginning of this policy</li>
              <li>Sending you an email notification if the changes are material</li>
              <li>Requiring your consent to the updated policy if required by law</li>
            </ul>
            <p>
              Your continued use of Certxa after changes become effective constitutes your acceptance of the updated
              Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">14. Contact Us</h2>

            <p>
              If you have questions about this Privacy Policy, our privacy practices, or how we handle your information,
              please contact us at:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mt-4 space-y-3">
              <div>
                <p className="font-semibold">Email:</p>
                <p>privacy@certxa.com</p>
              </div>
              <div>
                <p className="font-semibold">Mailing Address:</p>
                <p>
                  Certxa Privacy Team<br />
                  Customer Data Protection<br />
                  Contact us through our website: certxa.com
                </p>
              </div>
              <div>
                <p className="font-semibold">Data Protection Officer (EU/UK):</p>
                <p>dpo@certxa.com</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              We will respond to privacy inquiries within 30 days.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mt-8 mb-4">15. Additional Google Business Profile Terms</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">15.1 Google API Services User Data Policy</h3>
            <p>
              Certxa's use of information received from the Google APIs will be limited to the purposes necessary
              to provide the services to you. Certxa's use of such information will adhere to Google API Services
              User Data Policy, which is available at: https://developers.google.com/terms/api-services-user-data-policy
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">15.2 What Certxa Can Access</h3>
            <p className="mb-2">
              When you grant Certxa access to your Google Business Profile, we can access:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Reviews and ratings for your business locations</li>
              <li>Your replies to reviews</li>
              <li>Review statistics and analytics</li>
              <li>Basic location information (business name, address, etc.)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">15.3 What Certxa Cannot Access</h3>
            <p className="mb-2">
              Certxa is restricted from accessing:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Any Google services other than Google Business Profile (no Gmail, Drive, Calendar, etc.)</li>
              <li>Personal information about review authors beyond what's shown in the review</li>
              <li>Confidential business information outside of reviews</li>
              <li>Customer information not associated with reviews</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">15.4 Review Management Practice</h3>
            <p>
              In compliance with Google's policies and best practices:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We never automatically delete, flag, or suppress reviews</li>
              <li>We never incentivize users to post reviews</li>
              <li>We never discourage users from posting negative reviews</li>
              <li>We never use reviews to identify individuals for non-business purposes</li>
              <li>We never sell or share review data with third parties</li>
              <li>All review interactions remain transparent and auditable</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">15.5 Compliance Statement</h3>
            <p>
              Certxa complies with all applicable terms of Google's APIs and policies, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Google API Services User Data Policy</li>
              <li>Google Cloud Terms of Service</li>
              <li>Google Business Profile Policies</li>
              <li>Google API Verification Guidelines</li>
            </ul>
          </section>
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-card border-t py-12 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/web-app.png" alt="Certxa" className="w-8 h-8 rounded-lg" />
            <span className="font-display font-bold text-xl">Certxa</span>
          </div>
          <p className="text-muted-foreground text-sm">
            2025 Certxa. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
