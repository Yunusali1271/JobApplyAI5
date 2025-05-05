import BasicNavigation from '@/components/BasicNavigation';
import Footer from '@/app/components/Footer';

const TermsPage = () => {
  return (
    <div>
      <BasicNavigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>

        <h2 className="text-xl font-semibold mt-6 mb-2">💸 Refund Policy</h2>
        <h3 className="text-lg font-medium mb-2">Subscription Refund Policy</h3>
        <p className="mb-4">
          At JobApplyAI, we aim to provide high-quality, AI-powered application assistance. Please note the following regarding refunds:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li><strong>Eligibility:</strong> Refund requests must be submitted within 7 days of purchase.</li>
          <li><strong>Conditions:</strong> Refunds are only considered if the user has not yet generated a Hire-Me Pack.</li>
          <li><strong>Non-refundable:</strong> Once a Hire-Me Pack has been accessed, downloaded, or generated, no refunds will be granted due to the nature of digital goods.</li>
          <li><strong>Freemium Use:</strong> All users receive one free Hire-Me Pack before purchasing a subscription.</li>
        </ul>
        <p className="mb-6">
          To request a refund, email our support team with your account email and transaction ID.
        </p>

        <hr className="my-8" />

        <h2 className="text-xl font-semibold mt-6 mb-2">❌ Cancellation Policy</h2>
        <h3 className="text-lg font-medium mb-2">Managing and Cancelling Your Subscription</h3>
        <p className="mb-4">
          Subscriptions to JobApplyAI can be canceled at any time via your account dashboard under “Manage Subscriptions.” Specific terms include:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li><strong>Cancellation Timing:</strong> Cancelling your subscription will not revoke access immediately. You will retain access to premium features until the end of your current billing cycle.</li>
          <li><strong>Partial Refunds:</strong> We do not offer prorated refunds for unused time or partial months.</li>
          <li><strong>Reactivation:</strong> You may reactivate your subscription at any time from the same dashboard.</li>
        </ul>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;