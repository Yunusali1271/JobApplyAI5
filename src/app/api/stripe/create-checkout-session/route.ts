import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil', // Use the latest API version or the one you prefer
});

export async function POST(req: NextRequest) {
  try {
    const { lineItems } = await req.json();

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json({ error: 'Invalid line items provided' }, { status: 400 });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${req.nextUrl.origin}/manage-subscription?success=true`, // Redirect URL after successful payment
      cancel_url: `${req.nextUrl.origin}/manage-subscription?canceled=true`, // Redirect URL if payment is canceled
    });
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}