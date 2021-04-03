import Prismic from '@prismicio/client';
import { DefaultClient } from '@prismicio/client/types/client';
import { RichText } from 'prismic-dom';

export type PostInfo = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}

function getPrismicClient(req?: unknown): DefaultClient {
  try {
    const prismic = Prismic.client(
      process.env.PRISMIC_ENDPOINT,
      { 
        req,
        accessToken: process.env.PRISMIC_ACCESS_TOKEN
      }
    );
    return prismic;      
  } catch (error) {
    console.error('Error in get prismic client. Message: ', error.message);
    throw error;
  }
}

export async function getAllPosts() {
  try {
    const prismic = getPrismicClient();

    const response = await prismic.query([
      Prismic.Predicates.at('document.type', 'post')
    ], { 
      fetch: ['publication.title', 'publication.content'],
      pageSize: 100,
    });

    const posts = response.results.map(post => {
      return {
        slug: post.uid,
        title: RichText.asText(post.data.title),
        excerpt: post.data.content
          .find(content => content.type === 'paragraph')
          ?.text ?? '',
        updatedAt: new Date(post.last_publication_date)
          .toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })
      }
    })

    return posts;
  } catch (error) {
    console.error('Error in get documents. Message: ', error.message);
    throw error;
  }
}

export async function getPostByUid( uid: string, req?: unknown, isPreviewPost = false) {
  try {
    const prismic = getPrismicClient(req);

    const response = await prismic.getByUID('post', uid, {});

    return {
      slug: uid,
      title: RichText.asText(response.data.title),
      content: isPreviewPost
        ? RichText.asHtml(response.data.content.splice(0, 3))
        : RichText.asHtml(response.data.content),
      updatedAt: new Date(response.last_publication_date)
        .toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
    };
  } catch (error) {
    console.error('Error in get documents. Message: ', error.message);
    throw error;
  }
}