import type { InjectionKey } from 'vue'

export interface BacklinksOptions {
  defaultPageSize: number
  title: string
  sortLocale: string
}

export const BACKLINKS_OPTIONS_KEY: InjectionKey<BacklinksOptions> = Symbol('backlinks-options')
