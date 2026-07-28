/**
 * Valida que todos los idiomas tengan exactamente la misma forma.
 *
 * Es lo que evita enterarse en producción: corre en build (y en el primer
 * request de `astro dev`) y rompe con el archivo y la clave exactos.
 *
 * También cubre los arrays, porque los índices se convierten en segmentos del
 * path: si `es.json` tiene 3 highlights donde `en.json` tiene 2, falla. Esa
 * simetría no es cosmética — el binder cambia texto, no crea ni borra nodos.
 */

/** Aplana un objeto a la lista de sus paths hoja: "experience.jobs.cvc.summary". */
const leafPaths = (value: unknown, prefix = ""): string[] =>
  value !== null && typeof value === "object"
    ? Object.entries(value).flatMap(([key, child]) =>
        leafPaths(child, prefix ? `${prefix}.${key}` : key),
      )
    : [prefix]

export function assertSameShape(
  dictionaries: Record<string, unknown>,
  reference: string,
): void {
  const expected = leafPaths(dictionaries[reference])
  const expectedSet = new Set(expected)
  const errors: string[] = []

  for (const [code, dictionary] of Object.entries(dictionaries)) {
    if (code === reference) continue

    const actual = new Set(leafPaths(dictionary))

    for (const path of expected) {
      if (!actual.has(path)) errors.push(`${code}.json → falta "${path}"`)
    }
    for (const path of actual) {
      if (!expectedSet.has(path)) errors.push(`${code}.json → sobra "${path}"`)
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `[i18n] Los idiomas no coinciden con ${reference}.json:\n  ${errors.join("\n  ")}`,
    )
  }
}
