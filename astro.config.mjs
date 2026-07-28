import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
const siteOrigin = process.env.GITHUB_PAGES_ORIGIN ?? 'https://smansfeldg.github.io';
const basePath = process.env.GITHUB_PAGES_BASE_PATH || '/';

export default defineConfig({
  site: siteOrigin,
  base: basePath,
  trailingSlash: 'always',
  // Sin bloque `i18n`: no hay rutas por idioma. El sitio es una sola landing y
  // el cambio de idioma ocurre en cliente (ver src/i18n/).
  integrations: [
    // Inlines icon SVGs at build time from the local @iconify-json/* packages,
    // replacing the iconify-icon CDN script and its runtime API calls.
    icon(),
  ],
});
