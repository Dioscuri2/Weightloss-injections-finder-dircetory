import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SEOHead from '@/components/seo/SEOHead';
import { ShieldCheck, Lock, Database, UserCheck, Megaphone, Mail } from 'lucide-react';

export default function AppSecurity() {
  const securityPoints = [
    {
      icon: ShieldCheck,
      title: 'Data Protection & Privacy',
      content: 'We are committed to complying with the UK Data Protection Act and GDPR. We only collect data with your explicit consent (e.g., when you download a guide) and for the stated purpose. You have the right to request data deletion, which you can do from your profile page.',
    },
    {
      icon: Lock,
      title: 'Secure Authentication',
      content: 'Your account is protected by a secure, industry-standard authentication system. We do not store your passwords directly. Access to your account is handled by our secure login provider, ensuring your credentials remain safe.',
    },
    {
      icon: Database,
      title: 'Encrypted Data Transmission',
      content: 'All data transferred between your device and our servers is encrypted using HTTPS/TLS protocols. This prevents third parties from intercepting your information while it is in transit.',
    },
    {
      icon: UserCheck,
      title: 'Access Control',
      content: 'Access to user data and administrative tools is strictly limited to authorized personnel. Our platform enforces role-based access control to ensure that only admins can manage sensitive provider and user information.',
    },
    {
      icon: Megaphone,
      title: 'Advertising & Content Integrity',
      content: 'We believe in transparency. All advertisements on our platform are clearly marked with an "Ad" label. All healthcare providers listed in our directory are vetted to ensure they meet UK regulatory standards, such as GPHC and CQC regulations.',
    },
  ];

  return (
    <>
      <SEOHead
        title="App Security & Privacy Policy"
        description="Learn about our commitment to your security, data protection, and privacy at WeightLoss Injections Finder. We are GDPR and UK Data Protection Act compliant."
        keywords="security, privacy, GDPR, data protection, UK compliance"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <ShieldCheck className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
              Our Commitment to Your Security
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Your trust is our top priority. Here’s how we protect your data and ensure a safe browsing experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {securityPoints.map((point) => (
              <Card key={point.title} className="border-0 shadow-elegant hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <point.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>{point.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600">{point.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle>Your Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-neutral-600">
              <p>While we work hard to protect your account, you also play a role in keeping it secure:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Use a Strong Password:</strong> Ensure the password for your login method (e.g., your Google account) is strong and unique.
                </li>
                <li>
                  <strong>Be Aware of Phishing:</strong> We will never ask for your password in an email. Be cautious of any unsolicited messages asking for your personal information.
                </li>
              </ul>
            </CardContent>
          </Card>

           <Card className="mt-8 border-0 shadow-elegant bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-700" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700">
                If you have any security-related questions or concerns, please do not hesitate to reach out to our support team at <a href="mailto:security@weightlossinjectionsfinder.co.uk" className="text-blue-600 font-medium hover:underline">security@weightlossinjectionsfinder.co.uk</a>.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}