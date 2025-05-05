import BasicNavigation from '@/components/BasicNavigation';
import Footer from '@/app/components/Footer';

const TermsPage = () => {
  return (
    <div>
      <BasicNavigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
        <p>This is a placeholder for the Terms of Service page.</p>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;