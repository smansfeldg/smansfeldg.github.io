/**
 * Estado global: un `string`. Nada más.
 *
 * No hace falta una librería de stores para esto — 20 líneas de observable
 * alcanzan y dejan el bundle en cero dependencias.
 *
 * Importa de `./catalog`, NO de `./index`. El barrel reexporta este módulo, y
 * el ciclo haría que `isLanguage` fuera `undefined` justo cuando corre el
 * inicializador de `current`.
 */
import { DEFAULT_LANGUAGE, isLanguage, resolveLanguage } from "./catalog"

const STORAGE_KEY = "lang"

type Listener = (language: string) => void

const listeners = new Set<Listener>()

/** 1) localStorage → 2) navigator → 3) fallback. */
const detect = (): string => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE

  const stored = localStorage.getItem(STORAGE_KEY)
  // Un idioma guardado que ya no existe (se borró su JSON) vuelve a detección.
  if (isLanguage(stored)) return stored

  return resolveLanguage(...(navigator.languages ?? [navigator.language]))
}

let current = detect()

export const getCurrentLanguage = (): string => current

export const setLanguage = (code: string): void => {
  if (!isLanguage(code) || code === current) return

  current = code
  if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, code)
  listeners.forEach((listener) => listener(current))
}

/** Dispara al suscribirse: quien se engancha ya recibe el idioma vigente. */
export const subscribeLanguage = (listener: Listener): (() => void) => {
  listeners.add(listener)
  listener(current)
  return () => listeners.delete(listener)
}

// Sincroniza pestañas abiertas. El guard `code === current` de setLanguage
// corta el rebote.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && isLanguage(event.newValue)) setLanguage(event.newValue)
  })
}
