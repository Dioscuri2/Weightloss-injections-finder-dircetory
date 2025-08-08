import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SEOHead from '@/components/seo/SEOHead';
import { Lock } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="Read the Privacy Policy for WeightLoss Injections Finder to understand how we collect, use, and protect your personal data."
        keywords="privacy policy, data protection, GDPR, user data"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <Lock className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-neutral-600">
              Last updated: 30th June 2025
            </p>
          </div>

          <Card className="border-0 shadow-elegant">
            <CardContent className="p-8 md:p-10 space-y-8 text-neutral-700">
              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">1. INTRODUCTION</h2>
                <p>This Privacy Policy explains how WeightLoss Injections Finder ("we", "us", "our") collects, uses, and protects your personal data when you use our Website.</p>
                <p>We are committed to protecting your privacy and complying with the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018.</p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">2. DATA CONTROLLER</h2>
                <p>WeightLoss Injections Finder</p>
                <p><a href="mailto:support@weightlossinjectionsfinder.co.uk" className="text-blue-600 hover:underline">support@weightlossinjectionsfinder.co.uk</a></p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">3. INFORMATION WE COLLECT</h2>
                <h3 className="text-lg font-semibold text-neutral-800 mt-4 mb-2">3.1 Information you provide directly:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Contact information when you contact us</li>
                  <li>Feedback and survey responses</li>
                  <li>Account information if you register</li>
                </ul>
                <h3 className="text-lg font-semibold text-neutral-800 mt-4 mb-2">3.2 Information collected automatically:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>IP addresses and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent</li>
                  <li>Cookies and similar technologies</li>
                </ul>
                <h3 className="text-lg font-semibold text-neutral-800 mt-4 mb-2">3.3 Information from third parties:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Analytics providers (e.g., Google Analytics)</li>
                  <li>Social media platforms</li>
                  <li>Public provider information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">4. HOW WE USE YOUR INFORMATION</h2>
                <h3 className="text-lg font-semibold text-neutral-800 mt-4 mb-2">4.1 Legal bases for processing:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Legitimate interests: Website operation, improvement, and security</li>
                  <li>Consent: Marketing communications and non-essential cookies</li>
                  <li>Legal obligation: Compliance with applicable laws</li>
                </ul>
                <h3 className="text-lg font-semibold text-neutral-800 mt-4 mb-2">4.2 Purposes:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Providing and improving our comparison service</li>
                  <li>Responding to your enquiries</li>
                  <li>Website analytics and performance monitoring</li>
                  <li>Preventing fraud and ensuring security</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">5. INFORMATION SHARING</h2>
                <p>We do not sell your personal data to third parties.</p>
                <p className="mt-2">We may share information with:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Service providers (e.g., hosting, analytics, email services)</li>
                  <li>Legal authorities when required by law</li>
                  <li>Professional advisors (e.g., lawyers, accountants)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">6. INTERNATIONAL TRANSFERS</h2>
                <p>Some of our service providers may be located outside the UK. We ensure appropriate safeguards are in place for any international transfers.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">7. DATA RETENTION</h2>
                <p>We retain personal data only as long as necessary for the purposes outlined in this policy or as required by law.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">8. YOUR RIGHTS</h2>
                <p>Under UK GDPR, you have the right to:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Access your personal data</li>
                  <li>Rectify inaccurate data</li>
                  <li>Erase your data in certain circumstances</li>
                  <li>Restrict processing</li>
                  <li>Data portability</li>
                  <li>Object to processing</li>
                  <li>Withdraw consent</li>
                </ul>
                <p className="mt-2">To exercise these rights, contact us at <a href="mailto:support@weightlossinjectionsfinder.co.uk" className="text-blue-600 hover:underline">support@weightlossinjectionsfinder.co.uk</a>.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">9. COOKIES</h2>
                <p>We use cookies to improve your experience. See our Cookie Policy for detailed information.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">10. SECURITY</h2>
                <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">11. CHILDREN'S PRIVACY</h2>
                <p>Our Website is not intended for children under 18. We do not knowingly collect personal data from children.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">12. CHANGES TO THIS POLICY</h2>
                <p>We may update this Privacy Policy from time to time. Changes will be posted on our Website with the updated date.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">13. CONTACT US</h2>
                <p>For privacy-related questions, contact us at:</p>
                <p className="mt-2">Email: <a href="mailto:support@weightlossinjectionsfinder.co.uk" className="text-blue-600 hover:underline">support@weightlossinjectionsfinder.co.uk</a></p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}