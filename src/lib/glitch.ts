/**
 * Envuelve un cambio de estado para que ocurra EN MEDIO de la ráfaga de glitch
 * (efecto → cambio → efecto) en lugar de antes.
 *
 * El efecto es decoración, nunca un requisito: si no está disponible —
 * `prefers-reduced-motion`, pestaña oculta, otra ráfaga ya en curso, o GlitchFX
 * directamente no montado — el cambio se aplica igual y al instante.
 *
 * Se comunica por `window.glitchFX` a propósito: cada `<script>` de Astro es su
 * propio módulo, así que un componente no puede exportarle funciones a otro.
 */
type GlitchFX = {
  /** Devuelve `true` solo si se hizo cargo de ejecutar `mutate`. */
  transition?: (mutate: () => void) => boolean
}

export const withGlitch = (mutate: () => void): void => {
  const fx = (window as unknown as { glitchFX?: GlitchFX }).glitchFX
  if (fx?.transition?.(mutate) !== true) mutate()
}
