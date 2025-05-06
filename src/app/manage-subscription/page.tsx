import BasicNavigation from '../../components/BasicNavigation';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

export default function ManageSubscriptionPage() {
  return (
    <div>
      <div className="flex">
        <Sidebar />
        <main className="flex-grow p-8">
          <h1 className="text-2xl font-bold mb-4">Manage Subscription</h1>
          <p>This is a placeholder for the subscription management content.</p>
        </main>
      </div>
    </div>
  );
}