import { useSession, signIn } from 'next-auth/client';
import { useState } from 'react';
import { subscribe } from '../../services/api';

import { FaTruckLoading } from 'react-icons/fa';

import styles from './styles.module.scss';
import { useRouter } from 'next/router';
import { CustomSession } from '../../pages/api/auth/[...nextauth]';

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton({
  priceId
}: SubscribeButtonProps) {
  const [isLoadingSubscribe, setIsLoadingSubscribe] = useState<boolean>(false)
  const [session] = useSession();
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!session){
      signIn('github')
      return;
    }

    const activeSubscription = (session as CustomSession)
      .activeSubscription;
    if (activeSubscription) {
      router.push('/posts')
      return;
    }

    try {
      setIsLoadingSubscribe(true);
      await subscribe();
    } catch (error) {
      console.error('Error into subscribe ig.news. Message: ', error.message);
    } finally {
      setIsLoadingSubscribe(false);
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
      disabled={isLoadingSubscribe}
    >
      { isLoadingSubscribe ? <FaTruckLoading /> : 'Subscribe now' } 
    </button>
  )
}