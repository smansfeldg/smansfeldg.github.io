import { defineConfig } from 'astro/config';

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
  }
});
