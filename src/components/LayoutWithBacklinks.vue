<script setup lang="ts">
import { inject } from 'vue'
import { Layout } from 'vuepress-theme-plume/client'
import Backlinks from './Backlinks.vue'
import { BACKLINKS_OPTIONS_KEY } from '../options'

const options = inject(BACKLINKS_OPTIONS_KEY, {
  defaultPageSize: 12,
  title: '反向链接',
  sortLocale: 'zh-CN',
})
</script>

<template>
  <Layout>
    <template #doc-after>
      <Backlinks :default-page-size="options.defaultPageSize" />
    </template>
  </Layout>
</template>
