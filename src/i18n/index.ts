/**
 * API pública de internacionalización.
 *
 * Ningún componente importa un JSON ni un submódulo de `i18n/`: todo pasa por
 * acá. Cambiar el origen de las traducciones (CMS, API, otra estructura de
 * archivos) no debería tocar nada fuera de esta carpeta.
 */
export type { Language, Translations } from "./schema"

export {
  DEFAULT_LANGUAGE,
  getAvailableLanguages,
  getTranslations,
  isLanguage,
  resolveLanguage,
} from "./catalog"

// Runtime. En build son inertes: `getCurrentLanguage` devuelve el idioma por
// defecto y `setLanguage` no hace nada, porque no hay localStorage.
export { getCurrentLanguage, setLanguage, subscribeLanguage } from "./store"

// Lectura para el render estático (`t`, `tAttr`) y binder (`register`, `apply`).
export { apply, register, t, tAttr } from "./dom"
