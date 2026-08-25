<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { definePageMeta, queryCollection } from '#imports'
import { DMask, DPagination } from '#components'

import AsyncSafeSeoWithOg from '~/components/AsyncSafeSeoWithOg.vue'
import BlogTile from '~/components/blog/Tile.vue'
import { useBlogNavigationConfig } from '~/composables/navigation'

definePageMeta({
  path: '/blog/:page(\\d+)?'
})

const route = useRoute()

const currentPage = computed(() => Number(route.params.page || 1))

const { itemsOnPage } = useBlogNavigationConfig()

const { data: pagesCount } = useAsyncData(
  `blog/pages-count/${itemsOnPage}`,
  () => queryCollection('blog').where('draft', '=', 0).count('path'),
  {
    server: true,
    transform: (articlesCount) => Math.ceil(articlesCount / itemsOnPage)
  }
)

const { data: blogPosts } = useAsyncData(
  `blog/pages/${currentPage.value}`,
  () =>
    queryCollection('blog')
      .select('title', 'description', 'date', 'path', 'image', 'tags', 'lang')
      .where('draft', '=', 0)
      .limit(itemsOnPage)
      .skip((currentPage.value - 1) * itemsOnPage)
      .order('date', 'DESC')
      .all(),
  {
    server: true
  }
)
const currentOrigin = computed(() => {
  if (window) {
    return window.location.origin
  }
  return ''
})

const rssLink = computed(() => {
  if (currentOrigin.value) {
    return `${currentOrigin.value}/blog/rss.xml`
  }
  return ''
})

const rssLinkEn = computed(() => {
  if (currentOrigin.value) {
    return `${currentOrigin.value}/blog/rss.en.xml`
  }
  return ''
})

const rssLinkFr = computed(() => {
  if (currentOrigin.value) {
    return `${currentOrigin.value}/blog/rss.fr.xml`
  }
  return ''
})
</script>

<template>
  <div class="mb-96">
    <AsyncSafeSeoWithOg title="Blog" />
    <Head>
      <Link
        rel="alternate"
        type="application/rss+xml"
        title="RSS Feed"
        href="/blog/rss.xml"
      />
    </Head>
    <div class="relative isolate px-3 max-w-3xl mx-auto mt-10">
      <div class="max-w-lg pb-5">
        <h1
          class="text-6xl sm:text-8xl font-serif mb-5 dark:text-cyan-300 text-cyan-700"
        >
          Blog
        </h1>
        <p class="dark:first-letter:bg-cyan-600 first-letter:bg-cyan-200">
          Welcome to my blog! Here you will find news, articles, and insights
          related to software development, programming languages, technology
          trends, and more. My goal is to provide informative and engaging
          content that is useful for developers of all levels.
        </p>
      </div>
      <DMask
        mask="owl"
        color
        outline
        class="h-full w-full flex flex-row-reverse absolute top-0 -z-10 opacity-25 sm:opacity-100 transition-all"
      />
    </div>

    <div class="px-3 max-w-3xl mx-auto flex gap-3 mt-3 mb-10">
      <DBtn
        :href="rssLink"
        target="_blank"
        rel="noopener noreferrer"
        no-rotate
        text-transform="capitalize"
      >
        <Icon
          name="openmoji:globe-showing-europe-africa"
          class="inline-block mr-2"
        />
        RSS Feed
      </DBtn>
      <DBtn
        :href="rssLinkEn"
        target="_blank"
        rel="noopener noreferrer"
        no-rotate
        text-transform="capitalize"
      >
        <Icon name="openmoji:flag-united-kingdom" class="inline-block mr-2" />
        RSS English
      </DBtn>
      <DBtn
        :href="rssLinkFr"
        target="_blank"
        rel="noopener noreferrer"
        no-rotate
        text-transform="capitalize"
      >
        <Icon name="openmoji:flag-france" class="inline-block mr-2" />
        RSS Français
      </DBtn>
    </div>

    <section v-if="pagesCount">
      <DPagination
        v-if="pagesCount > 1"
        class="mx-auto my-10 text-center"
        :current-page="currentPage"
        :all-pages="pagesCount"
        base-link="/blog"
      />
      <nav
        class="max-w-7xl grid md:grid-cols-2 lg:grid-cols-3 mx-auto gap-6 px-2 md:px-6"
      >
        <BlogTile
          v-for="article in blogPosts"
          :key="article.path"
          :article="article"
        />
      </nav>
      <DPagination
        v-if="pagesCount > 1"
        class="mx-auto my-10 text-center"
        :current-page="currentPage"
        :all-pages="pagesCount"
        base-link="/blog"
      />
    </section>
  </div>
</template>
