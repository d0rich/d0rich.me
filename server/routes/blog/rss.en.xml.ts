import { queryCollection } from '@nuxt/content/server'
import { defineEventHandler, setHeader } from 'h3'
import { generateRSSFeed } from '~/utils/rss';

export default defineEventHandler(async (event) => {
  const blogDocs = await queryCollection(event, 'blog')
    .where('draft', '=', 0)
    .where('lang', '=', 'en')
    .order('date', 'DESC')
    .limit(50)
    .all()
  setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  return generateRSSFeed(blogDocs, 'en').rss2()
})
