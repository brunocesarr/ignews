import { Client, query } from 'faunadb';

export const fauna = new Client({
  secret: process.env.FAUNA_DB_KEY
});

type UserDb = {
  ref: {
    id: string;
  },
  data: { 
    email: string,
    stripe_customer_id: string;
  }
}

type UserInfo = {
  id: string;
  email: string;
  stripeCustomerId: string;
}

export type SubscriptionData = {
  id: string;
  userId: any;
  status: string;
  price_id: string;
}

export const getUserByEmail = async (email: string): Promise<UserInfo> => {
  try {
    var user = await fauna.query<UserDb>(
      query.Get(
        query.Match(
          query.Index('user_by_email'),
          query.Casefold(email)
        )
      )  
    ); 

    return {
      id: user.ref.id,
      email: user.data.email,
      stripeCustomerId: user.data.stripe_customer_id
    };
  } catch (error) {
    console.log('Error in get info at the user. Message: ', error.message);
    return null;
  }
}

export const getRefUserByCustomerId = async (customerId: string) => {
  try {
    const userRef = await fauna.query(
      query.Select(
        "ref",
        query.Get(
          query.Match(
            query.Index('user_by_stripe_customer_id'),
            customerId
          )
        )    
      )
    ); 

    return userRef;
  } catch (error) {
    console.log('Error in get info ref at the user. Message: ', error.message);
    return null;
  }
}

export const updateStripeCustomerInfoUser = async (
  userId: string, 
  stripeCustomerId: string
): Promise<void> => {
  try {
    await fauna.query(
      query.Update(
        query.Ref(query.Collection('users'), userId),
        { 
          data: { 
            stripe_customer_id: stripeCustomerId
          }
        }
      )
    )
  } catch (error) {
    console.log('Error in update customer info at the user. Message: ', error.message);
    throw error;
  }
}

export const saveSubscriptionUser = async (subscriptionData: SubscriptionData) => {
  try {
    await fauna.query(
      query.Create(
        query.Collection('subscriptions'),
        { data: subscriptionData }
      )
    );
  } catch (error) {
    console.log('Error in save subscription. Message: ', error.message);
    throw error;
  }
}

export const updateSubscriptionUser = async (subscription: SubscriptionData) => {
  try {
    await fauna.query(
      query.Replace(
        query.Select(
          "ref",
          query.Get(
            query.Match(
              query.Index('subscription_by_id'),
              subscription.id
            )
          )
        ),
        { data: subscription }
      )
    )
  } catch (error) {
    console.log('Error in update subscription info at the user. Message: ', error.message);
    throw error;
  }
}

export const getSubscriptionUserByEmail = async (emailUser: string) => {
  try {
    const activeSubscriptionUser = await fauna.query(
      query.Get(
        query.Intersection(
          query.Match(
            query.Index('subscription_by_user_ref'),
            query.Select(
              "ref",
              query.Get(
                query.Match(
                  query.Index('user_by_email'),
                  query.Casefold(emailUser)
                )
              )
            )
          ),
          query.Match(
            query.Index('subscription_by_status'),
            "active"
          )
        )
      )
    );

    return activeSubscriptionUser;
  } catch (error) {
    console.log('Error in get subscription user. Message: ', error.message);
    return null;
  }
}