import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { handleSubscriptionUpdated } from '@/lib/stripe/handleSubscriptionUpdated';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
      const auth = getAuth();
      signInWithEmailAndPassword(auth, process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!)
        .then(() => {handleSubscriptionUpdated(event); 
      });
      console.log(`handled event type ${event.type}`);
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