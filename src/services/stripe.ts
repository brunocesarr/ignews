import { User } from 'next-auth';
import Stripe from 'stripe';

import { name, version } from '../../package.json';
import { getUserByEmail, updateStripeCustomerInfoUser } from './fauna';

//#region Constructor
const stripe = new Stripe(
  process.env.STRIPE_API_KEY,
  {
    apiVersion: '2020-08-27',
    appInfo: {
      name,
      version
    }
  }
);
//#endregion

//#region Private Methods
const createCustomer = async (user: User) => {
  try {
    return await stripe.customers.create({
      email: user.email
    });
  } catch (error) {
    console.error('Error in the create customer. Message: ', error.message);
    throw error;
  }
}
//#endregion

export const getPriceIgnews = async (): Promise<Stripe.Response<Stripe.Price>> => {
  try {
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID, {
      expand: ['product']
    });  
    return price;
  } catch (error) {
    console.error('Error in the get price ig.news. Message: ', error.message);
    throw error;
  }
}

export const createCheckoutSession = async (
  user: User
): Promise<Stripe.Response<Stripe.Checkout.Session>> => {
  try {
    const userInfo = await getUserByEmail(user.email);

    let customerId = userInfo.stripeCustomerId;

    if (!customerId) {
      const stripeCustomer = await createCustomer(user);
      await updateStripeCustomerInfoUser(userInfo.id, stripeCustomer.id);
      customerId = stripeCustomer.id;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        { price: process.env.STRIPE_PRICE_ID, quantity: 1 }
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    });

    return checkoutSession;
  } catch (error) {
    console.error('Error in the create checkout session. Message: ', error.message);
    throw error;
  }
}

export const constructStripeEvent = (
  buf: Buffer,
  secret: string | string[],
): Stripe.Event  => {
  try {
    return stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    console.error('Error in construction stripe event. Message: ', error.message);
    throw error;
  }
}

export const retrieveSubscription = async (
  subscriptionId: string
): Promise<Stripe.Response<Stripe.Subscription>> => {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error in retrieve subscription. Message: ', error.message);
  }
}