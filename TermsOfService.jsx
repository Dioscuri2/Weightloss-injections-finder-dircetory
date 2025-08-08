import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SEOHead from '@/components/seo/SEOHead';
import { FileText, Mail } from 'lucide-react';

export default function TermsOfService() {
  return (
    <>
      <SEOHead
        title="Terms and Conditions"
        description="Read the Terms and Conditions for using the WeightLoss Injections Finder website and services."
        keywords="terms and conditions, terms of service, legal, user agreement"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <FileText className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
              Terms and Conditions
            </h1>
            <p className="text-lg text-neutral-600">
              Last updated: 30th June 2025
            </p>
          </div>

          <Card className="border-0 shadow-elegant">
            <CardContent className="p-8 md:p-10 space-y-8 text-neutral-700">
              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">1. INTRODUCTION</h2>
                <p>These Terms and Conditions ("Terms") govern your use of the WeightLoss Injections Finder website ("Website", "Service") operated by WeightLoss Injections Finder ("we", "us", "our"). By accessing or using our Website, you agree to be bound by these Terms.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">2. ABOUT OUR SERVICE</h2>
                <ul className="list-decimal list-inside space-y-2">
                  <li>WeightLoss Injections Finder is an independent comparison directory that helps users find and compare weight loss injection providers in the UK.</li>
                  <li>We do not sell, prescribe, or supply any medications. We are purely an information and comparison service.</li>
                  <li>We do not endorse any specific pharmacy, clinic, or healthcare provider listed on our Website.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">3. DIRECTORY LISTINGS</h2>
                 <ul className="list-decimal list-inside space-y-2">
                  <li><strong>Free Listings:</strong> Basic provider information may be listed for free. We reserve the right to remove, modify, or reject any free listing at our discretion.</li>
                  <li><strong>Paid Listings:</strong> Enhanced listings may be available for a fee. Paid listings do not guarantee preferential treatment in comparisons.</li>
                  <li><strong>Accuracy:</strong> While we strive for accuracy, we cannot guarantee that all information about providers is current, complete, or error-free.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">4. USER CONDUCT</h2>
                <ul className="list-decimal list-inside space-y-2">
                  <li>You must not use our Website for any unlawful purpose or in any way that breaches these Terms.</li>
                  <li>You must not attempt to gain unauthorized access to our Website or systems.</li>
                  <li>You must not submit false, misleading, or harmful information.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">5. INTELLECTUAL PROPERTY</h2>
                <ul className="list-decimal list-inside space-y-2">
                  <li>All content on our Website, including text, graphics, logos, and software, is our property or licensed to us.</li>
                  <li>You may not reproduce, distribute, or create derivative works without our written permission.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">6. DISCLAIMER OF WARRANTIES</h2>
                 <ul className="list-decimal list-inside space-y-2">
                  <li>Our Website is provided "as is" without warranties of any kind.</li>
                  <li>We do not warrant that the Website will be uninterrupted, error-free, or completely secure.</li>
                  <li>We are not responsible for decisions made based on information found on our Website.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">7. LIMITATION OF LIABILITY</h2>
                <ul className="list-decimal list-inside space-y-2">
                  <li>To the fullest extent permitted by law, we exclude all liability for any loss or damage arising from your use of our Website.</li>
                  <li>We are not liable for any actions taken by healthcare providers listed in our directory.</li>
                  <li>Our total liability shall not exceed £100 in any circumstances.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">8. INDEMNIFICATION</h2>
                <p>You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of our Website or breach of these Terms.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">9. MODIFICATIONS</h2>
                <p>We may modify these Terms at any time. Changes will be effective when posted on our Website. Continued use constitutes acceptance of modified Terms.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">10. GOVERNING LAW</h2>
                <p>These Terms are governed by English law and subject to the exclusive jurisdiction of English courts.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">11. CONTACT INFORMATION</h2>
                <p>For questions about these Terms, contact us at <a href="mailto:support@weightlossinjectionsfinder.co.uk" className="text-blue-600 font-medium hover:underline">support@weightlossinjectionsfinder.co.uk</a>.</p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}