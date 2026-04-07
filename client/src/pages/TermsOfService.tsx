import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Last Updated: April 7, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Agreement to Terms</h2>
            <p>
              These Terms of Service ("Terms") constitute a legally binding agreement between you ("User,"
              "you," or "your") and Certxa ("Company," "we," "our," or "us") governing your access to and
              use of the Certxa platform, including our website, mobile applications, and all related services
              (collectively, the "Service").
            </p>
            <p className="mt-4">
              By accessing or using the Service, you confirm that you have read, understood, and agree to be
              bound by these Terms. If you do not agree with these Terms, you must not access or use the Service.
            </p>
            <p className="mt-4">
              If you are using the Service on behalf of a business or organization, you represent and warrant
              that you have the authority to bind that entity to these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Service</h2>
            <p>
              Certxa is a business management and appointment booking platform designed for service-based
              businesses including salons, barbers, spas, pet groomers, and similar businesses. The Service includes:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 mt-4">
              <li>Online appointment booking and scheduling management</li>
              <li>Customer relationship management (CRM) tools</li>
              <li>Staff and resource management</li>
              <li>Point-of-sale (POS) functionality</li>
              <li>Review management, including Google Business Profile integration</li>
              <li>SMS and email notification services</li>
              <li>Analytics and reporting dashboards</li>
              <li>Payment processing via third-party processors</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Eligibility and Account Registration</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Eligibility</h3>
            <p>
              You must be at least 18 years of age to use the Service. By agreeing to these Terms, you represent
              and warrant that you meet this age requirement. The Service is intended for business use and is not
              directed at consumers for personal, family, or household purposes.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Account Registration</h3>
            <p>
              To access certain features, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 mt-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password confidential and secure</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized access or security breach</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account at our sole discretion if you violate
              these Terms or engage in conduct that we determine to be harmful to other users, third parties,
              or the integrity of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Google Business Profile Integration</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Purpose and Scope</h3>
            <p>
              Certxa offers an optional integration with Google Business Profile that allows you to view and
              manage your customer reviews from within the Certxa platform. By enabling this integration, you
              authorize Certxa to access your Google Business Profile data using Google's OAuth 2.0 protocol.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Data Accessed</h3>
            <p>
              When you connect your Google Business Profile, Certxa will request only the permissions necessary
              to provide the review management feature, specifically:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 mt-2">
              <li>Access to read reviews for your business locations</li>
              <li>Permission to post responses to reviews on your behalf</li>
              <li>Your Google account email for identification purposes</li>
              <li>Basic profile information (name) for display purposes</li>
            </ul>
            <p className="mt-2">
              We will never access your Gmail, Google Drive, Google Calendar, or any other Google services
              beyond what is explicitly listed above.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Your Responsibilities</h3>
            <p>When using the Google Business Profile integration, you agree to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2 mt-2">
              <li>Comply with Google's Terms of Service and Google Business Profile policies</li>
              <li>Only post genuine, accurate responses to reviews</li>
              <li>Not use the integration to post fraudulent, misleading, or harassing responses</li>
              <li>Not use the integration to suppress, hide, or artificially manipulate reviews</li>
              <li>Not incentivize customers to post positive reviews or discourage negative reviews</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.4 Revoking Access</h3>
            <p>
              You may disconnect your Google Business Profile at any time through the Certxa platform settings
              or directly through your Google Account settings at{" "}
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                myaccount.google.com/permissions
              </a>
              . Upon disconnection, we will revoke all API access and delete all stored Google tokens and
              synced review data within 30 days.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.5 Google API Policy Compliance</h3>
            <p>
              Certxa's use of information received from Google APIs adheres to the{" "}
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Acceptable Use Policy</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Permitted Uses</h3>
            <p>You may use the Service only for lawful business purposes in accordance with these Terms.</p>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Prohibited Uses</h3>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2 mt-2">
              <li>Use the Service in any way that violates applicable local, national, or international law</li>
              <li>Transmit or facilitate the transmission of unsolicited communications (spam)</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its related systems</li>
              <li>Introduce viruses, malware, or any other harmful code</li>
              <li>Scrape, crawl, or index any part of the Service without our written consent</li>
              <li>Use the Service to store or transmit infringing, libelous, or otherwise unlawful content</li>
              <li>Reverse engineer or decompile any part of the Service</li>
              <li>Resell or sublicense the Service without prior written authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Subscription, Fees, and Payment</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Free Trial</h3>
            <p>
              Certxa may offer a free trial period for new accounts. At the end of the trial period, your
              account will transition to a paid subscription unless you cancel before the trial ends. We will
              notify you in advance of any charges.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Subscription Fees</h3>
            <p>
              Access to certain features requires a paid subscription. Subscription fees are billed in advance
              on a monthly or annual basis, as selected during signup. All fees are non-refundable except as
              expressly stated in these Terms or required by applicable law.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Payment Processing</h3>
            <p>
              Payments are processed through third-party payment processors (e.g., Stripe). You authorize us
              to charge your payment method for all applicable fees. We do not store complete credit card
              information — this is handled by our payment processor in a PCI-compliant manner.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.4 Cancellation</h3>
            <p>
              You may cancel your subscription at any time through your account settings. Cancellation takes
              effect at the end of your current billing period. You will retain access to the Service until
              the end of the period for which you have paid.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.5 Fee Changes</h3>
            <p>
              We reserve the right to modify our fees at any time. We will provide at least 30 days' advance
              notice of any fee changes via email or in-app notification. Your continued use of the Service
              after the effective date constitutes acceptance of the new fees.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">7. Intellectual Property</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Our Intellectual Property</h3>
            <p>
              The Service and its original content, features, and functionality are owned by Certxa and are
              protected by copyright, trademark, patent, trade secret, and other intellectual property laws.
              You may not copy, modify, distribute, sell, or lease any part of the Service without our
              express written permission.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Your Content</h3>
            <p>
              You retain ownership of any content you submit, post, or display through the Service ("User Content").
              By submitting User Content, you grant Certxa a non-exclusive, worldwide, royalty-free license to
              use, reproduce, and display your User Content solely to provide the Service to you.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.3 Feedback</h3>
            <p>
              If you provide feedback, suggestions, or ideas about the Service, you grant us an irrevocable,
              non-exclusive, royalty-free right to use such feedback for any purpose, including improving the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Privacy and Data</h2>
            <p>
              Our collection and use of your personal information is governed by our{" "}
              <Link to="/privacy-policy" className="text-primary underline">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. By using the Service, you consent to the
              data practices described in our Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">9. Third-Party Services</h2>
            <p>
              The Service may integrate with or contain links to third-party websites, services, or applications
              (including Google APIs, Stripe, Twilio, and Mailgun). These third-party services are governed by
              their own terms and privacy policies. We are not responsible for the content, policies, or practices
              of any third-party services. Your use of such services is at your own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">10. Disclaimers and Limitation of Liability</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">10.1 Disclaimers</h3>
            <p>
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS
              FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
              UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">10.2 Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CERTXA SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES,
              WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE
              LOSSES, RESULTING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
            </p>
            <p className="mt-4">
              IN NO EVENT SHALL CERTXA'S AGGREGATE LIABILITY EXCEED THE AMOUNT YOU PAID TO CERTXA IN THE
              TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">11. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Certxa and its officers, directors, employees,
              contractors, agents, licensors, and service providers from and against any claims, liabilities,
              damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees)
              arising out of or relating to your violation of these Terms or your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">12. Governing Law and Dispute Resolution</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">12.1 Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States,
              without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">12.2 Dispute Resolution</h3>
            <p>
              Any dispute arising from these Terms or the Service shall first be attempted to be resolved through
              good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration
              in accordance with the American Arbitration Association rules, except that either party may seek
              injunctive or other equitable relief in a court of competent jurisdiction.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">12.3 Class Action Waiver</h3>
            <p>
              You waive any right to participate in a class action lawsuit or class-wide arbitration against
              Certxa relating to the Service or these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">13. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material changes by
              posting the updated Terms on our website and updating the "Last Updated" date above. For significant
              changes, we may also send an email notification. Your continued use of the Service after the effective
              date of any changes constitutes your acceptance of the updated Terms.
            </p>
            <p className="mt-4">
              If you do not agree with the updated Terms, you must stop using the Service and cancel your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">14. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service at any time, with or without cause, with or
              without notice, effective immediately. Upon termination, your right to use the Service will cease.
              All provisions of these Terms that by their nature should survive termination shall survive, including
              intellectual property provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mt-8 mb-4">15. General Provisions</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">15.1 Entire Agreement</h3>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and
              Certxa regarding the Service and supersede all prior agreements and understandings.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">15.2 Severability</h3>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain
              in full force and effect.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">15.3 Waiver</h3>
            <p>
              Our failure to enforce any right or provision of these Terms shall not be considered a waiver of
              those rights. Any waiver of any provision shall be effective only if in writing and signed by
              an authorized representative of Certxa.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">15.4 Assignment</h3>
            <p>
              You may not assign or transfer your rights or obligations under these Terms without our prior
              written consent. We may assign our rights and obligations to any affiliated company or in
              connection with a merger, acquisition, or sale of assets.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mt-8 mb-4">16. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mt-4 space-y-3">
              <div>
                <p className="font-semibold">Email:</p>
                <p>legal@certxa.com</p>
              </div>
              <div>
                <p className="font-semibold">General Support:</p>
                <p>support@certxa.com</p>
              </div>
              <div>
                <p className="font-semibold">Website:</p>
                <p>certxa.com</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              We will respond to legal inquiries within 30 days.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
