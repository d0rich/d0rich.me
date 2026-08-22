import { Feed } from 'feed'

import { withTrailingSlash, joinURL } from 'ufo'
import type { BlogCollectionItem } from '@nuxt/content'

const origin = 'https://d0rich.me'

export function generateRSSFeed(blogDocs: BlogCollectionItem[], lang?: string): Feed {
  const feed = new Feed({
    title: 'd0rich Blog',
    description: "Latest news and updates from d0rich's blog",
    link: withTrailingSlash(joinURL(origin, 'blog')),
    author: {
      name: 'Nikolai Dorofeev',
      email: 'contact@d0rich.me',
      link: withTrailingSlash(origin)
    },
    favicon: 'https://d0rich.me/favicon.ico',
    category: 'Technology',
    image: 'https://d0rich.me/og/image.v2.jpg',
    updated: new Date(blogDocs[0]?.date || Date.now()),
    language: lang
  })
  blogDocs.forEach((doc) => {
    feed.addItem({
      title: doc.title,
      link: withTrailingSlash(joinURL(origin, 'blog', doc.path)),
      description: doc.description,
      date: new Date(doc.date),
      image: doc.image ? joinURL(origin, doc.image) : undefined,
      author: [
        {
          name: 'Nikolai Dorofeev',
          email: 'contact@d0rich.me',
          link: withTrailingSlash(origin)
        }
      ],
      guid: withTrailingSlash(joinURL(origin, 'blog', doc.path))
    })
  })
  return feed
}
