/**
 * Modelo del CV.
 *
 * Convierte las MISMAS fuentes que alimentan la página (`content.json` para lo
 * estructural, `src/i18n/<code>.json` para el texto) en un documento lineal,
 * plano y sin estilos. Nada acá sabe qué es un PDF: eso es `pdf.ts`.
 *
 * La separación importa por dos motivos:
 *   1. El cliente necesita el nombre y la URL del archivo, pero no el
 *      renderizador — importar `pdf.ts` metería pdf-lib en el bundle del
 *      browser. Este archivo no tiene dependencias.
 *   2. Al no haber una segunda copia del contenido, el CV no puede quedar
 *      desactualizado: editar `content.json` o un diccionario cambia la página
 *      y el PDF en el mismo commit.
 */
import content from "@/data/content.json"
import { getTranslations } from "@/i18n"

/** Un dato de contacto de la cabecera. `href` sólo si es accionable. */
export type ResumeContact = {
  text: string
  href?: string
}

/**
 * Una entrada cronológica: empleo, título o proyecto. `meta` va alineado a la
 * derecha del título (el período), el resto fluye a la izquierda.
 */
export type ResumeEntry = {
  title: string
  meta?: string
  subtitle?: string
  /** Se dibuja a continuación del subtítulo, como enlace. */
  link?: { text: string; href: string }
  summary?: string
  bullets?: string[]
}

/**
 * Tres formas de sección, que es todo lo que un CV necesita. Cualquier cosa
 * más rica (dos columnas, barras de nivel, iconos) es exactamente lo que los
 * ATS no saben leer.
 */
export type ResumeSection =
  | { kind: "paragraph"; heading: string; body: string }
  | { kind: "entries"; heading: string; entries: ResumeEntry[] }
  | { kind: "definitions"; heading: string; items: Array<{ term: string; value: string }> }

export type Resume = {
  language: string
  name: string
  headline: string
  contacts: ResumeContact[]
  sections: ResumeSection[]
  /** Metadatos del documento; varios ATS los indexan junto con el texto. */
  title: string
  subject: string
  keywords: string[]
  fileName: string
  /** Plantilla del pie de página, con {current} y {total}. */
  pageLabel: string
}

/**
 * `content.json` tipa los `id` como `string`, pero los diccionarios tienen una
 * clave por entrada conocida. El acceso dinámico se hace por acá, en un solo
 * lugar y devolviendo `undefined` explícito, en vez de repartir casts.
 */
const lookup = <T>(record: Record<string, T>, id: string): T | undefined =>
  Object.prototype.hasOwnProperty.call(record, id) ? record[id] : undefined

const monthYear = (iso: string, language: string): string => {
  const label = new Intl.DateTimeFormat(language, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`))

  return label.charAt(0).toLocaleUpperCase(language) + label.slice(1)
}

const period = (
  startDate: string,
  endDate: string | null,
  present: string,
  language: string,
): string => `${monthYear(startDate, language)} - ${endDate ? monthYear(endDate, language) : present}`

/** Más reciente primero: es el orden que espera cualquiera que lea un CV. */
const byStartDateDesc = <T extends { startDate: string }>(a: T, b: T) =>
  b.startDate.localeCompare(a.startDate)

const skillNamesById = new Map(content.skills.map((skill) => [skill.id, skill.name]))

/** "https://www.dealshop.com.ar/" → "dealshop.com.ar". */
const bareUrl = (url: string): string =>
  url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "")

const asLink = (url: string) => (url ? { text: bareUrl(url), href: url } : undefined)

/** Agrupa por categoría preservando el orden de aparición, como Skills.astro. */
const groupSkillsByCategory = (): Array<{ category: string; names: string[] }> =>
  content.skills.reduce<Array<{ category: string; names: string[] }>>((groups, skill) => {
    const group = groups.find((item) => item.category === skill.category)

    if (group) group.names.push(skill.name)
    else groups.push({ category: skill.category, names: [skill.name] })

    return groups
  }, [])

const slug = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

export const resumeFileName = (language: string): string =>
  `${slug(content.profile.name)}-CV-${language.toUpperCase()}.pdf`

/**
 * Ruta pública del PDF de un idioma. Existe una por idioma porque el build
 * emite un archivo por diccionario (ver `src/pages/cv-[lang].pdf.ts`).
 *
 * `base` es `import.meta.env.BASE_URL`, que el workflow puede cambiar: en
 * GitHub Pages de proyecto el sitio no cuelga de la raíz.
 */
export const resumeUrl = (language: string, base = "/"): string => {
  const path = `${base.endsWith("/") ? base : `${base}/`}cv-${language}.pdf`

  // `trailingSlash: "always"` alcanza también a los endpoints, así que el
  // servidor de desarrollo sólo responde en `/cv-es.pdf/`. El build, en
  // cambio, escribe el archivo con su nombre literal y es el que sirve
  // GitHub Pages. Sin esta rama, funciona en uno y da 404 en el otro.
  return import.meta.env.DEV ? `${path}/` : path
}

export function buildResume(language: string): Resume {
  const text = getTranslations(language)
  const { profile, profiles, work, education, certificates, projects, knowsAbout } = content

  const jobs: Record<string, (typeof text)["experience"]["jobs"]["cvc"]> =
    text.experience.jobs
  const schools: Record<string, (typeof text)["education"]["schools"]["unlam"]> =
    text.education.schools
  const projectTexts: Record<string, (typeof text)["projects"]["items"]["easysync"]> =
    text.projects.items

  const contacts: ResumeContact[] = [
    { text: text.hero.location },
    ...(profile.phoneDisplay || profile.phone
      ? [
          {
            text: profile.phoneDisplay || profile.phone,
            href: `tel:${profile.phone.replace(/[^+0-9]/g, "")}`,
          },
        ]
      : []),
    { text: profile.email, href: `mailto:${profile.email}` },
    { text: bareUrl(profile.url), href: profile.url },
    ...profiles.map(({ network, url }) => ({ text: `${network}: ${bareUrl(url)}`, href: url })),
  ]

  const experience: ResumeEntry[] = [...work].sort(byStartDateDesc).map((job) => {
    const job_ = lookup(jobs, job.id)

    return {
      title: job_?.position ?? job.id,
      subtitle: job_?.name,
      meta: period(job.startDate, job.endDate, text.experience.present, language),
      link: asLink(job.url),
      summary: job_?.summary,
      bullets: job_?.highlights ? [...job_.highlights] : undefined,
    }
  })

  const studies: ResumeEntry[] = [...education].sort(byStartDateDesc).map((school) => {
    const school_ = lookup(schools, school.id)

    return {
      title: school_?.area ?? school.id,
      subtitle: school_?.institution,
      meta: period(school.startDate, school.endDate, text.education.present, language),
      link: asLink(school.url),
      summary: school_?.studyType,
    }
  })

  const portfolio: ResumeEntry[] = projects.map((project) => {
    const project_ = lookup(projectTexts, project.id)
    const stack = project.stack
      .map((id) => skillNamesById.get(id) ?? id)
      .join(", ")

    return {
      title: project_?.name ?? project.id,
      link: asLink(project.url),
      summary: project_?.description,
      subtitle: stack ? `${text.resume.labels.stack}: ${stack}` : undefined,
    }
  })

  const sections: ResumeSection[] = [
    { kind: "paragraph", heading: text.resume.sections.summary, body: text.about.summary },
    { kind: "entries", heading: text.resume.sections.experience, entries: experience },
    {
      kind: "definitions",
      heading: text.resume.sections.skills,
      items: groupSkillsByCategory().map(({ category, names }) => ({
        term: lookup(text.skills.categories, category) ?? category,
        value: names.join(", "),
      })),
    },
    { kind: "entries", heading: text.resume.sections.projects, entries: portfolio },
    { kind: "entries", heading: text.resume.sections.education, entries: studies },
    {
      kind: "definitions",
      heading: text.resume.sections.certifications,
      items: certificates.map((certificate) => ({
        term: certificate.name,
        value: `${certificate.issuer}, ${certificate.year}`,
      })),
    },
    {
      kind: "definitions",
      heading: text.resume.sections.languages,
      items: text.languages.map((entry) => ({ term: entry.language, value: entry.fluency })),
    },
  ]

  return {
    language,
    name: profile.name,
    headline: text.hero.label,
    contacts,
    // Una sección vacía es una sección que el lector tiene que descartar.
    sections: sections.filter((section) =>
      section.kind === "paragraph"
        ? section.body.length > 0
        : section.kind === "entries"
          ? section.entries.length > 0
          : section.items.length > 0,
    ),
    title: `${profile.name} - ${text.hero.label}`,
    subject: text.about.summary,
    keywords: [...new Set([...knowsAbout, ...content.skills.map((skill) => skill.name)])],
    fileName: resumeFileName(language),
    pageLabel: text.resume.labels.page,
  }
}
