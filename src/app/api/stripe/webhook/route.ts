import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil' as any,
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_SERVICE_ACCT_EMAIL,
      privateKey: (process.env.FIREBASE_SERVICE_ACCT_PRIVATE_KEY!).replace(/\\n/g, '\n'),
    })
  });
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
async function syncSubscription(event : Stripe.Event)
{
    const subscription = event.data.object as Stripe.Subscription;
    const firebaseUid = subscription.metadata.firebaseUid;
    try{
      const userRef = admin.firestore().collection("subscriptions").doc(firebaseUid);
      await userRef.set({
        id: subscription.id,
        status: subscription.status,
        priceId: subscription.items.data[0].price.id,
        productId: subscription.items.data[0].price.product,
        currentPeriodEnd: admin.firestore.Timestamp.fromMillis((subscription as any).current_period_end * 1000),
        currentPeriodStart: admin.firestore.Timestamp.fromMillis((subscription as any).current_period_start * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        customer: subscription.customer,
        interval: subscription.items.data[0].plan.interval,
        createdAt: admin.firestore.Timestamp.fromMillis(subscription.created * 1000),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
      }, { merge: true });
      console.log(`Updated subscription for user ${firebaseUid}`);
    }
    catch (err: any){
      console.error(`Failed to update subscription for user ${firebaseUid}:`, err);
    }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    const response = NextResponse.json({ received: false, error: 'No signature header' }, { status: 400 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, HEAD');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Stripe-Signature');
    return response;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    const response = NextResponse.json({ received: false, error: `Webhook Error: ${err.message}` }, { status: 400 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, HEAD');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Stripe-Signature');
    return response;
  }

  // Handle the event
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      console.log(`handling event type ${event.type}`);
      await syncSubscription(event);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  // Return a 200 response to acknowledge receipt of the event
  const response = NextResponse.json({ received: true }, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, HEAD');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Stripe-Signature');
  return response;
}

export async function HEAD(req: NextRequest) {
  const response = NextResponse.json({}, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, HEAD');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Stripe-Signature');
  return response;
}