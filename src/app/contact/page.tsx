import BasicNavigation from '@/components/BasicNavigation';
import Footer from '@/app/components/Footer';

const ContactPage = () => {
  return (
    <div>
      <BasicNavigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">📞 Customer Service Contact Information</h2>
          <p className="mb-4">
            Contact JobApplyAI
            <br />
            For all support inquiries, you can reach our customer support team 24/7 through:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Email: jobapplyAIservice@gmail.com</li>
            <li>Address: 15 Lagos Street, SN1 2BU, United Kingdom</li>
            <li>Time Zone: GMT (24/7 availability)</li>
          </ul>
          <p>
            We are committed to responding to inquiries as quickly as possible and aim to reply within 24 hours.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;