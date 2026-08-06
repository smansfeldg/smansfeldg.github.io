/**
 * Render del CV a PDF.
 *
 * Es isomorfo a propósito (pdf-lib no toca el DOM): hoy corre en el build de
 * Astro para emitir un archivo por idioma, y mañana podría correr en cliente
 * sin cambiar una línea.
 *
 * El diseño está pensado para ATS antes que para la vista:
 *   - Una sola columna, un único flujo de lectura. Sin tablas, sin cajas, sin
 *     imágenes: el parser extrae el texto en el orden en que se dibuja.
 *   - Helvetica, una de las 14 fuentes estándar del formato. No hay fuente
 *     embebida que un extractor pueda leer mal ni subset que le falten glifos.
 *   - Encabezados de sección con los nombres que los ATS buscan
 *     ("Professional Experience", "Education"), no con los de la web.
 *   - Los datos de contacto van como texto del cuerpo en la primera página,
 *     nunca en un header/footer: muchos parsers descartan esas zonas.
 *   - Los enlaces son anotaciones sobre texto que también se lee plano, así
 *     que sirven al humano sin esconderle nada al robot.
 */
import { PDFDocument, PDFName, PDFString, StandardFonts, rgb, type PDFFont, type PDFPage, type PDFRef } from "pdf-lib"
import { buildResume, type Resume, type ResumeEntry } from "./resume"

const PAGE = { width: 612, height: 792 } // Letter, como el LaTeX original.
const MARGIN = { top: 52, bottom: 48, x: 54 }
const CONTENT_WIDTH = PAGE.width - MARGIN.x * 2

const INK = rgb(0.09, 0.09, 0.12)
const INK_SOFT = rgb(0.34, 0.33, 0.39)
const ACCENT = rgb(0.32, 0.16, 0.6)
const RULE = rgb(0.76, 0.74, 0.82)

const TYPE = {
  name: { size: 20, leading: 24 },
  headline: { size: 11, leading: 15 },
  contact: { size: 8.6, leading: 11.5 },
  heading: { size: 10.5, leading: 16 },
  entryTitle: { size: 10.6, leading: 14 },
  entrySub: { size: 9.4, leading: 12.5 },
  body: { size: 9.4, leading: 12.8 },
}

/**
 * Las fuentes estándar se codifican en WinAnsi (cp1252) y pdf-lib lanza ante
 * cualquier carácter fuera de esa tabla. Los acentos del español entran; una
 * flecha o una comilla tipográfica rara, no.
 *
 * Antes que romper el build por un carácter, se degrada: se quitan las tildes
 * que cp1252 no tenga y, si aun así no entra, se descarta el carácter.
 */
const WINANSI_EXTRAS = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160,
  0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014,
  0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
])

const encodable = (codePoint: number): boolean =>
  (codePoint >= 0x20 && codePoint <= 0x7e) ||
  (codePoint >= 0xa0 && codePoint <= 0xff) ||
  WINANSI_EXTRAS.has(codePoint)

const sanitize = (value: string): string =>
  [...value.replace(/\s+/g, " ").normalize("NFC")]
    .map((char) => {
      if (encodable(char.codePointAt(0) ?? 0)) return char
      const stripped = char.normalize("NFD").replace(/\p{M}/gu, "")
      return [...stripped].every((c) => encodable(c.codePointAt(0) ?? 0)) ? stripped : ""
    })
    .join("")

type Run = {
  text: string
  font: PDFFont
  size: number
  color: ReturnType<typeof rgb>
  href?: string
  /** Un separador no abre línea: si cae en el salto, se descarta. */
  separator?: boolean
}

const separator = (font: PDFFont, size: number): Run => ({
  text: "  |  ",
  font,
  size,
  color: RULE,
  separator: true,
})

/**
 * Cursor de escritura sobre un documento paginado.
 *
 * Mantiene una sola invariante: `y` es la línea base de lo último dibujado.
 * Todo lo que escribe pide espacio primero, así que el salto de página nunca
 * parte un bloque por la mitad.
 */
class Writer {
  private page: PDFPage
  private y: number
  readonly pages: PDFPage[] = []
  private readonly annotations = new Map<PDFPage, PDFRef[]>()

  constructor(
    private readonly doc: PDFDocument,
    readonly regular: PDFFont,
    readonly bold: PDFFont,
  ) {
    this.page = this.addPage()
    this.y = PAGE.height - MARGIN.top
  }

  private addPage(): PDFPage {
    const page = this.doc.addPage([PAGE.width, PAGE.height])
    this.pages.push(page)
    return page
  }

  private break(): void {
    this.page = this.addPage()
    this.y = PAGE.height - MARGIN.top
  }

  /** Reserva `height` en la página actual, saltando de página si no entra. */
  ensure(height: number): void {
    if (this.y - height < MARGIN.bottom) this.break()
  }

  gap(height: number): void {
    this.y -= height
  }

  wrap(text: string, font: PDFFont, size: number, width: number): string[] {
    const lines: string[] = []
    let line = ""

    for (const word of sanitize(text).split(" ")) {
      if (!word) continue
      const candidate = line ? `${line} ${word}` : word

      if (line && font.widthOfTextAtSize(candidate, size) > width) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    }

    if (line) lines.push(line)
    return lines
  }

  /** Párrafo con ajuste de línea. */
  paragraph(
    text: string,
    options: { font?: PDFFont; size?: number; leading?: number; color?: typeof INK; indent?: number } = {},
  ): void {
    const font = options.font ?? this.regular
    const size = options.size ?? TYPE.body.size
    const leading = options.leading ?? TYPE.body.leading
    const color = options.color ?? INK_SOFT
    const indent = options.indent ?? 0

    for (const line of this.wrap(text, font, size, CONTENT_WIDTH - indent)) {
      this.ensure(leading)
      this.y -= leading
      this.page.drawText(line, { x: MARGIN.x + indent, y: this.y, size, font, color })
    }
  }

  /**
   * Ítem de lista. La viñeta se dibuja junto a la primera línea y no antes:
   * si el bloque salta de página, salta con ella.
   */
  bullet(text: string): void {
    const { size, leading } = TYPE.body
    const indent = 13

    this.wrap(text, this.regular, size, CONTENT_WIDTH - indent).forEach((line, index) => {
      this.ensure(leading)
      this.y -= leading

      if (index === 0) {
        this.page.drawText("•", {
          x: MARGIN.x + 3,
          y: this.y,
          size,
          font: this.regular,
          color: ACCENT,
        })
      }

      this.page.drawText(line, {
        x: MARGIN.x + indent,
        y: this.y,
        size,
        font: this.regular,
        color: INK_SOFT,
      })
    })
  }

  /** Una línea con texto a izquierda y, opcionalmente, otro a la derecha. */
  row(
    left: string,
    right: string | undefined,
    options: { font?: PDFFont; size?: number; leading?: number; color?: typeof INK; rightColor?: typeof INK; rightSize?: number },
  ): void {
    const font = options.font ?? this.bold
    const size = options.size ?? TYPE.entryTitle.size
    const leading = options.leading ?? TYPE.entryTitle.leading
    const rightSize = options.rightSize ?? TYPE.entrySub.size
    const rightText = right ? sanitize(right) : ""
    const rightWidth = rightText ? this.regular.widthOfTextAtSize(rightText, rightSize) + 12 : 0

    const lines = this.wrap(left, font, size, CONTENT_WIDTH - rightWidth)
    this.ensure(leading * lines.length)

    lines.forEach((line, index) => {
      this.y -= leading
      this.page.drawText(line, { x: MARGIN.x, y: this.y, size, font, color: options.color ?? INK })

      // La fecha acompaña a la primera línea del título, como en cualquier CV.
      if (index === 0 && rightText) {
        this.page.drawText(rightText, {
          x: PAGE.width - MARGIN.x - this.regular.widthOfTextAtSize(rightText, rightSize),
          y: this.y,
          size: rightSize,
          font: this.regular,
          color: options.rightColor ?? INK_SOFT,
        })
      }
    })
  }

  /**
   * Fragmentos encadenados en un mismo párrafo, cada uno con su tipografía.
   *
   * Existe porque `paragraph` no alcanza en dos casos: un enlace necesita que
   * se sepa dónde empieza y dónde termina para colocarle la anotación encima,
   * y un "Término: valor" mezcla negrita y redonda en la misma línea. El
   * ajuste es por palabra, así que un fragmento largo se parte como cualquier
   * otro texto.
   */
  runs(items: Run[], leading: number): void {
    const rightEdge = MARGIN.x + CONTENT_WIDTH
    let x = MARGIN.x
    let started = false

    const newLine = () => {
      this.ensure(leading)
      this.y -= leading
      x = MARGIN.x
      started = true
    }

    /** Cuánto ocupa la primera palabra de un fragmento, para no cortar antes. */
    const firstWordWidth = (item: Run | undefined): number => {
      if (!item) return 0
      const word = sanitize(item.text).trimStart().split(" ")[0] ?? ""
      return item.font.widthOfTextAtSize(word, item.size)
    }

    items.forEach((item, index) => {
      const text = sanitize(item.text)
      if (!text) return

      // Un separador es atómico y viaja con lo que separa: se mide junto a la
      // primera palabra del fragmento siguiente y desaparece si cae en el
      // salto de línea, en vez de quedar colgando en un borde.
      if (item.separator) {
        const width = item.font.widthOfTextAtSize(text, item.size)
        if (!started || x + width + firstWordWidth(items[index + 1]) > rightEdge) return

        this.page.drawText(text, { x, y: this.y, size: item.size, font: item.font, color: item.color })
        x += width
        return
      }

      // Palabra más el espacio que la sigue: la unidad que no se parte.
      const chunks = text.match(/\S+ *| +/g) ?? []
      let pending = ""
      let pendingX = x

      const flush = () => {
        if (!pending) return
        this.page.drawText(pending, {
          x: pendingX,
          y: this.y,
          size: item.size,
          font: item.font,
          color: item.color,
        })
        // Un fragmento partido en dos líneas necesita una anotación por línea.
        if (item.href) {
          const width = item.font.widthOfTextAtSize(pending, item.size)
          this.link(item.href, pendingX, this.y - item.size * 0.25, width, item.size * 1.15)
        }
        pending = ""
      }

      for (const chunk of chunks) {
        const width = item.font.widthOfTextAtSize(chunk, item.size)

        if (!started) {
          newLine()
          pendingX = x
        } else if (x + width > rightEdge) {
          flush()
          newLine()
          pendingX = x
        }

        pending += chunk
        x += width
      }

      flush()
    })
  }

  rule(color = RULE, thickness = 0.75, offset = 4): void {
    this.ensure(offset + thickness)
    this.y -= offset
    this.page.drawLine({
      start: { x: MARGIN.x, y: this.y },
      end: { x: PAGE.width - MARGIN.x, y: this.y },
      thickness,
      color,
    })
  }

  link(href: string, x: number, y: number, width: number, height: number): void {
    const ref = this.doc.context.register(
      this.doc.context.obj({
        Type: "Annot",
        Subtype: "Link",
        Rect: [x, y, x + width, y + height],
        Border: [0, 0, 0],
        F: 4,
        A: this.doc.context.obj({ Type: "Action", S: "URI", URI: PDFString.of(href) }),
      }),
    )

    this.annotations.set(this.page, [...(this.annotations.get(this.page) ?? []), ref])
  }

  /**
   * Vuelca anotaciones y numeración. Va al final porque el total de páginas no
   * se conoce hasta que se escribió la última línea.
   */
  finish(pageLabel: string): void {
    for (const [page, refs] of this.annotations) {
      page.node.set(PDFName.of("Annots"), this.doc.context.obj(refs))
    }

    if (this.pages.length < 2) return

    this.pages.forEach((page, index) => {
      const label = sanitize(
        pageLabel
          .replace("{current}", String(index + 1))
          .replace("{total}", String(this.pages.length)),
      )
      const size = 7.5

      page.drawText(label, {
        x: (PAGE.width - this.regular.widthOfTextAtSize(label, size)) / 2,
        y: MARGIN.bottom - 22,
        size,
        font: this.regular,
        color: INK_SOFT,
      })
    })
  }
}

const drawEntry = (writer: Writer, entry: ResumeEntry): void => {
  // El encabezado de una entrada no puede quedar solo al pie de una página:
  // se reserva de una vez el título, el subtítulo y la primera línea de texto.
  writer.ensure(TYPE.entryTitle.leading + TYPE.entrySub.leading + TYPE.body.leading)
  writer.row(entry.title, entry.meta, { color: INK })

  if (entry.subtitle || entry.link) {
    writer.runs(
      [
        ...(entry.subtitle
          ? [{ text: entry.subtitle, font: writer.regular, size: TYPE.entrySub.size, color: INK_SOFT }]
          : []),
        ...(entry.subtitle && entry.link ? [separator(writer.regular, TYPE.entrySub.size)] : []),
        ...(entry.link
          ? [{ text: entry.link.text, font: writer.regular, size: TYPE.entrySub.size, color: ACCENT, href: entry.link.href }]
          : []),
      ],
      TYPE.entrySub.leading,
    )
  }

  if (entry.summary) {
    writer.gap(3)
    writer.paragraph(entry.summary)
  }

  if (entry.bullets?.length) writer.gap(2)
  for (const bullet of entry.bullets ?? []) writer.bullet(bullet)

  writer.gap(9)
}

export async function renderResumePdf(language: string): Promise<Uint8Array> {
  const resume: Resume = buildResume(language)
  const doc = await PDFDocument.create()
  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const writer = new Writer(doc, regular, bold)

  doc.setTitle(sanitize(resume.title))
  doc.setAuthor(sanitize(resume.name))
  doc.setSubject(sanitize(resume.subject))
  doc.setKeywords(resume.keywords.map(sanitize))
  doc.setCreator(sanitize(resume.name))
  doc.setProducer("smansfeldg.github.io")
  doc.setLanguage(language)
  doc.setCreationDate(new Date())
  doc.setModificationDate(new Date())

  writer.paragraph(resume.name, {
    font: bold,
    size: TYPE.name.size,
    leading: TYPE.name.leading,
    color: INK,
  })
  writer.paragraph(resume.headline, {
    size: TYPE.headline.size,
    leading: TYPE.headline.leading,
    color: ACCENT,
  })
  writer.gap(2)
  writer.runs(
    resume.contacts.flatMap((contact, index) => [
      ...(index > 0 ? [separator(regular, TYPE.contact.size)] : []),
      {
        text: contact.text,
        font: regular,
        size: TYPE.contact.size,
        color: INK_SOFT,
        href: contact.href,
      },
    ]),
    TYPE.contact.leading,
  )
  writer.rule(ACCENT, 1, 8)

  for (const section of resume.sections) {
    writer.gap(6)
    // Un encabezado sin nada debajo es ruido: se pide sitio para las dos cosas.
    writer.ensure(TYPE.heading.leading + TYPE.body.leading * 2)
    writer.paragraph(section.heading.toUpperCase(), {
      font: bold,
      size: TYPE.heading.size,
      leading: TYPE.heading.leading,
      color: INK,
    })
    writer.rule()
    writer.gap(2)

    if (section.kind === "paragraph") {
      writer.paragraph(section.body)
      continue
    }

    if (section.kind === "entries") {
      for (const entry of section.entries) drawEntry(writer, entry)
      continue
    }

    for (const item of section.items) {
      writer.runs(
        [
          { text: `${item.term}: `, font: bold, size: TYPE.body.size, color: INK },
          { text: item.value, font: regular, size: TYPE.body.size, color: INK_SOFT },
        ],
        TYPE.body.leading,
      )
    }
  }

  writer.finish(resume.pageLabel)
  return doc.save()
}
