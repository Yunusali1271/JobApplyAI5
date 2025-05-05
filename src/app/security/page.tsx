import React from 'react';
import BasicNavigation from '@/components/BasicNavigation';
import Footer from '@/app/components/Footer';

const SecurityPolicyPage: React.FC = () => {
  return (
    <>
      <BasicNavigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Security Policy</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Keeping Your Data Safe</h2>
          <p className="mb-4">
            We implement robust security standards to protect your personal and financial information.
          </p>
          <ul className="list-disc list-inside ml-4">
            <li className="mb-2">
              <strong>Encryption:</strong> All sensitive data is encrypted in transit (HTTPS) and at rest (Firebase secure storage).
            </li>
            <li className="mb-2">
              <strong>Secure Payments:</strong> Stripe processes all payments and complies with PCI-DSS standards.
            </li>
            <li className="mb-2">
              <strong>System Monitoring:</strong> Our platform is monitored for unauthorized access and updated regularly.
            </li>
          </ul>
          <p className="mt-4">
            We recommend users choose strong, unique passwords and notify us immediately of any suspicious activity.
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default SecurityPolicyPage;