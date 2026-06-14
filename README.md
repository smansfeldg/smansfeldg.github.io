# Portfolio / CV

Sitio personal tipo portfolio y curriculo hecho con **Astro**.

## Que usa

- **Astro 4.3**: genera un sitio estatico rapido, ideal para contenido y portfolio.
- **TypeScript 5.3**: aporta tipado y mejor mantenimiento del codigo.
- **Astro i18n**: maneja las versiones en **espanol** e **ingles**.
- **JSON como fuente de datos**: el contenido del CV vive en `cv.json` y `cv_english.json`.
- **Hotkeypad**: habilita la paleta de comandos y atajos de teclado.
- **Iconify**: renderiza los iconos de habilidades mediante `<iconify-icon>`.
- **Google Fonts**: tipografias externas para la identidad visual.
- **SEO y metadatos**: incluye Open Graph, Twitter Cards y datos estructurados JSON-LD.

## Estructura

- `src/pages/`: paginas del sitio.
- `src/layouts/`: layout base y configuracion global.
- `src/components/`: componentes reutilizables y secciones del CV.
- `src/icons/`: iconos SVG propios.
- `public/`: imagenes y recursos estaticos.
- `cv.json` / `cv_english.json`: contenido del perfil y experiencia.

## Comandos basicos

> El proyecto incluye `pnpm-lock.yaml`, asi que `pnpm` es la opcion recomendada.

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

Si prefieres `npm`:

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Que hace cada tecnologia

- **Astro**: organiza el sitio por paginas y componentes, con salida estatica y muy buen rendimiento.
- **TypeScript**: ayuda a evitar errores y hace mas claro el manejo de datos del CV.
- **i18n**: permite servir el contenido en dos idiomas sin duplicar toda la base del sitio.
- **Hotkeypad**: anade una experiencia tipo "command palette" para acciones rapidas.
- **Iconify**: simplifica el uso de muchos iconos de tecnologias sin tener que mantenerlos manualmente uno por uno.

## Notas

- El sitio esta pensado para publicarse en `https://smansfeldg.github.io`.
- El modo visual incluye tema claro/oscuro y ajustes para impresion.
