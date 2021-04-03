import {
  getRefUserByCustomerId,
  saveSubscriptionUser,
  SubscriptionData,
  updateSubscriptionUser,
} from '../../../services/fauna';
import { retrieveSubscription } from '../../../services/stripe';

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  isCreatedAction = false
) {
  try {
    const userRef = await getRefUserByCustomerId(customerId);
    const subscription = await retrieveSubscription(subscriptionId);
  
    const subscriptionData: SubscriptionData = {
      id: subscription.id,
      userId: userRef,
      status: subscription.status,
      price_id: subscription.items.data[0].price.id
    };
  
    if (isCreatedAction)
      await saveSubscriptionUser(subscriptionData);
    else
      await updateSubscriptionUser(subscriptionData);
  } catch (error) {
    console.error('Error save subscription. Message: ' + error);
    throw error;
  }
}