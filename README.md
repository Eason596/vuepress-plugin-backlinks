# vuepress-plugin-backlinks

一个用于 VuePress 2 的反向链接插件。在页面底部展示指向当前页面的其他笔记，类似 Obsidian 的 Backlinks 面板。链接数据来自 [vuepress-plugin-knowledge-graph](https://github.com/Eason596/vuepress-plugin-knowledge-graph) 在构建阶段生成的图谱边。

## 功能

- 自动在文档页底部展示反向链接列表
- 基于 Markdown 内链关系（Obsidian 双链、相对链接），不包含标签/分类边
- 支持分页、展开/收起
- 支持通过 frontmatter 控制每页显示数量或关闭反向链接
- 使用 Plume 主题的 `LinkCard` 卡片样式展示链接

## 环境要求

| 依赖 | 版本 |
| --- | --- |
| Node.js | `^20.19.0` 或 `>=22.0.0` |
| VuePress | `^2.0.0-rc.30` |
| Vue | `^3.5.0` |
| vuepress-plugin-knowledge-graph | `>=0.1.0` |
| vuepress-theme-plume | `^1.0.0-rc.202` |

> 本插件依赖 `vuepress-plugin-knowledge-graph` 生成链接数据，并使用 Plume 主题的 `LinkCard` 组件，因此需与 **vuepress-theme-plume** 配合使用。

## 安装

```bash
npm install vuepress-plugin-backlinks vuepress-plugin-knowledge-graph
# 或
pnpm add vuepress-plugin-backlinks vuepress-plugin-knowledge-graph
# 或
yarn add vuepress-plugin-backlinks vuepress-plugin-knowledge-graph
```

本地开发时：

```bash
npm install ../vuepress-plugin-backlinks
```

## 快速开始

在 `.vuepress/config.ts` 中注册插件（需同时启用 knowledge-graph）：

```typescript
import { defineUserConfig } from 'vuepress'
import { plumeTheme } from 'vuepress-theme-plume'
import { knowledgeGraphPlugin } from 'vuepress-plugin-knowledge-graph'
import { backlinksPlugin } from 'vuepress-plugin-backlinks'

export default defineUserConfig({
  theme: plumeTheme({ /* ... */ }),
  plugins: [
    knowledgeGraphPlugin(),
    backlinksPlugin({
      defaultPageSize: 12,
    }),
  ],
})
```

注册插件后，还需在 `.vuepress/client.ts` 中将 `<Backlinks />` 注入 Plume 主题的 `doc-after` 插槽：

```typescript
import { defineClientConfig } from 'vuepress/client'
import { Layout } from 'vuepress-theme-plume/client'
import Backlinks from 'vuepress-plugin-backlinks/src/components/Backlinks.vue'

export default defineClientConfig({
  layouts: {
    Layout: {
      setup() {},
      components: { Layout, Backlinks },
      template: `
        <Layout>
          <template #doc-after>
            <Backlinks />
          </template>
        </Layout>
      `,
    },
  },
})
```

更推荐的方式是创建 Layout 包装组件（见下方「Layout 包装」）。

## 配置项

```typescript
backlinksPlugin({
  enabled: true,
  defaultPageSize: 12,
  title: '反向链接',
  sortLocale: 'zh-CN',
})
```

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | 是否启用插件 |
| `defaultPageSize` | `number` | `12` | 默认每页显示的反向链接数量 |
| `title` | `string` | `'反向链接'` | 区块标题 |
| `sortLocale` | `string` | `'zh-CN'` | 链接标题排序使用的 locale |

## Layout 包装

在 `.vuepress/theme/components/LayoutWithBacklinks.vue` 中：

```vue
<script setup lang="ts">
import { Layout } from 'vuepress-theme-plume/client'
</script>

<template>
  <Layout>
    <template #doc-after>
      <Backlinks />
    </template>
  </Layout>
</template>
```

在 `.vuepress/client.ts` 中：

```typescript
import { defineClientConfig } from 'vuepress/client'
import LayoutWithBacklinks from './theme/components/LayoutWithBacklinks.vue'

export default defineClientConfig({
  layouts: {
    Layout: LayoutWithBacklinks,
  },
})
```

> Layout 包装需放在站点项目的 `.vuepress` 目录中，而不是插件包内，以避免 Plume 主题上下文重复加载导致 `themeLocaleData` 注入失败。

## Frontmatter

关闭当前页面的反向链接：

```yaml
---
backlinks: false
---
```

自定义分页大小：

```yaml
---
backlinks:
  pageSize: 6
---
```

或使用独立字段：

```yaml
---
backlinksPageSize: 8
---
```

## 手动嵌入

可在自定义 Layout 的 `doc-after` 插槽或 Markdown 中使用全局注册的 `<Backlinks />` 组件：

```vue
<script setup lang="ts">
import { Layout } from 'vuepress-theme-plume/client'
</script>

<template>
  <Layout>
    <template #doc-after>
      <Backlinks :default-page-size="12" />
    </template>
  </Layout>
</template>
```

## 建立反向链接

反向链接由其他页面指向当前页面的 **Markdown 内链** 产生。请确保已启用 `vuepress-plugin-knowledge-graph`，并在笔记中使用 Obsidian 双链或相对链接，例如：

```markdown
参见 [[目标页面]] 和 [另一篇笔记](./related.md)。
```

标签与分类关系不会计入反向链接。

## 项目结构

```
vuepress-plugin-backlinks/
├── index.js                              # npm 包 Node 入口
├── index.d.ts                            # 类型声明
├── src/
│   ├── client.ts                         # 客户端配置
│   ├── options.ts                        # 注入选项
│   └── components/
│       └── Backlinks.vue                 # 反向链接列表
├── package.json
└── README.md
```

## 注意事项

- 必须先注册 `vuepress-plugin-knowledge-graph`，否则构建时会因缺少 `@temp/knowledge-graph/data` 而失败。
- 修改 Markdown 链接后需等待 VuePress 重新编译，反向链接才会更新。
- Plume 主题的 Layout 包装组件应放在站点 `.vuepress` 目录，不要放在插件包内。

## 许可证

MIT
