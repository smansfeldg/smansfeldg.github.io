/**
 * `en.json` es el idioma de referencia: su forma define el contrato que el
 * resto de los idiomas debe cumplir. Cambiar la referencia es cambiar esta
 * única importación.
 *
 * Ojo: esto da autocompletado y errores a quien CONSUME las traducciones, pero
 * no valida los otros JSON (Vite tipa `import.meta.glob` por aserción, no por
 * comprobación). De eso se encarga `validate.ts` en tiempo de build.
 */
import reference from "./en.json"

export type Translations = typeof reference

export type Language = {
  code: string
  name: string
  dir: string
}
