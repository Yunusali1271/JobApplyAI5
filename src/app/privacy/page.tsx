import React from 'react';
import BasicNavigation from '@/components/BasicNavigation';
import Footer from '@/app/components/Footer';
import Link from 'next/link';

const PrivacyPolicy = () => {
  return (
    <>
      <BasicNavigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">🔐 Privacy Policy</h1>
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          JobApplyAI respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, store, and use your information.
        </p>
        <h2 className="text-2xl font-semibold mb-4">What We Collect</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Name, email address, and payment information</li>
          <li>User activity and account interactions</li>
          <li>Content generated or submitted via Hire-Me Packs</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-4">How We Use It</h2>
        <ul className="list-disc list-inside mb-4">
          <li>To provide and manage your subscriptions and services</li>
          <li>For customer support and service improvements</li>
          <li>For secure and compliant payment processing</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Stripe: Secure payment processing</li>
          <li>Firebase: Data storage and authentication</li>
          <li>OpenAI (GPT-4o turbo): Content generation</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
        <p className="mb-4">
          All personal data is encrypted and stored using secure cloud infrastructure. The site is SSL-certified and hosted on a secure, GDPR-compliant platform. We do not use your data for AI training.
        </p>
        <p>
          <Link href="/fullprivacy" className="text-blue-600 hover:underline">
            Read the full Privacy Policy
          </Link>
        </p>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;