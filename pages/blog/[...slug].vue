<script setup lang="ts">
import Giscus, { type Theme } from '@giscus/vue'
import { withTrailingSlash } from 'ufo'
import { computed } from 'vue'
import { ClientOnly } from '#components'
import { useRoute, useAsyncData, useHead } from '#imports'
import { useColorMode } from '#imports'
import { queryCollection, queryCollectionItemSurroundings } from '#imports'
import { Head, Meta, DBigBangButton, ContentRenderer } from '#components'

import AsyncSafeSeoWithOg from '~/components/AsyncSafeSeoWithOg.vue'
import BlogSurroundDocCard from '~/components/blog/SurroundDocCard.vue'
import Error404 from '~/components/Error404.vue'

import { getLinkToPaginatedPage } from '@d0rich/esprit-design'
import { dateToDayMonthYear } from '~/utils/date'
import { clearSlug } from '~/utils/router'
import { useBlogNavigationConfig } from '~/composables/navigation'

const slug = clearSlug(useRoute().params.slug as string[])
const { itemsOnPage } = useBlogNavigationConfig()
const pagePath = ['/blog', ...slug].join('/')
const colorMode = useColorMode()

const { data: doc } = useAsyncData(pagePath, async () => {
  // TODO: Check if drafts are allowed
  const docPromise = queryCollection('blog').path(pagePath).first()
  // TODO: Check if order is correct
  const surroundPromise = queryCollectionItemSurroundings('blog', pagePath, {
    fields: ['title', 'description', 'path']
  })
  const [doc, surround] = await Promise.all([docPromise, surroundPromise])
  return {
    ...doc,
    before: surround[0],
    after: surround[1]
  }
})

const { data: position } = useAsyncData(
  ['blog', ...slug, 'position'].join('/'),
  () =>
    queryCollection('blog')
      .select('path')
      .where('draft', '=', 0)
      .orWhere((query) =>
        query
          .where('date', '>', doc.value?.date)
          .where('date', '=', doc.value?.date)
      )
      .all(),
  {
    server: true,
    transform: (result) => result.length,
    watch: [doc]
  }
)

const linkToBlog = computed(() => {
  return getLinkToPaginatedPage(
    '/blog',
    Math.ceil((position.value ?? 1) / itemsOnPage)
  )
})

const langIcon = computed(() => {
  if (doc.value?.lang === 'fr') {
    return 'openmoji:flag-france'
  } else if (doc.value?.lang === 'en') {
    return 'openmoji:flag-united-kingdom'
  } else {
    return ''
  }
})

const docDate = computed(() => {
  if (!doc.value?.date) return undefined
  return new Date(doc.value.date)
})

useHead({
  htmlAttrs: {
    lang: doc.value?.lang ?? 'en'
  }
})

const commentsTheme = computed<Theme>(() => {
  if (colorMode.value === 'dark') {
    return 'dark'
  } else {
    return 'light'
  }
})
</script>

<template>
  <div v-if="doc" class="pb-[50vh] pt-10">
    <AsyncSafeSeoWithOg
      :title="doc.title"
      :description="doc.description"
      :image="doc.image"
    />
    <Head>
      <Meta
        v-if="docDate"
        property="tg:published_date"
        :content="String(Math.floor(docDate.getTime() / 1000))"
      />
    </Head>
    <div class="blog-article mb-3">
      <nav class="mb-10">
        <DBigBangButton text="< Back" :to="withTrailingSlash(linkToBlog)" />
      </nav>
      <div>
        <time v-if="docDate" :datetime="docDate.toISOString()">
          {{ dateToDayMonthYear(doc.date) }}
        </time>
        <Icon v-if="langIcon" :name="langIcon" class="inline-block ml-2" />
      </div>
    </div>
    <ContentRenderer
      :value="doc"
      tag="article"
      class="prose prose-cyan dark:prose-invert blog-article"
    />
    <nav
      class="blog-article justify-center grid sm:grid-cols-2 gap-8 items-start my-16"
    >
      <BlogSurroundDocCard
        v-if="doc.after"
        :doc="doc.after"
        direction="after"
      />
      <BlogSurroundDocCard
        v-if="doc.before"
        :doc="doc.before"
        direction="before"
      />
    </nav>
    <nav class="blog-article blog-fonts my-10">
      <DBigBangButton text="< Back" :to="withTrailingSlash(linkToBlog)" />
    </nav>
    <div class="blog-fonts max-w-screen-md mx-auto px-3 mt-32">
      <ClientOnly>
        <Giscus
          repo="d0rich/d0rich.me"
          repo-id="R_kgDOUAdZYg"
          category="Comments"
          category-id="DIC_kwDOUAdZYs4DEJrH"
          mapping="pathname"
          loading="lazy"
          :lang="doc.lang"
          reactions-enabled="1"
          :theme="commentsTheme"
        />
      </ClientOnly>
    </div>
  </div>
  <Error404 v-else />
</template>

<style>
.blog-article {
  @apply max-w-screen-md mx-auto px-3;
}
</style>
