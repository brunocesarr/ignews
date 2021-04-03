import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import Head from "next/head";
import React from "react";

import { getPostByUid } from '../../services/prismic';

import styles from "../../styles/Posts/post.module.scss";
import { CustomSession } from "../api/auth/[...nextauth]";

interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function Post({ post }: PostProps) {
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
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const session = await getSession({ req }) as CustomSession;
  const { slug } = params;

  if (!session?.activeSubscription) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  const post = await getPostByUid(String(slug));

  return { 
    props: {
      post
    },
    redirect: 60 * 30, // 30 minutes
  }
}