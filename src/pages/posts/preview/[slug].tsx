import { GetStaticPaths, GetStaticProps } from 'next';
import { useSession } from 'next-auth/client';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { getPostByUid } from '../../../services/prismic';
import styles from '../../../styles/Posts/post.module.scss';
import { CustomSession } from '../../api/auth/[...nextauth]';

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function PostPreview({ post }: PostPreviewProps) {
  const [session] = useSession();
  const router = useRouter();

  useEffect(() => {
    const hasActiveSubscription = (session as CustomSession)
      ?.activeSubscription !== null;

    if (hasActiveSubscription){
      router.push(`/posts/${post.slug}`);
    }
  }, [session]);

  return(
    <>
      <Head>
        <title>{post.title} | ig.news</title>
      </Head>
      
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div 
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <div
          className={styles.continueReading}
        >
          Wanna continue reading?
          <Link href="/">
            <a>Subscribe now 🤗</a>
          </Link>
        </div>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const post = await getPostByUid(String(slug), null, true);

  return { 
    props: {
      post
    }
  }
}