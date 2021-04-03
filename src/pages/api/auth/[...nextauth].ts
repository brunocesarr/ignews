import { query } from 'faunadb';
import NextAuth, { Session } from 'next-auth';
import Providers from 'next-auth/providers';
import { WithAdditionalParams } from 'next-auth/_utils';

import { fauna, getSubscriptionUserByEmail } from '../../../services/fauna';

export interface CustomSession extends Session {
  activeSubscription: any;
}

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: 'read:user'
    })
  ],
  // jwt: { 
  //   signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
  // },
  callbacks: {
    async session(session): Promise<WithAdditionalParams<CustomSession>> {
      try {
        const activeSubscription = await getSubscriptionUserByEmail(session.user.email);

        const customSession: WithAdditionalParams<CustomSession> = {
          ...session,
          activeSubscription
        };
        return customSession;
      } catch (error) {
        console.error('Error in session. Message: ', error.message);
        return { 
          ...session,
          activeSubscription: null
        } as WithAdditionalParams<CustomSession>;
      }
    },
    async signIn(user, account, profile) {
      try {
        const { email } = user;
        await fauna.query(
          query.If(
            query.Not(
              query.Exists(
                query.Match(
                  query.Index('user_by_email'),
                  query.Casefold(email)
                )
              )
            ),
            query.Create(
              query.Collection('users'),
              {
                data: { email }
              }
            ),
            query.Get(
              query.Match(
                query.Index('user_by_email'),
                query.Casefold(email)
              )
            )  
          )
        );          
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  },
})