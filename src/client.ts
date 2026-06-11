import { defineClientConfig } from 'vuepress/client'
import Backlinks from './components/Backlinks.vue'
import LayoutWithBacklinks from './components/LayoutWithBacklinks.vue'
import { BACKLINKS_OPTIONS_KEY } from './options'

declare const __BACKLINKS_ENABLED__: boolean
declare const __BACKLINKS_AUTO_LAYOUT__: boolean
declare const __BACKLINKS_DEFAULT_PAGE_SIZE__: number
declare const __BACKLINKS_TITLE__: string
declare const __BACKLINKS_SORT_LOCALE__: string

export default defineClientConfig({
  layouts: __BACKLINKS_ENABLED__ && __BACKLINKS_AUTO_LAYOUT__
    ? { Layout: LayoutWithBacklinks }
    : {},
  enhance({ app }) {
    if (!__BACKLINKS_ENABLED__) return

    app.provide(BACKLINKS_OPTIONS_KEY, {
      defaultPageSize: __BACKLINKS_DEFAULT_PAGE_SIZE__,
      title: __BACKLINKS_TITLE__,
      sortLocale: __BACKLINKS_SORT_LOCALE__,
    })
    app.component('Backlinks', Backlinks)
  },
})
