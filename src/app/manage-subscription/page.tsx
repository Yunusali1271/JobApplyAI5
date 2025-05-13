"use client";

import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useState, useEffect, useRef, Suspense } from 'react'; // Import Suspense
import { useAuth } from '@/lib/hooks/useAuth';
import { loadStripe } from '@stripe/stripe-js';
import { getUserSubscriptionStatus } from '@/lib/firebase/firebaseUtils';
import { StripeElementsOptionsClientSecret } from '@stripe/stripe-js';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function SubscriptionManagerContent() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [portalClientSecret, setPortalClientSecret] = useState<string | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false); // State for notification visibility

  const checkoutRef = useRef<any>(null); // Ref to store the embedded checkout instance

  const searchParams = useSearchParams(); // Get search params

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

  // Effect to check for success query parameter and show notification
  useEffect(() => {
    const successParam = searchParams.get('success');
    if (successParam === 'true') {
      setShowSuccessNotification(true);
      // Hide notification after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccessNotification(false);
      }, 3000); // 3000 milliseconds = 3 seconds

      // Cleanup the timer
      return () => clearTimeout(timer);
    }
  }, [searchParams]); // Re-run effect when searchParams change

  const handleManageSubscription = async () => {
    if (!user) {
      setError('User not authenticated.');
      return;
    }
    // Create Stripe customer portal session for embedding
    setLoading(true); // Set loading state while creating portal session
    try {
      const response = await fetch('/api/stripe/manage-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        // Assuming the backend now returns a clientSecret for the embedded portal
        body: JSON.stringify({ returnUrl: window.location.href }), // Pass current URL as return URL
      });
      const data = await response.json();

      if (response.ok && data?.clientSecret) {
        setPortalClientSecret(data.clientSecret);
        // No redirect here, the useEffect will handle rendering the embedded portal
      } else {
        setError(data?.error || 'Failed to create customer portal session');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating customer portal session');
    } finally {
      setLoading(false); // Unset loading state
    }
  };

  useEffect(() => {
    const loadEmbeddedPortal = async () => {
      if (portalClientSecret) {
        const stripe = await stripePromise;
        if (!stripe) {
          setError('Stripe failed to load');
          return;
        }

        const options: StripeElementsOptionsClientSecret = {
          clientSecret: portalClientSecret,
          // Apply your styling here
          appearance: {
            theme: 'stripe',
          },
        };

        // TODO fix this code
        // Use StripeCustomerPortal to create and mount the portal
        /*const portal = await StripeCustomerPortal.create({
          clientSecret: portalClientSecret,
          // You can add appearance options here if needed, similar to Elements
          // appearance: { theme: 'stripe' },
        });
        portal.mount('#portal-element'); // Mount to the div with id 'portal-element'*/
      }
    };

    loadEmbeddedPortal();
  }, [portalClientSecret]); // Re-run effect when portalClientSecret changes

  const handleCheckout = async (priceId: string) => {
    if (!user) {
      setError('User not authenticated.');
      return;
    }
    setLoading(true); // Set loading state while creating checkout session
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({ lineItems: [{ price: priceId, quantity: 1 }], email: user.email, uid: user.uid }),
      });

      const session = await response.json();

      console.log(response);
      console.log(session);

      if (response.ok && session?.clientSecret) {
        setClientSecret(session.clientSecret);
        // No redirect here, the useEffect will handle rendering the embedded form
      } else {
        setError(session?.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while initiating checkout');
    } finally {
      setLoading(false); // Unset loading state
    }
  };

  useEffect(() => {
    const loadEmbeddedCheckout = async () => {
      if (clientSecret && !checkoutRef.current) { // Only initialize if clientSecret exists and checkout hasn't been initialized
        const stripe = await stripePromise;
        if (!stripe) {
          setError('Stripe failed to load');
          return;
        }

        const options = {
          clientSecret,
          // Apply your styling here
          appearance: {
            theme: 'stripe',
          },
        } as StripeElementsOptionsClientSecret;

        // Use initEmbeddedCheckout for embedded checkout sessions
        const checkout = await stripe.initEmbeddedCheckout({
          clientSecret,
          onComplete: () => {
            // This function is called when the checkout is complete.
            // You might want to refetch subscription status here
            // fetchSubscriptionStatus(); // Make sure fetchSubscriptionStatus is accessible
            // You can redirect the user or display a success message here.
            console.log('Checkout complete!');
            // Example: Redirect to a success page or refetch subscription status
            // window.location.href = '/success';
            // fetchSubscriptionStatus(); // You might need to make fetchSubscriptionStatus accessible
          },
        });

        // Mount the embedded checkout UI to the container element
        checkout.mount('#checkout-element');
        checkoutRef.current = checkout; // Store the checkout instance in the ref
      }
    };

    loadEmbeddedCheckout();

    // Cleanup function to destroy the checkout instance when the component unmounts
    // or when clientSecret changes, requiring a new instance.
    return () => {
      if (checkoutRef.current) {
        checkoutRef.current.destroy();
        checkoutRef.current = null; // Reset the ref
      }
    };
  }, [clientSecret]); // Re-run effect when clientSecret changes

useEffect(() => {
    // If user has no subscription and no checkout session is initiated,
    // immediately trigger the monthly checkout.
    if (hasSubscription === false && clientSecret === null && !loading && !authLoading) {
      // Check if the environment variable is defined before calling handleCheckout
      const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_SUBSCRIPTION_PRICE_ID;
      if (monthlyPriceId) {
        handleCheckout(monthlyPriceId);
      } else {
        console.error("NEXT_PUBLIC_STRIPE_MONTHLY_SUBSCRIPTION_PRICE_ID is not defined.");
        // Optionally, set an error state to inform the user
        // setError("Configuration error: Monthly subscription price ID is missing.");
      }
    }
  }, [hasSubscription, clientSecret, loading, authLoading, handleCheckout]); // Dependencies
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

          {/* Success Notification */}
          {showSuccessNotification && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
              You have successful Subscribed!
            </div>
          )}

          {hasSubscription ? (
            <div>
              <p>You currently have a subscription.</p>
              {/* This is where the embedded subscription management component will be mounted */}
              {portalClientSecret ? (
                <div id="portal-element" className="mt-4">
                  {/* Stripe Customer Portal Element will be inserted here */}
                </div>
              ) : (
                <button
                  onClick={handleManageSubscription}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Manage Subscription
                </button>
              )}
              {subscriptionDetails && (
                <div className="mt-4 p-4 border rounded">
                  <h2 className="text-xl font-semibold">Subscription Details</h2>
                  <p>Status: {subscriptionDetails.status}</p>
                  {/* Add more subscription details as needed */}
                </div>
              )}
            </div>
          ) : (
            <div>
              {clientSecret ? (
                <>
                  <p>Complete your subscription purchase:</p>
                  {/* This is where the embedded checkout form will be mounted */}
                  <div id="checkout-element" className="mt-4">
                    {/* Stripe Element will be inserted here */}
                  </div>
                </>
              ) : (
                // Immediately trigger monthly checkout
                <p>Redirecting to checkout...</p>
              )}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function ManageSubscriptionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscriptionManagerContent />
    </Suspense>
  );
}