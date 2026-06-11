import { dirname, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function slash(value) {
  return value.split(sep).join('/')
}

/**
 * @param {import('./index.d.ts').BacklinksPluginOptions} [options]
 */
export function backlinksPlugin(options = {}) {
  return {
    name: 'vuepress-plugin-backlinks',
    clientConfigFile: slash(join(__dirname, 'src/client.ts')),
    define: {
      __BACKLINKS_ENABLED__: options.enabled ?? true,
      __BACKLINKS_AUTO_LAYOUT__: options.autoLayout ?? true,
      __BACKLINKS_DEFAULT_PAGE_SIZE__: options.defaultPageSize ?? 12,
      __BACKLINKS_TITLE__: JSON.stringify(options.title ?? '反向链接'),
      __BACKLINKS_SORT_LOCALE__: JSON.stringify(options.sortLocale ?? 'zh-CN'),
    },
  }
}

export default backlinksPlugin
