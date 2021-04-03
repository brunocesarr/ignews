import axios from 'axios';

import { getStripeJs } from './stripe-js';

const api = axios.create({
  baseURL: '/api',
});

export const subscribe = async () => {
  try {
    const { data } = await api.post('/subscribe');
    const { sessionId } = data;

    const stripe = await getStripeJs();
    await stripe.redirectToCheckout({ sessionId });
  } catch (error) {
    console.error('Error in the subscribe stripe. Message: ', error.message);
    throw error;
  }
}