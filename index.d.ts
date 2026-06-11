import type { Plugin } from 'vuepress'

export interface BacklinksPluginOptions {
  /** Whether the plugin is enabled. Default: true */
  enabled?: boolean
  /** Default number of backlinks per page. Default: 12 */
  defaultPageSize?: number
  /** Section heading text. Default: '反向链接' */
  title?: string
  /** Locale passed to localeCompare when sorting backlinks. Default: 'zh-CN' */
  sortLocale?: string
}

export declare function backlinksPlugin(options?: BacklinksPluginOptions): Plugin

export default backlinksPlugin
