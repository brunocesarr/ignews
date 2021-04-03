import { GetStaticProps } from 'next';
import Head from 'next/head';
import React from 'react';

import { SubscribeButton } from '../components/SubscribeButton';
import { getPriceIgnews } from '../services/stripe';
import styles from '../styles/Home/styles.module.scss';
import { formatNumberPrice } from '../utils/formats';

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>

          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding"/>

      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await getPriceIgnews();

  const product = {
    priceId: price.id,
    amount: formatNumberPrice({
      locale: 'en-us', 
      currency: 'USD', 
      value: price.unit_amount / 100}),
  }

  return { 
    props: {
      product,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  }
}
