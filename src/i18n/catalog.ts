/**
 * Descubrimiento de idiomas.
 *
 * Este es el ÚNICO archivo del proyecto que sabe que las traducciones son
 * archivos JSON. Si mañana vienen de un CMS o de una API, se reescribe esto y
 * nada más: el resto consume `@/i18n`.
 */
import { assertSameShape } from "./validate"
import type { Language, Translations } from "./schema"

/**
 * El patrón TIENE que ser un literal estático — Vite lo resuelve en build y no
 * admite variables ni template strings. `./*.json` no entra en subcarpetas, que
 * es exactamente lo que queremos: un archivo plano por idioma.
 *
 * `eager: true` inlinea todos los diccionarios en el bundle. Es deliberado: el
 * cambio de idioma no hace fetch. Si algún día son demasiados, se saca `eager`
 * y Vite genera un chunk por idioma; solo cambia este archivo.
 */
const modules = import.meta.glob<{ default: Translations }>("./*.json", { eager: true })

const toCode = (path: string) => path.replace(/^\.\/|\.json$/g, "")

export const dictionaries: Record<string, Translations> = Object.fromEntries(
  Object.entries(modules).map(([path, module]) => [toCode(path), module.default]),
)

export const codes = Object.keys(dictionaries)

/** Idioma horneado en el HTML estático y fallback cuando no hay coincidencia. */
export const DEFAULT_LANGUAGE = "en"

// Solo en build: `import.meta.env.SSR` es literalmente `false` en el bundle
// cliente, así que Vite elimina esta rama entera del JS que llega al browser.
if (import.meta.env.SSR) {
  if (!dictionaries[DEFAULT_LANGUAGE]) {
    throw new Error(`[i18n] Falta el idioma por defecto: src/i18n/${DEFAULT_LANGUAGE}.json`)
  }
  assertSameShape(dictionaries, DEFAULT_LANGUAGE)
}

export const isLanguage = (code?: string | null): code is string =>
  typeof code === "string" && code in dictionaries

export const getTranslations = (code?: string | null): Translations =>
  dictionaries[isLanguage(code) ? code : DEFAULT_LANGUAGE]

/**
 * "es-AR" → "es" si existe. Pensado para recibir `navigator.languages` entero
 * y quedarse con la primera coincidencia.
 */
export const resolveLanguage = (...candidates: (string | null | undefined)[]): string => {
  for (const tag of candidates) {
    if (!tag) continue
    const base = tag.toLowerCase().split("-")[0]
    if (isLanguage(base)) return base
  }
  return DEFAULT_LANGUAGE
}

/**
 * Nombre nativo del idioma sin mantener ningún array: aparece `it.json` y sale
 * "Italiano"; aparece `ja.json` y sale "日本語". `meta.name` en el JSON es un
 * override opcional para cuando Intl no da con el nombre que uno quiere.
 */
const nativeName = (code: string): string => {
  try {
    const name = new Intl.DisplayNames([code], { type: "language" }).of(code)
    // Intl devuelve minúscula en varios idiomas ("italiano", "français").
    return name ? name[0].toLocaleUpperCase(code) + name.slice(1) : code.toUpperCase()
  } catch {
    return code.toUpperCase()
  }
}

export const languages: Language[] = codes
  .map((code) => ({
    code,
    name: dictionaries[code].meta.name || nativeName(code),
    dir: dictionaries[code].meta.dir || "ltr",
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

export const getAvailableLanguages = (): Language[] => languages
