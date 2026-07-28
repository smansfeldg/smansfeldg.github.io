/**
 * Lectura de traducciones (build) y aplicación al DOM (cliente).
 *
 * Modelo: se recorre el DOM UNA vez para armar el registro, y cada cambio de
 * idioma itera ese array plano. En el swap no hay `querySelectorAll`, ni
 * `split(".")`, ni `JSON.parse` — eso ya está resuelto en el registro.
 */
import { DEFAULT_LANGUAGE, getTranslations } from "./catalog"

type Params = Record<string, string | number>

const read = (dictionary: unknown, path: string[]): unknown => {
  let value: any = dictionary
  for (const key of path) {
    if (value == null) return undefined
    value = value[key]
  }
  return value
}

const format = (value: string, params?: Params): string =>
  params ? value.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`)) : value

/**
 * Un parámetro que empieza con `@` es una referencia a otra clave, no un valor
 * literal:
 *
 *   params={{ company: "@experience.jobs.lomas.name" }}
 *
 * Hace falta porque hay textos que interpolan otro texto traducible. Si se
 * congelara el valor en build, "Lomas de Zamora Municipality" seguiría en
 * inglés dentro del `title` después de cambiar a español.
 */
const resolveParams = (dictionary: unknown, params?: Params): Params | undefined => {
  if (!params) return undefined

  let resolved: Params | undefined
  for (const [key, value] of Object.entries(params)) {
    if (typeof value !== "string" || !value.startsWith("@")) continue
    const target = read(dictionary, value.slice(1).split("."))
    if (typeof target === "string") (resolved ??= { ...params })[key] = target
  }
  return resolved ?? params
}

/**
 * Lee un texto para el render estático. Lanza si la clave no existe: un typo
 * rompe el build, no la página.
 */
export const t = (key: string, params?: Params, language: string = DEFAULT_LANGUAGE): string => {
  const dictionary = getTranslations(language)
  const value = read(dictionary, key.split("."))
  if (typeof value !== "string") {
    throw new Error(`[i18n] "${key}" no existe o no es texto en ${language}.json`)
  }
  return format(value, resolveParams(dictionary, params))
}

/**
 * Atributos traducibles — lo que un elemento no puede expresar como hijo.
 *
 *   <a {...tAttr({ title: "hero.whatsappTitle" }, { name })}>
 */
export const tAttr = (
  keys: Record<string, string>,
  params?: Params,
  language: string = DEFAULT_LANGUAGE,
): Record<string, string> => {
  const attributes: Record<string, string> = {
    "data-i18n-attr": Object.entries(keys)
      .map(([attribute, key]) => `${attribute}:${key}`)
      .join(","),
  }
  if (params) attributes["data-i18n-params"] = JSON.stringify(params)

  for (const [attribute, key] of Object.entries(keys)) {
    attributes[attribute] = t(key, params, language)
  }
  return attributes
}

type Binding = {
  node: HTMLElement
  path: string[]
  params?: Params
  /** undefined → textContent */
  attribute?: string
  html?: boolean
}

const bindings: Binding[] = []

const paramsOf = (element: HTMLElement): Params | undefined =>
  element.dataset.i18nParams ? (JSON.parse(element.dataset.i18nParams) as Params) : undefined

/**
 * Un único recorrido del DOM. Reinvocable sobre un subárbol si algún día se
 * inyecta markup traducible en runtime.
 */
export const register = (root: ParentNode = document): void => {
  root.querySelectorAll<HTMLElement>("[data-i18n], [data-i18n-html]").forEach((node) => {
    const key = node.dataset.i18n ?? node.dataset.i18nHtml!
    bindings.push({
      node,
      path: key.split("."),
      params: paramsOf(node),
      html: node.dataset.i18nHtml !== undefined,
    })
  })

  root.querySelectorAll<HTMLElement>("[data-i18n-attr]").forEach((node) => {
    const params = paramsOf(node)
    for (const pair of node.dataset.i18nAttr!.split(",")) {
      const [attribute, key] = pair.split(":")
      bindings.push({ node, path: key.split("."), params, attribute })
    }
  })
}

let documentRegistered = false

export const apply = (language: string): void => {
  // Auto-registro en la primera aplicación. Astro junta todos los <script> de
  // componentes en un solo chunk y no garantiza el orden entre ellos, así que
  // depender de un register() externo previo sería una carrera.
  if (!documentRegistered) {
    documentRegistered = true
    register()
  }

  const dictionary = getTranslations(language)
  const root = document.documentElement

  root.lang = language
  root.dir = dictionary.meta.dir || "ltr"

  for (const { node, path, params, attribute, html } of bindings) {
    const value = read(dictionary, path)

    if (typeof value !== "string") {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] "${path.join(".")}" no resuelve en ${language}`, node)
      }
      continue
    }

    const text = format(value, resolveParams(dictionary, params))

    if (attribute) node.setAttribute(attribute, text)
    else if (html) node.innerHTML = text
    // Evita N escrituras inútiles cuando el idioma coincide con el renderizado.
    else if (node.textContent !== text) node.textContent = text
  }
}

// Inspector de desarrollo. Vite lo elimina del bundle de producción.
if (import.meta.env.DEV && typeof window !== "undefined") {
  ;(window as any).__i18n = {
    bindings,
    keys: () => bindings.map((binding) => binding.path.join(".")),
    missing: (language: string) =>
      bindings
        .filter(({ path }) => typeof read(getTranslations(language), path) !== "string")
        .map(({ path, node }) => ({ key: path.join("."), node })),
    apply,
  }
}
