import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
const siteOrigin = process.env.GITHUB_PAGES_ORIGIN ?? 'https://smansfeldg.github.io';
const basePath = process.env.GITHUB_PAGES_BASE_PATH || '/';

export default defineConfig({
  site: siteOrigin,
  base: basePath,
  trailingSlash: 'always',
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
  },
  integrations: [
    // Inlines icon SVGs at build time from the local @iconify-json/* packages,
    // replacing the iconify-icon CDN script and its runtime API calls.
    icon(),
  ],
});
