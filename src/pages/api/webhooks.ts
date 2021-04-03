import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import Stripe from 'stripe';

import { constructStripeEvent } from '../../services/stripe';
import { saveSubscription } from './_lib/manageSubscription';

async function buffer(readable: Readable) : Promise<Buffer> {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    );
  }

  return Buffer.concat(chunks);
}

async function handleCheckoutSessionCompleted(
  event: Stripe.Event
): Promise<void> {
  try {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    await saveSubscription(
      checkoutSession.subscription.toString(),
      checkoutSession.customer.toString(),
      true
    );      
  } catch (error) {
    console.error('Error handler checkout session completed. Message: ', error.message);
    throw error;
  }
}

async function handleCustomerSubscriptionsActions(
  event: Stripe.Event
): Promise<void> {
  try {
    const subscription = event.data.object as Stripe.Subscription;

    await saveSubscription(
      subscription.id,
      subscription.customer.toString()
    );      
  } catch (error) {
    console.error('Error handler customer subscription actions. Message: ', error.message);
    throw error;
  }
}

export const config = {
  api: {
    bodyParser: false,
  }
};

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export default async (req:NextApiRequest, res:NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const buf = await buffer(req);
      const secret = req.headers['stripe-signature']; 

      let event: Stripe.Event;
      try {
        event = constructStripeEvent(buf, secret);
      } catch (error) {
        console.error('Error in the construct stripe event. Message: ' + error.message);
        res.status(400).send({
          error: `Webhook error. Message: ${error.message}`
        });          
      }
      
      const { type: typeOfEvent } = event;

      if (relevantEvents.has(typeOfEvent)) {
        try {
          switch (event.type) {
            case 'checkout.session.completed':
              await handleCheckoutSessionCompleted(event);
              break;
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
              await handleCustomerSubscriptionsActions(event);
              break;
            default:
              throw new Error('Unhandled event.')
          }            
        } catch (error) {
          console.error('Webhook handler failed. Message: ' + error);
          res.json({
            error: 'Webhook handler failed.'
          });    
        }
      }

      res.status(200).json({
        received: true
      });
    } else {
      res.setHeader('Allow', 'POST');
      res.status(405).end('Method not allowed');
    }
  } catch (error) {
    console.error('Error in webhooks. Message: ', error.message);
    res.status(500).end('Error in webhooks. Message: ' + error.message)
  }
}