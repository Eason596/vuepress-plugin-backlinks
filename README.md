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

注册后，所有有反向链接的文档页底部会自动出现反向链接区域，**无需修改 `client.ts`**。

## 配置项

```typescript
backlinksPlugin({
  enabled: true,
  autoLayout: true,
  defaultPageSize: 12,
  title: '反向链接',
  sortLocale: 'zh-CN',
})
```

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | 是否启用插件 |
| `autoLayout` | `boolean` | `true` | 是否自动注入到主题 Layout 的 `doc-after` 插槽 |
| `defaultPageSize` | `number` | `12` | 默认每页显示的反向链接数量 |
| `title` | `string` | `'反向链接'` | 区块标题 |
| `sortLocale` | `string` | `'zh-CN'` | 链接标题排序使用的 locale |

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

若设置 `autoLayout: false`，可在自定义 Layout 或 Markdown 中使用 `<Backlinks />` 组件：

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
│       ├── Backlinks.vue                 # 反向链接列表
│       └── LayoutWithBacklinks.vue       # Plume Layout 包装
├── package.json
└── README.md
```

## 注意事项

- 必须先注册 `vuepress-plugin-knowledge-graph`，否则构建时会因缺少 `@temp/knowledge-graph/data` 而失败。
- 修改 Markdown 链接后需等待 VuePress 重新编译，反向链接才会更新。
- 若你的 `client.ts` 已自定义 `Layout`，请设置 `autoLayout: false` 并自行在 Layout 中插入 `<Backlinks />`，避免 Layout 被覆盖。

## 许可证

MIT
