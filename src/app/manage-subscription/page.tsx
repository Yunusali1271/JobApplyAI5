"use client";

import BasicNavigation from '../../components/BasicNavigation';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { loadStripe } from '@stripe/stripe-js';
import { getUserSubscriptionStatus } from '@/lib/firebase/firebaseUtils';

// Replace with your Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ManageSubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (authLoading) {
        // Wait for auth to load
        return;
      }
      if (!user) {
        // No user means no subscription
        setLoading(false);
        setHasSubscription(false);
        return;
      }

      try {
        const { hasSubscription, subscription } = await getUserSubscriptionStatus(user.uid);
        setHasSubscription(hasSubscription);
        setSubscriptionDetails(subscription);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching subscription status');
        setHasSubscription(false); // Assume no subscription on error
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user, authLoading]); // Re-run effect if user or authLoading changes

  const handleManageSubscription = async () => {
    if (!user) {
      setError('User not authenticated.');
      return;
    }
    // Redirect to Stripe customer portal
    try {
      // TODO: Implement this backend API route
      const response = await fetch('/api/stripe/manage-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
      });
      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create customer portal session');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating customer portal session');
    }
  };

  const handleCheckout = async (priceId: string) => {
    if (!user) {
      setError('User not authenticated.');
      return;
    }
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        setError('Stripe failed to load');
        return;
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({ lineItems: [{ price: priceId, quantity: 1 }] }),
      });

      const session = await response.json();

      if (response.ok && session.id) {
        const result = await stripe.redirectToCheckout({ sessionId: session.id });

        if (result.error) {
          console.log(result);
          setError(result.error.message || 'Failed to redirect to checkout');
        }
      } else {
        setError(session.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while initiating checkout');
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <div className="flex">
          <Sidebar />
          <main className="flex-grow p-8">
            <h1 className="text-2xl font-bold mb-4">Manage Subscription</h1>
            <p>Loading subscription status...</p>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex">
          <Sidebar />
          <main className="flex-grow p-8">
            <h1 className="text-2xl font-bold mb-4">Manage Subscription</h1>
            <p className="text-red-500">Error: {error}</p>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <div className="flex">
        <Sidebar />
        <main className="flex-grow p-8">
          <h1 className="text-2xl font-bold mb-4">Manage Subscription</h1>
          {hasSubscription ? (
            <div>
              <p>You currently have a subscription.</p>
              {subscriptionDetails && (
                <div className="mt-4 p-4 border rounded">
                  <h2 className="text-xl font-semibold">Subscription Details</h2>
                  <p>Status: {subscriptionDetails.status}</p>
                  {/* Add more subscription details as needed */}
                </div>
              )}
              <button
                onClick={handleManageSubscription}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Manage Subscription
              </button>
            </div>
          ) : (
            <div>
              <p>You do not have an active subscription. Choose a plan to subscribe:</p>
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => handleCheckout('price_1RMSmwRrPJHoSJ7dWGJyVXVw')}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Subscribe Monthly
                </button>
                <button
                  onClick={() => handleCheckout('price_1RMPumRrPJHoSJ7dNJazA1bl')}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  Subscribe Quarterly
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}