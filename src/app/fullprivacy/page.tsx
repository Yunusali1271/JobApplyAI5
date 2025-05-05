import React from 'react';
import BasicNavigation from '@/components/BasicNavigation';
import Footer from '@/app/components/Footer';

const FullPrivacyPolicy = () => {
  return (
    <>
      <BasicNavigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Full Privacy Policy</h1>

        <p>Effective Date: May 1, 2025</p>
        <p>Last Updated: May 1, 2025</p>

        <p className="mt-4">
          At JobApplyAI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we are committed to protecting your privacy. This Privacy Policy outlines how we collect, use, disclose, and safeguard your personal information when you visit our website https://jobapplyai.io and use our services.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
        <h3 className="text-xl font-medium mt-4 mb-2">a. Personal Information</h3>
        <p>When you interact with our services, we may collect personal information, including:</p>
        <ul className="list-disc list-inside ml-4">
          <li><strong>Contact Information:</strong> Name, email address.</li>
          <li><strong>Account Credentials:</strong> Username, password.</li>
          <li><strong>Payment Information:</strong> Processed securely via Stripe; we do not store credit card numbers.</li>
          <li><strong>Usage Data:</strong> Information about how you use our services, including the features you use and the time spent on our platform.</li>
        </ul>

        <h3 className="text-xl font-medium mt-4 mb-2">b. Technical Information</h3>
        <p>We may collect technical data such as:</p>
        <ul className="list-disc list-inside ml-4">
          <li><strong>Device Information:</strong> IP address, browser type, operating system.</li>
          <li><strong>Cookies and Tracking Technologies:</strong> To enhance user experience and analyze site usage.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
        <p>We use the collected information to:</p>
        <ul className="list-disc list-inside ml-4">
          <li><strong>Provide Services:</strong> Facilitate the creation and management of your account, process transactions, and deliver our services.</li>
          <li><strong>Improve Services:</strong> Analyze usage to enhance our platform&apos;s functionality and user experience.</li>
          <li><strong>Communicate:</strong> Send administrative information, respond to inquiries, and provide customer support.</li>
          <li><strong>Security:</strong> Detect and prevent fraudulent activities and ensure the security of our services.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">3. Sharing Your Information</h2>
        <p>We do not sell your personal information. We may share your information with:</p>
        <ul className="list-disc list-inside ml-4">
          <li><strong>Service Providers:</strong> Trusted third parties that assist in operating our website and conducting our business, such as:
            <ul className="list-circle list-inside ml-4">
              <li>Stripe: For payment processing.</li>
              <li>Firebase: For data storage and authentication.</li>
              <li>OpenAI: For AI-powered content generation.</li>
            </ul>
          </li>
          <li><strong>Legal Requirements:</strong> If required by law or in response to valid requests by public authorities.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">4. Data Retention</h2>
        <p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">5. Your Rights</h2>
        <p>Depending on your location, you may have the following rights regarding your personal information:</p>
        <ul className="list-disc list-inside ml-4">
          <li><strong>Access:</strong> Request access to your personal data.</li>
          <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
          <li><strong>Deletion:</strong> Request deletion of your personal data.</li>
          <li><strong>Objection:</strong> Object to the processing of your personal data.</li>
          <li><strong>Restriction:</strong> Request restriction of processing your personal data.</li>
          <li><strong>Data Portability:</strong> Request transfer of your personal data to another party.</li>
        </ul>
        <p className="mt-2">To exercise any of these rights, please contact us at jobapplyAIservice@gmail.com.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">6. Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal data, including:</p>
        <ul className="list-disc list-inside ml-4">
          <li><strong>Encryption:</strong> SSL encryption for data in transit.</li>
          <li><strong>Secure Storage:</strong> Data stored securely using Firebase.</li>
          <li><strong>Access Controls:</strong> Restricted access to personal data to authorized personnel only.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">7. International Data Transfers</h2>
        <p>Your information may be transferred to and maintained on servers located outside your country of residence. We ensure that such transfers comply with applicable data protection laws.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">8. Children&apos;s Privacy</h2>
        <p>Our services are not intended for individuals under the age of 16. We do not knowingly collect personal information from children under 16.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">9. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.</p>
      </div>
      <Footer />
    </>
  );
};

export default FullPrivacyPolicy;