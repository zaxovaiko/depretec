import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'depretec',
  description: 'Find @deprecated JSDoc usages in your JS/TS project and map them to their replacements.',
  base: '/depdet/',
  head: [['link', { rel: 'icon', href: '/depdet/favicon.ico' }]],
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'CLI Reference', link: '/cli-reference' },
      { text: 'API', link: '/api' },
      { text: 'npm', link: 'https://www.npmjs.com/package/depretec' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'How It Works', link: '/how-it-works' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'CLI Reference', link: '/cli-reference' },
          { text: 'Programmatic API', link: '/api' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/zaxovaiko/depdet' },
    ],
    footer: {
      message: 'Released under the MIT License.',
    },
    search: {
      provider: 'local',
    },
  },
})
