import Stripe from "stripe";
import { getFirestore, collection, doc, updateDoc } from "firebase/firestore";

export async function handleSubscriptionUpdated(event: Stripe.Event) {
  const db = getFirestore();
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  // Get the Firebase user ID from Stripe metadata
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: '2025-04-30.basil',
  });
  const customerData = await stripe.customers.retrieve(customerId);
  const userId = customerData.id;

  if (!userId) {
    console.log("No Firebase UID found in customer metadata");
    return;
  }

  // Update user subscription data in Firestore
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    subscription: {
      id: subscription.id,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      productId: subscription.items.data[0].price.product,
      currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      createdAt: new Date(subscription.created * 1000),
      updatedAt: new Date(),
    },
  });

  console.log(`Updated subscription for user ${userId}`);
}