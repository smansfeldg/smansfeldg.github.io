/**
 * Un PDF por idioma, emitido durante el build.
 *
 * Al ser una ruta estática de Astro, el CV se regenera con cada build — es
 * decir, con cada push a `main` — a partir de los mismos JSON que renderizan la
 * página. No hay paso manual que olvidar ni archivo binario en el repo que
 * pueda quedar viejo.
 *
 * Las rutas salen del catálogo de idiomas: agregar `src/i18n/fr.json` agrega
 * `/cv-fr.pdf` sin tocar nada más, igual que agrega el comando de la paleta.
 */
import type { APIRoute, GetStaticPaths } from "astro"
import { getAvailableLanguages } from "@/i18n"
import { renderResumePdf } from "@/cv/pdf"
import { resumeFileName } from "@/cv/resume"

export const getStaticPaths: GetStaticPaths = () =>
  getAvailableLanguages().map(({ code }) => ({ params: { lang: code } }))

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as string

  return new Response(await renderResumePdf(lang), {
    headers: {
      "Content-Type": "application/pdf",
      // `inline`: quien abre el enlace ve el CV en el visor del navegador. La
      // descarga con nombre propio la fuerza el atributo `download` del <a>.
      "Content-Disposition": `inline; filename="${resumeFileName(lang)}"`,
    },
  })
}
