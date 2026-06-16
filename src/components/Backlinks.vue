<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { usePageFrontmatter, useRoute } from 'vuepress/client'
import { knowledgeGraphData } from '@temp/knowledge-graph/data'
import { BACKLINKS_OPTIONS_KEY } from '../options'

interface GraphNode {
  id: string
  title: string
  path: string
  file: string
}

interface GraphEdge {
  source: string
  target: string
  type: 'link' | 'tag' | 'category'
}

interface BacklinksFrontmatter {
  backlinks?: boolean | {
    pageSize?: number | string
  }
  backlinksPageSize?: number | string
}

const props = withDefaults(defineProps<{
  defaultPageSize?: number
}>(), {
  defaultPageSize: undefined,
})

const pluginOptions = inject(BACKLINKS_OPTIONS_KEY, {
  defaultPageSize: 12,
  title: '反向链接',
  sortLocale: 'zh-CN',
})

const route = useRoute()
const frontmatter = usePageFrontmatter<BacklinksFrontmatter>()
const nodes = knowledgeGraphData.nodes as GraphNode[]
const edges = knowledgeGraphData.edges as GraphEdge[]
const nodeById = new Map(nodes.map(node => [node.id, node]))
const currentPage = ref(1)
const expanded = ref(true)

function normalizePath(value: string): string {
  let path = value
  try {
    path = decodeURI(path)
  } catch {
    // Keep the original path if it contains malformed percent escapes.
  }

  return path
    .replace(/[?#].*$/, '')
    .replace(/\/index\.html$/, '/')
    .replace(/\.html$/, '')
    .replace(/\/$/, '') || '/'
}

const enabled = computed(() => {
  const backlinksConfig = frontmatter.value.backlinks
  if (backlinksConfig === false) return false
  return true
})

const currentNode = computed(() => {
  const currentPath = normalizePath(route.path)
  return nodes.find(node => normalizePath(node.path) === currentPath)
})

const backlinks = computed(() => {
  if (!enabled.value) return []

  const targetId = currentNode.value?.id
  if (!targetId) return []

  return edges
    .filter(edge => edge.type === 'link' && edge.target === targetId)
    .map(edge => nodeById.get(edge.source))
    .filter((node): node is GraphNode => Boolean(node))
    .sort((a, b) => compareTitle(a.title, b.title, pluginOptions.sortLocale))
})

function compareTitle(a: string, b: string, locale: string): number {
  try {
    return a.localeCompare(b, locale, { numeric: true })
  } catch {
    return a.localeCompare(b, undefined, { numeric: true })
  }
}

const resolvedDefaultPageSize = computed(() => props.defaultPageSize ?? pluginOptions.defaultPageSize)

const pageSize = computed(() => {
  const backlinksConfig = frontmatter.value.backlinks
  const value = frontmatter.value.backlinksPageSize
    ?? (typeof backlinksConfig === 'object' ? backlinksConfig.pageSize : undefined)
    ?? resolvedDefaultPageSize.value
  const normalized = Number(value)

  return Number.isFinite(normalized) && normalized > 0
    ? Math.floor(normalized)
    : resolvedDefaultPageSize.value
})

const pageCount = computed(() => Math.max(1, Math.ceil(backlinks.value.length / pageSize.value)))

const visibleBacklinks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return backlinks.value.slice(start, start + pageSize.value)
})

const rangeStart = computed(() => backlinks.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1)
const rangeEnd = computed(() => Math.min(currentPage.value * pageSize.value, backlinks.value.length))

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const title = computed(() => {
  const value = pluginOptions.title.trim()
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1)
  }
  return value
})

watch([() => route.path, pageSize, backlinks], () => {
  currentPage.value = 1
  expanded.value = true
})

watch(pageCount, (count) => {
  if (currentPage.value > count) currentPage.value = count
})
</script>

<template>
  <section v-if="backlinks.length > 0" class="backlinks" aria-labelledby="backlinks-title">
    <div class="backlinks-header">
      <div>
        <h2 id="backlinks-title">{{ title }}</h2>
        <span>{{ expanded ? `${rangeStart}-${rangeEnd}` : backlinks.length }} / {{ backlinks.length }}</span>
      </div>
      <button
        class="backlinks-toggle"
        type="button"
        :aria-expanded="expanded"
        aria-controls="backlinks-content"
        @click="expanded = !expanded"
      >
        {{ expanded ? '收起' : '展开' }}
      </button>
    </div>

    <div v-show="expanded" id="backlinks-content">
      <div class="backlinks-list">
        <LinkCard
          v-for="node in visibleBacklinks"
          :key="node.id"
          :href="node.path"
          :title="escapeHtml(node.title)"
        />
      </div>

      <nav v-if="pageCount > 1" class="backlinks-pagination" aria-label="反向链接分页">
        <button
          type="button"
          :disabled="currentPage === 1"
          @click="currentPage -= 1"
        >
          上一页
        </button>
        <span>第 {{ currentPage }} / {{ pageCount }} 页</span>
        <button
          type="button"
          :disabled="currentPage === pageCount"
          @click="currentPage += 1"
        >
          下一页
        </button>
      </nav>
    </div>
  </section>
</template>

<style scoped>
.backlinks {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

.backlinks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.backlinks-header h2 {
  margin: 0;
  border-top: 0;
  padding-top: 0;
  color: var(--vp-c-text-1);
  font-size: 20px;
  font-weight: 700;
}

.backlinks-header h2 + span {
  display: inline-block;
  margin-top: 6px;
  color: var(--vp-c-text-3);
  font-size: 13px;
  white-space: nowrap;
}

.backlinks-toggle {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: border-color var(--vp-t-color), color var(--vp-t-color), background-color var(--vp-t-color);
}

.backlinks-toggle:hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.backlinks-list {
  display: grid;
  gap: 12px;
  margin: 0;
}

.backlinks-list :deep(.vp-link-card) {
  margin: 0;
}

.backlinks-list :deep(.vp-link-card .body) {
  gap: 0;
}

.backlinks-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 18px;
}

.backlinks-pagination button {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: border-color var(--vp-t-color), color var(--vp-t-color), background-color var(--vp-t-color);
}

.backlinks-pagination button:not(:disabled):hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.backlinks-pagination button:disabled {
  color: var(--vp-c-text-3);
  cursor: not-allowed;
  opacity: 0.56;
}

.backlinks-pagination span {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

@media (max-width: 640px) {
  .backlinks-header {
    align-items: flex-start;
  }

  .backlinks-header h2 + span {
    display: block;
    margin-top: 6px;
  }

  .backlinks-pagination {
    justify-content: space-between;
    gap: 8px;
  }

  .backlinks-pagination span {
    font-size: 13px;
  }
}
</style>
