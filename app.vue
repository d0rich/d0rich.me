<script setup lang="ts">
import { computed } from 'vue'
import {
  useRoute,
  onNuxtReady,
  useHead,
  useSeoMeta,
  useTransitionAnimationWorkaround
} from '#imports'
import {
  NuxtLayout,
  NuxtPage,
  DBigBangButtonAnimation,
  Head,
  Link,
  NoScript
} from '#components'
import { useFaviconAnimation } from '~/composables/favicon'

const { key } = useTransitionAnimationWorkaround()
const route = useRoute()

const description = 'Small web portal of an experienced IT specialist.'

const mostUsedEmojis =
  '😂❤️🤣👍😭🙏😘🥰😍😊😅😎' +
  '💕💔💖💗💙💚💛💜💓💞💘💝💟💌💋😘😚😙😗😶😐😑😬🙄😏😒😞😔' +
  '😟😕🙃🤑😲😮😯😳😱😨😰😢😥😪😓🤤😴😷🤒🤕🤢🤧😵🤯🤠😎🤓🧐' +
  '😕😟😔😞😢😭😤😠😡🤬🤯😳🥺😬😰😱😨😧😦😮😯😲😵😶😐😑😒🙄' +
  '😏😣😖😫😩🥱😤😠😡🤬😈👿💀☠️👻👽👾🤖🎃😺😸😹😻😼😽🙀😿😾' +
  '👐🙌👏🙏🤝👍👎👊✊🤛🤜🤞✌️🤘🤟👌🤏👈👉👆👇☝️✋🤚🖐🖖👋🤙' +
  '💪🖕✍️🤳💅💍💄💋👄👅👂👃👁👀🧠🦴🦷🗣👤👥🧥👚👕👖👔👗👘🥻🩱' +
  '🩲🩳👙👛👜👝🛍🎒👞👟🥾🥿👠👡🩰👢👑👒🎩🎓🧢⛑📿💄💍💎🕶🥽🥼🧵🧶'

const emojiSubset =
  '🇬🇧🇫🇷🇷🇺' + '⚙️🧬🧪🎨🚀🏗️📚🎮🎥🪄🧘‍♂️🏃‍♂️' + '🌍🤹‍♂️🎬' + '🐶🌬📓' + mostUsedEmojis
const emojiFontLink =
  'https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap&text=' +
  encodeURIComponent(emojiSubset)

onNuxtReady(() => {
  useFaviconAnimation()
})

useHead({
  titleTemplate(title: string | undefined) {
    if (title) return `${title} • d0rich`
    else return 'd0rich: Digital Artisan'
  },
  meta: [
    {
      name: 'keywords',
      content: [
        'Nikolai Dorofeev',
        'd0rich',
        'dorich2000@gmail.com',
        'contact@d0rich.me',
        'developer',
        'programmer',
        'software engineer',
        'IT',
        'informational technologies',
        'web',
        'frontend',
        'backend',
        'fullstack',
        'blockchain'
      ].join(', ')
    }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  description,
  ogDescription: description,
  author: 'Nikolai Dorofeev',
  generator: 'Nuxt 3',
  ogSiteName: 'd0rich.me',
  ogImage: 'https://d0rich.me/og/image.v3.jpg',
  ogUrl: computed(() => 'https://d0rich.me' + route.path),
  twitterCard: 'summary_large_image',
  twitterSite: '@d0rich',
  twitterCreator: '@d0rich',
  twitterImage: 'https://d0rich.me/og/image.v3.jpg',
  twitterTitle: 'd0rich: Digital Artisan',
  twitterDescription: description
})
</script>

<template>
  <Head>
    <Link rel="preconnect" href="https://fonts.googleapis.com" />
    <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <Link
      rel="preload"
      :href="emojiFontLink"
      as="style"
      onload="this.onload=null;this.rel='stylesheet'"
    />
    <NoScript>
      <Link rel="stylesheet" :href="emojiFontLink" />
    </NoScript>
  </Head>
  <NuxtLayout>
    <NuxtPage :key="key" />
  </NuxtLayout>
  <DBigBangButtonAnimation class="z-50" />
</template>
