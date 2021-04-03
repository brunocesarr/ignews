import { GetStaticProps } from 'next';
import Head from 'next/head';
import React from 'react';
import { getAllPosts, PostInfo } from '../../services/prismic';
import styles from '../../styles/Posts/styles.module.scss';

interface PostsProps {
  posts: PostInfo[];
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | ig.news</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post =>(
            <a key={post.slug} href={`/posts/${post.slug}`}>
              <time>{post.updatedAt}</time>
              <strong>{post.title}</strong>
              <p>{post.excerpt}</p>
            </a>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getAllPosts();
  return { 
    props: {
      posts
    }
  }
}