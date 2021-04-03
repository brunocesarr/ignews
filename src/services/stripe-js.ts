import { loadStripe } from '@stripe/stripe-js';

export async function getStripeJs() {
  try {
    const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
    return stripeJs;      
  } catch (error) {
    console.error('Error in load Stripe. Message: ', error.message);
    throw error;
  }
}