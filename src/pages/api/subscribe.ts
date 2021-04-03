import { NextApiRequest, NextApiResponse } from "next";
import { createCheckoutSession } from "../../services/stripe";
import { getSession } from 'next-auth/client';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const session = await getSession({ req });
      const checkoutSession = await createCheckoutSession(session.user);
      
      return res
        .status(200)
        .json({ sessionId: checkoutSession.id });
    } else {
      res.setHeader('Allow', 'POST');
      res.status(405).end('Method not allowed');
    }
  } catch (error) {
    console.error('Error in subscribe stripe. Message: ', error.message);
    res.status(500).end('Error in subscribe stripe. Message: ' + error.message);
  }
}