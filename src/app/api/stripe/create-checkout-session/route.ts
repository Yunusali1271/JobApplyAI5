import { metadata } from '@/app/layout';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { lineItems, email, uid } = await req.json();

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json({ error: 'Invalid line items provided' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode : 'embedded',
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      customer_email : email,
      subscription_data : { metadata : {'firebaseUid' : uid}} ,
      metadata : { 'firebaseUid' : uid },
      return_url: `${req.nextUrl.origin}/manage-subscription?success=true`,
    });
    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}