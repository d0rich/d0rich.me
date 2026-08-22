import { queryCollection } from '@nuxt/content/server'
import { defineEventHandler, setHeader } from 'h3'
import { generateRSSFeed } from '~/utils/rss';

export default defineEventHandler(async (event) => {
  const blogDocs = await queryCollection(event, 'blog')
    .where('draft', '=', 0)
    .where('lang', '=', 'fr')
    .order('date', 'DESC')
    .limit(50)
    .all()
  setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  return generateRSSFeed(
    blogDocs,
    'fr',
    'Le Blog de d0rich (Nikolaï Dorofeev)',
    // Nikolai Dorofeev's professional thoughts, insights, and updates on technology, programming, and software development.
    'Les réflexions, idées et mises à jour professionnelles de Nikolaï Dorofeev sur la technologie, la programmation et le développement logiciel.'
  ).rss2()
})
