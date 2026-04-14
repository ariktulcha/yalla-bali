import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  output: 'static',
  site: 'https://ibalibali.com',
  trailingSlash: 'ignore',
  compressHTML: true,
  prefetch: {
    defaultStrategy: 'hover',
  },
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  // adapter: cloudflare(), // uncomment when deploying to Cloudflare Pages
})
