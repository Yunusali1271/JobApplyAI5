import Stripe from "stripe";
import { collection, doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const firebaseUid = subscription.metadata.firebaseUid;

  console.log('userId:'+firebaseUid);
  console.log(subscription);
  if (!firebaseUid) {
    console.error("No Firebase UID found in subscription metadata");
    return;
  }

  // Update user subscription data in Firestore
  try {
    const userRef = doc(db, "subscriptions", firebaseUid);
    await setDoc(userRef, {
      id: subscription.id,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      productId: subscription.items.data[0].price.product,
      currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
      currentPeriodStart: new Date(subscription.items.data[0].current_period_start * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      customer: subscription.customer,
      interval: subscription.items.data[0].plan.interval,
      createdAt: new Date(subscription.created * 1000),
      updatedAt: new Date(),
    }, { merge: true });
    console.log(`Updated subscription for user ${firebaseUid}`);
  } catch (error) {
    console.error(`Failed to update subscription for user ${firebaseUid}:`, error);
    return;
  }
}