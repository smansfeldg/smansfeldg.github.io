# Portfolio / CV

Sitio personal tipo portfolio y curriculo hecho con **Astro**.

## Que usa

- **Astro 4.3**: genera un sitio estatico rapido, ideal para contenido y portfolio.
- **TypeScript 5.3**: aporta tipado y mejor mantenimiento del codigo.
- **i18n propio sin dependencias**: una sola landing, un solo arbol de componentes, y el idioma se cambia en cliente sin recargar ni navegar.
- **JSON como fuente de datos**: los datos neutros al idioma viven en `src/data/content.json` y los textos traducibles en `src/i18n/<codigo>.json`.
- **Hotkeypad**: habilita la paleta de comandos y atajos de teclado.
- **Iconify**: renderiza los iconos de habilidades mediante `<iconify-icon>`.
- **Google Fonts**: tipografias externas para la identidad visual.
- **SEO y metadatos**: incluye Open Graph, Twitter Cards y datos estructurados JSON-LD.
- **Analítica Integrada**: utiliza Microsoft Clarity y un sistema modular de eventos para trackear el uso.

## Estructura

- `src/pages/`: paginas del sitio.
- `src/layouts/`: layout base y configuracion global.
- `src/components/`: componentes reutilizables y secciones del CV.
- `src/icons/`: iconos SVG propios.
- `src/analytics/`: sistema modular de analíticas y eventos.
- `src/i18n/`: modulo de internacionalizacion y un JSON de textos por idioma.
- `src/data/content.json`: datos del perfil que no dependen del idioma.
- `public/`: imagenes y recursos estaticos.

Para agregar un idioma alcanza con copiar un JSON nuevo en `src/i18n/` (por ejemplo `pt.json`): el selector, la paleta de comandos y la deteccion automatica lo toman solos.

## Tracking y Analítica

El proyecto incluye un sistema de analíticas centralizado en `src/analytics/`:
- Integración global con **Microsoft Clarity**.
- Tracking de scroll avanzado (25%, 50%, 75%, 100%).
- Tracking de visibilidad de secciones dinámico mediante IntersectionObserver.
- Tracking de enlaces usando el atributo `data-track="nombre_evento"`.
- Tracking de comandos ejecutados en Hotkeypad (`command_*`).

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
- **i18n**: descubre los idiomas disponibles solo (`import.meta.glob`), valida en build que todos tengan la misma estructura y aplica el cambio parcheando el DOM, sin duplicar paginas ni componentes.
- **Hotkeypad**: anade una experiencia tipo "command palette" para acciones rapidas.
- **Iconify**: simplifica el uso de muchos iconos de tecnologias sin tener que mantenerlos manualmente uno por uno.

## Notas

- El sitio esta pensado para publicarse en `https://smansfeldg.github.io`.
- El modo visual incluye tema claro/oscuro y ajustes para impresion.
