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
    // Non-secret vars exposed to Vite-processed code via import.meta.env.
    // Secrets (SUPABASE_SERVICE_KEY, GOOGLE_PLACES_KEY) are read via process.env
    // in server-only modules — NEVER add their prefixes here, to avoid leaking to client bundles.
    envPrefix: ['PUBLIC_', 'GOOGLE_MAPS_', 'GA_', 'DESTINATION_', 'BOOKING_'],
  },
  // adapter: cloudflare(), // uncomment when deploying to Cloudflare Pages
})
