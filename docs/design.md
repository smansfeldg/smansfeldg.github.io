# Website design system

This is the single source of truth for the website's visual language. Read and follow it before changing UI, UX, styling, layout, responsive behavior, components, or animations. It documents the existing implementation; it does not authorize a redesign.

The baseline is the frontend source: the page and layout, every visible section, shared controls, client interactions, SVGs, and the imported `hotkeypad` styles. Values below describe the implementation, not a newly imposed token system. When an explicitly requested design change alters a rule, update this document alongside the implementation. Preserve component-specific exceptions unless that change calls for revisiting them.

## Identity and principles

The site is a compact professional CV presented like a technical system interface. Its personality comes from terminal prompts, labeled modules, numbered records, capability groups, online indicators, fine borders, and carefully limited geometric details. It should feel clean, modern, deliberate, and oriented toward engineering work.

- Keep the CV content dominant. Decorative effects support the page rather than becoming its subject.
- Use compact, structured panels with clear header/body/metadata relationships. Do not turn every piece of text into a separate card.
- Establish hierarchy through font roles, restrained color, alignment, and spacing. Large display type is reserved for the person's name.
- Keep purple as the recurring interface accent and green as a meaningful active/available status. Most content remains neutral.
- Keep surfaces mostly flat and rectangular. Thin dividers and occasional clipped corners provide structure without heavy elevation.
- Preserve both light and dark presentations. Light mode retains the same technical character, geometry, density, and hierarchy.
- Use actual data for counts, ordering, categories, and status. Do not introduce fictional telemetry or decorative metrics to make the page look more technical.
- Extend the closest existing pattern before introducing a new visual treatment.

The current system vocabulary includes `$ whoami`, `SYSTEM.INFO`, `CAPABILITIES`, module counts, and `ACCESS`. These are short contextual cues, not a reason to add terminal framing to every sentence. Body copy stays readable professional prose. Translations retain the same visual relationships.

## Source map

| Source | Design responsibility |
| --- | --- |
| [Layout.astro](../src/layouts/Layout.astro) | Theme and font variables, global defaults, background layers, print helpers, theme initialization |
| [index.astro](../src/pages/index.astro) | Section order and page padding |
| [Section.astro](../src/components/Section.astro) | Shared content width, section spacing, heading label and divider lines |
| [Hero.astro](../src/components/sections/Hero.astro) | Terminal header, identity, portrait, availability, contact actions |
| [About.astro](../src/components/sections/About.astro) | Labeled information panel and key/value metadata |
| [Experience.astro](../src/components/sections/Experience.astro) | Numbered record cards, title/role/date hierarchy |
| [Education.astro](../src/components/sections/Education.astro) | Education records and certification rows |
| [Projects.astro](../src/components/sections/Projects.astro) | Two-column project grid, status strip, stack tags, access links |
| [Skills.astro](../src/components/sections/Skills.astro) | Capability panel, category labels, wrapping skill chips and tooltips |
| [KeyboardManager.astro](../src/components/KeyboardManager.astro) | Desktop command footer, mobile trigger, command palette and library theme overrides |
| [LanguageSelector.astro](../src/components/LanguageSelector.astro) | Desktop language control and native select states |
| [BackToTop.astro](../src/components/BackToTop.astro) | End-of-page visibility, floating action and motion |
| [ScrollRuler.astro](../src/components/ScrollRuler.astro) | Reading-progress scale that replaces the native scrollbar: section marks, readout, pointer drag |
| [GlitchFX.astro](../src/components/GlitchFX.astro), [glitch.ts](../src/lib/glitch.ts) | Intro/transition distortion and mutation fallback |
| [src/icons](../src/icons), [content.json](../src/data/content.json) | Custom interface SVGs and technology icon references |
| [T.astro](../src/components/T.astro), [src/i18n](../src/i18n) | Translation-aware text, attributes, and language switching |

## Colors and themes

Use the CSS custom properties in `Layout.astro`. The literals in these tables are reference values, not colors to copy into new component CSS. `.dark` on `<html>` selects dark mode; `:root:not(.dark)` supplies light overrides. Theme preference comes from `localStorage.theme`, then the system color scheme, and is applied before paint. Theme switching is currently a command-palette action.

| Token | Dark | Light | Role |
| --- | --- | --- | --- |
| `--bg-primary` | `#050505` | `#F5F3F7` | Page canvas |
| `--bg-secondary` | `#0A0A0F` | `#EDE8F5` | Panel headers, metadata badges, chips, footer |
| `--bg-panel` | `#0D0D14` | `#FFFFFF` | Main content panels and cards |
| `--bg-panel-hover` | `#111118` | `#F8F6FC` | Subtle hover surface for record/project cards |
| `--text-primary` | `#E8E6F0` | `#1A1525` | Name, titles, primary information |
| `--text-secondary` | `#9890A8` | `#5A5470` | Body copy, chip text, supporting information |
| `--text-muted` | `#807A96` | `#6F6884` | Dates, indices, keys, counts, quiet controls |
| `--border-color` | `rgba(120, 80, 180, 0.12)` | `rgba(120, 80, 180, 0.15)` | Default borders and dividers |
| `--border-hover` | `rgba(140, 100, 200, 0.25)` | `rgba(120, 80, 180, 0.3)` | Hover emphasis |
| `--accent-purple-dim` | `rgba(139, 92, 246, 0.15)` | `rgba(139, 92, 246, 0.08)` | Accent-tinted labels, overlays and hover fills |
| `--accent-purple-text` | `#A78BFA` | `#6D28D9` | Purple text: roles, panel labels, section headings, highlighted links |
| `--accent-green-text` | `#4ADE80` | `#15803D` | Active/available/current status text |

The following decorative accents are shared across themes:

| Token | Value | Usage |
| --- | --- | --- |
| `--accent-purple` | `#8B5CF6` | Corner marks, cursor, diamond indicator, focus outlines, fine highlight lines |
| `--accent-green` | `rgba(80, 200, 120, 0.6)` | Status dots and their small glow |
| `--accent-magenta` | `rgba(180, 100, 220, 0.6)` | Defined decorative token; not used by current component styles |
| `--accent-cyan` | `rgba(80, 200, 220, 0.5)` | Defined decorative token; not used by current component styles |
| `--accent-orange` | `rgba(240, 160, 80, 0.5)` | Defined decorative token; not used by current component styles |

Use the `*-text` accents for colored copy. The decorative purple/green values are calibrated for marks and glows, not body text; the text variants are specifically chosen for contrast in each theme. Do not use opacity to make essential copy resemble a faint border. Status must remain understandable through its label as well as its color.

The existing background and glitch effects have some local RGBA values. Certification rows also have a local `rgba(120, 80, 180, 0.07)` divider and `rgba(139, 92, 246, 0.04)` hover sheen. These are narrow implementation exceptions, not an alternate palette to extend. New theme-dependent UI colors belong in the existing variable flow.

## Typography and hierarchy

Fonts are self-hosted through `@fontsource-variable` imports in `Layout.astro`:

| Token | Family and fallback | Role |
| --- | --- | --- |
| `--font-heading` | Space Grotesk Variable / Space Grotesk / system-ui / sans-serif | Person's name and content titles |
| `--font-body` | Inter Variable / Inter / system-ui / sans-serif | Descriptions and professional prose |
| `--font-mono` | JetBrains Mono Variable / JetBrains Mono / Fira Code / monospace | Roles, commands, metadata, labels, dates, skill names, controls |

The root size is **14px**, not 16px. Preserve this when interpreting `rem` values. Global line-height is `1.6`; headings default to weight `500` and line-height `1.3`; paragraphs default to `1.7`. Component rules refine these defaults.

| Element | Existing sizing and treatment |
| --- | --- |
| Hero name | Heading font, `2rem` (28px), weight `600`, line-height `1.1`, tracking `-0.02em`; mobile `1.6rem` (22.4px) |
| Hero role | Mono, `0.85rem`, weight `400`, tracking `0.02em`, purple text; mobile `0.8rem` |
| Location | Mono, `0.75rem`, muted |
| Section label (`h2`) | Mono, 11px, weight `500`, uppercase, tracking `0.15em`; mobile 10px |
| Panel labels | Mono, 10px, weight `600`, tracking `0.15em`, purple text |
| Company/project title | Heading font, `1rem`, weight `500`, primary text |
| Education title | Heading font, `0.95rem`, weight `500` |
| Record role / study area | Mono, `0.8rem`, purple text; experience role weight `400` |
| About paragraph | Body font, `0.9rem`, line-height `1.7`; mobile `0.85rem` |
| Experience summary | Body font, `0.85rem`, line-height `1.6` |
| Project description | Body font, `0.8rem`, line-height `1.6` |
| Certification name | Heading font, `0.83rem`, weight `600` |
| Date badges, metadata, contact labels, skills | Mono, generally 11px; project stack labels 10px |
| Counts, status strips, availability, skill tooltip | Mono, 9px; other small labels/actions generally 10px |

Maintain the reading hierarchy: identity first; small section markers organize the page; primary item titles lead each record; purple roles and muted periods support them; descriptions explain; small system labels annotate. Section labels are deliberately smaller than content titles despite their heading semantics.

Use uppercase and wide tracking for short markers, not for paragraphs or every title. Category labels use `0.12em`; metadata/control tracking typically ranges from `0.03em` to `0.08em`. Do not introduce a fourth font, oversized marketing headlines, heavy weights throughout, or large gradient text.

## Page layout and spacing

The single page reads in this order: **Hero → About → Experience → Education (including certifications) → Projects → Skills**. There is no top navigation bar, sidebar, tabbed content area, or separate section-navigation menu. The scroll ruler on the right edge replaces the scrollbar and reports reading position; it is a scrollbar, not section navigation.

Use `Section.astro` for top-level content. Its centered `max-width: 900px` includes the horizontal padding because the global box model is `border-box`; at maximum desktop width the inner content is 852px. Do not add an independently wider section or duplicate its horizontal gutters inside a new wrapper.

| Rule | Desktop | At width ≤ 768px |
| --- | --- | --- |
| Main padding (top / bottom) | 48px / 80px | 32px / 64px |
| Section horizontal padding | 24px | 16px |
| Section bottom margin | 56px | 40px |
| Section header gap | 16px | 12px |
| Section header bottom margin | 24px | 20px |
| Hero body padding | 24px | 16px |
| Hero main gap | 24px | 24px |
| Experience card padding | `16px 16px 16px 56px` | `14px 14px 14px 48px` |
| Project grid | Two equal columns; 16px gap | One column; 16px gap |
| Skill group wrapper | 16px padding / gap | 12px padding / 14px gap |

There is no formal spacing-token scale. Repeated working values are 4/6px for small internal details, 8px for icon/text and chip gaps, 12px for record-list gaps and compact bodies, 16px for panel padding and grid gaps, 20/24px for larger internal separation, and 40/56px between sections. Match the nearest component rather than normalizing all existing exceptions.

Panel headers commonly use `10px 16px` padding (About, Skills). Hero terminal chrome uses `12px 16px`. Project status strips use `8px 12px`; project bodies `16px 12px`; project footers 12px. Certification header padding is `8px 14px`, with rows `14px 20px` and a 14px gap.

Use wrapping flex rows for contact links and tags, and vertical stacks for records. Project cards use flex columns with a growing body to keep their footers aligned. Date badges stay together with `white-space: nowrap`; mobile layout moves them below titles instead of shrinking them into unreadability. Avoid fixed heights for content cards.

## Surfaces, borders, geometry, and background

- Default content surface: `background: var(--bg-panel)` plus `1px solid var(--border-color)`.
- Nested header strips, chips and date badges use `--bg-secondary`; header/footer separators use the same 1px border token.
- About, Hero, Skills and the certifications wrapper strengthen only their border on hover. Experience/Education records also use `--bg-panel-hover`. Projects add a limited glow and highlight line.
- Most panels, cards, tags and date badges have square corners. `--radius-sm: 2px` and `--radius-md: 4px` exist, but are not a rule to round all containers. Desktop footer keycaps explicitly use 2px.
- Circular geometry is reserved for status dots and icon internals; status dots are 6px. About uses a 6px purple diamond. Hero corner brackets are 16px long, 1px thick, at opacity `0.4`.

Clipped corners are selective signatures:

| Pattern | Geometry |
| --- | --- |
| Section label and back-to-top | `polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)` |
| Hero contact actions | Same opposing-corner treatment with 6px cuts |
| Portrait frame | Top-right and bottom-left 12px cuts; see `.image-frame` in Hero |

Do not apply clipped corners to every card or add elaborate circuit borders. Content panels remain simple rectangles around these accents.

`--glow-border` is `0 0 8px rgba(139, 92, 246, 0.08)` in dark mode and alpha `0.03` in light mode. Projects use it on hover; back-to-top uses it at rest. `--glow-purple` defines a 20px glow at alpha `0.1` / `0.05`, but current component styles do not consume it. Status dots use `0 0 6px var(--accent-green)`. These faint glows are not a general card-elevation system.

The fixed background stack in Layout sits at `z-index: 0`, ignores pointer input, and contains:

- A 60px grid of 1px token-colored lines at opacity `0.4`.
- Very low-alpha purple (`0.04`) and cyan (`0.03`) radial fog.
- An upper-right purple radial light at alpha `0.06`, blurred by 40px.
- A repeating 256px noise texture at opacity `0.015`.

Content sits in `.app-layout` at `z-index: 1`. Keep the texture behind content; avoid adding noise, blur, glass, or bright gradients to every panel. The existing opaque panels provide stable text surfaces.

## Component patterns

### Section heading

Use `<Section id="..." titleKey="...">`. The heading is a small tinted, bordered, clipped mono label between two flexible 1px gradient lines (`transparent → border color → transparent`). Hero uses the same section container without a section title. Do not replace these markers with large headings or decorative full-width banners.

### Hero and contact actions

Keep the identity inside a bordered panel with `$ whoami` terminal chrome. Desktop aligns identity left and portrait right. The portrait frame is 112px square, uses `object-fit: cover`, and receives a quiet purple overlay. The image is emitted as 224px WebP; this asset size is not its CSS display size. At rest its filter is `grayscale(20%) contrast(1.05)`; panel hover restores `grayscale(0%) contrast(1)`.

Availability is a small rectangular badge below the portrait, with a green dot and labeled status. The contact group sits below a thin divider, with 8px wrapping gaps. Each contact action is an actual link with a 14px icon, mono 11px label, `8px 12px` padding, secondary fill, 1px border and 6px clipped corners. Hover adds purple tint, a stronger border and primary text. Keep recognizable text beside these icons; do not replace the group with a large promotional CTA.

### Information and capability panels

About and Skills share a compact header/body pattern: secondary header fill, purple mono label, right-side indicator/count, border separator, panel-colored body. About metadata is a key/value stack with 8px row gaps; keys have an 80px minimum width and values use secondary text, with green for active status. Use this pattern for similar factual metadata rather than adding charts or dashboard widgets.

Skills groups retain data order and group by category. Category headings are muted uppercase mono 10px labels. Skill chips wrap with 8px gaps and grow to fill each line (`flex-grow: 1`); they are not a rigid tile grid. Each chip has a 14px technology icon, 11px mono name, `4px 8px` padding and a 1px border. Hover adds a purple tint and reveals the translated level tooltip above the chip. The tooltip uses 9px mono text, a secondary surface, 1px border, `3px 6px` padding, and a 2px-to-0 vertical fade/translation. It is supplemental information, not an action.

### Experience and education records

Use a vertical list with 12px gaps, flat panels, and small internal padding. Experience reserves a left gutter for a muted two-digit index (`01`, `02`, …); it is not a drawn timeline. The header pairs company/title information with a compact date badge. The job role is mono purple; summary prose remains secondary. Only linked company text is an action; the surrounding card is not clickable.

Education omits the index and summary pattern: institution heading, purple mono area/study type, and the same date badge vocabulary. Date badges use mono 11px text, `4px 8px` padding, secondary fill and a 1px border. The current experience period is green; education's present label does not have the same explicit green rule.

### Certifications

Certification entries are full linked rows inside one labeled bordered block. Keep the issuer logo contained within its 54px square wrapper, supporting name/issuer text, and a compact year badge (`2px 7px`, mono 10px) at the right. Desktop names truncate with ellipsis; at the mobile breakpoint they wrap. The external arrow begins visible with a `translate(-3px, 3px)` offset and moves to zero on hover. Hover also tints the row, turns the name/arrow purple and fades in a faint static horizontal sheen. It is not an animated traveling sweep.

### Projects

Each project card has three clear parts: a small status strip, a growing description body, and a divided footer with wrapping stack tags plus an `ACCESS` link. Active status uses a green dot and text; inactive status uses muted colors. Stack tags use `4px 8px` padding, 14px technology icons, and 10px mono names.

Card hover changes border/fill, adds `--glow-border`, fades in a 1px purple gradient at the top (opacity `0.6`), turns the title purple, and reveals the title's 12px external-link icon. The separate access link turns purple on hover. The card itself remains an article with links, not a full-card button. Its accessible action name includes the visible action label and the project name.

## Commands, buttons, links, and navigation

The site uses ordinary scrolling to read sections, contact/project links for destinations, and the command palette for utilities. The palette provides CV download, theme toggle, other available languages, and social profiles. Do not add a navbar or sidebar as a routine extension of this system.

- Desktop: a fixed full-width secondary-surface footer has a thin top border and a quiet mono 11px prompt. The clickable prompt starts with a purple `>` and contains 10px bordered keycaps (`1px 5px` padding, 2px radius). It opens the palette, as does Cmd/Ctrl+K.
- Desktop language selector: a small globe and native `<select>` sit at right 16px / bottom 5px, mono 11px, with transparent fill and no outer border. Options explicitly use panel/primary colors so they remain legible. Hover or focus-within strengthens its text.
- Mobile: the command footer and separate language selector disappear. A square 44px palette trigger sits at left 12px / bottom 12px; language switching remains in the palette.
- Back-to-top: a labeled, clipped button, not a circular icon bubble. Its appearance and visibility are described below.

For new actions, use native buttons for in-page behavior and anchors for navigation. Match the existing compact mono labels, borders and restrained tint states; a filled purple primary/secondary button hierarchy is not currently established. Noninteractive chips and records must not acquire button semantics merely because their hover treatment changes.

### Command-palette exception

`KeyboardManager.astro` imports `hotkeypad/reset.css` and `hotkeypad/index.css`. The installed dependency's source styles are in `node_modules/hotkeypad/src/styles/`; the committed dependency/lockfile determines them. Project overrides map its surface, muted text, hover fill and borders to Layout tokens via `html #hotkeypad`.

The library retains a centered container at 90% width / 640px maximum, `0.5rem` radius, and a `drop-shadow(0 35px 35px rgb(0 0 0 / 0.3))`. It has a search field, grouped command rows, shortcut chips, and keyboard hints; keyboard/hover selection uses a tinted row and a 2px left indicator. Open/close fades use 200ms. Its footer changes justification at 648px. These are existing library exceptions, not defaults for ordinary cards. The root uses the mono token, but library shortcut fonts and global heading rules still affect descendants.

The backdrop variable is `rgba(5, 5, 5, 0.7)`, but the imported backdrop element has `opacity: 0`; do not infer visible dimming from the token alone. Palette backdrop/container z-indices are 10/20 within the page's stacking context. Inspect actual stacking when changing an overlay rather than assuming it covers all fixed controls.

Keep commands data-driven and translated. The dependency handles search, arrow-key navigation, Enter activation, Escape dismissal and backdrop click. It resolves command shortcuts by Ctrl/Cmd plus the final letter, regardless of displayed Alt/Shift modifiers; command letters must remain unique. Preserve the existing allocation and deduplication logic when extending commands.

## Interactive states and accessibility

| Pattern | Existing feedback |
| --- | --- |
| Information panel hover | Stronger border, no lift or scale |
| Experience/education hover | Stronger border and slightly changed panel fill |
| Contact hover | Purple-dim fill, stronger border, primary text |
| Linked company / access link hover | Purple text |
| Project hover | Subtle fill/border/glow plus title/icon/top-line changes |
| Skill/stack hover | Purple-dim fill; skills additionally show level tooltip |
| Certification hover | Purple tint/name/arrow, tiny arrow translation, faint sheen |
| Language focus | Text strengthens; 1px purple outline with 2px offset on select |
| Desktop footer focus | Text/keycaps strengthen; 1px purple outline with -2px offset |
| Back-to-top hover/focus | Purple tint/text, stronger border; focus outline at 2px offset |
| Back-to-top press | `translateY(1px) scale(0.98)` unless reduced motion |
| Scroll ruler hover / drag (fine pointer) | `grab`/`grabbing` cursor, purple percentage, narrow-mode tag shown |

There is no site-wide focus, disabled, loading, selected-tab, form-error or validation-message styling system. Do not document nonexistent states as established patterns. For a newly requested control, derive its states from the closest control and explicitly support keyboard focus; the back-to-top and language selector are useful outline references.

The imported reset is global and removes many browser defaults. Do not rely on browser-provided borders, spacing, button appearance, or focus outlines. Current contact/company/project hover rules do not all have matching custom focus rules. The mobile palette trigger is currently a click-bound `<div>`, and skill tooltips are hover-only on nonfocusable `<div>` elements. These are implementation limitations, not patterns to copy for new interactive controls.

Retain meaningful labels, translated `title`/`aria-label` attributes, heading semantics, and status text. Decorative overlays and icons should not intercept input; mark purely decorative new SVGs as `aria-hidden`. Essential information and actions must be available without hover. Do not remove focus indicators or make tiny visual icon dimensions dictate the whole touch target.

## Responsive behavior

The principal breakpoint is **width ≤ 768px**, with the command footer's desktop branch starting at 769px. The palette library has its own 648px footer rule. There is no separate tablet or large-desktop layout system.

- Hero becomes `column-reverse`: portrait first visually, identity below, centered text/contact rows. Portrait display size becomes 96px square. Identity font sizes and body padding decrease as listed above.
- Experience and education headers become vertical with 8px gaps; periods align at the start below the title. Experience keeps a narrower index gutter.
- Projects become a single column; their status/body/footer structure is preserved.
- Certification names wrap instead of truncating. Rows remain rows with their logo and year; they do not become a new card layout.
- Skills keep wrapping rows, with chip padding increased to `6px 10px`; the group container gets smaller padding. Do not shrink all controls proportionally just because prose gets smaller.
- Main/section whitespace decreases while the same content order and hierarchy remain.
- Desktop fixed command/language UI gives way to the bottom-left palette trigger and, when visible, a bottom-right back-to-top button. Both mobile controls retain a 44px height.
- The scroll ruler is present at every size, since it replaces the native scrollbar. From 1200px wide it sits 24px from the edge with long ticks and a permanent readout. Below that it hugs the edge (right 4px) with short ticks so it stays inside the 16px mobile gutter, and its readout becomes a tag shown only while scrolling, dragging or hovering. Touch devices get the indicator without drag.

New UI must fit the shared gutters and allow longer translated labels and narrow viewports without horizontal overflow. Prefer wrapping or stacking over new breakpoints. Keep enough space below content for fixed controls; preserve the main bottom padding. The body's `overflow-x: hidden` is not permission to hide a broken layout.

## Scroll UI and stacking

The root declares `scroll-behavior: smooth`. Sections are fully present in normal document flow: there are no scroll-triggered reveal animations, sticky section headers, parallax content, or scroll snapping. [scroll.ts](../src/analytics/scroll.ts) observes depth and section visibility for analytics; it does not style or reveal content. The only scroll-driven UI is the ruler below, which measures position without changing the content. The native scrollbar is hidden in its favor.

### Scroll ruler

`ScrollRuler.astro` replaces the native scrollbar with a vertical measuring scale fixed on the right edge, vertically centered. It is a scaled map of the document: 50 intervals of 2% along a 1px baseline on the outer side, with ticks pointing inward toward the content. Ticks every 10% are longer, so 0% and 100% fall on long ticks. The interval is a whole pixel (8px from 1000px of viewport height, 6px by default, then 5/4/3px below 720/480/360px) to keep every 1px line crisp.

| Mode | Placement | Minor / 10% / section tick / cursor line | Readout |
| --- | --- | --- | --- |
| Width ≥ 1200px | right 24px | 4 / 8 / 12 / 16px | Permanent, two lines, no surface |
| Narrower | right 4px | 3 / 5 / 8 / 10px | Tag shown while scrolling, dragging or hovering |

The native scrollbar is hidden by a deliberate global rule in the component (`scrollbar-width: none` plus `::-webkit-scrollbar` on `html`/`body`). It is gated on `@media (scripting: enabled)`, so it applies before first paint, causes no layout shift, and leaves the native bar in place without JavaScript. Browsers without that media feature show both, which is acceptable degradation.

- Section marks are the longest ticks, placed at each section's `top / scrollHeight`, so the gaps between them are proportional to the real length of each section. The first section has no mark: it coincides with the zero. Sections are discovered from `main section[id]`, and their names come from the `data-title-key` that `Section.astro` emits. The untitled hero is named `whoami` after its terminal prompt.
- The cursor is the About diamond (7px, odd so it centers on 1px) on the baseline plus an `--accent-purple` line. Progress is `scrollY / (scrollHeight − innerHeight)`, snapped to device pixels.
- The traversed part of the scale repeats the ticks in `--accent-purple` at opacity `0.5`, clipped to the cursor. Unvisited ticks use `--border-hover` and unvisited section marks use `--text-muted`; marks turn purple once passed. The active section is the last mark the cursor has reached, so the label changes on the same pixel where the cursor crosses the mark.
- The readout sits 6px inside the cursor line, aligned to the right: the percentage in mono 10px weight 500 with tabular figures, and the active section in mono 9px, uppercase, `0.15em` tracking, muted, truncated at 104px. The percentage is `--text-secondary` at rest and `--accent-purple-text` while scrolling, dragging or hovering; scrolling settles 900ms after the last scroll event. The narrow-mode tag follows the Skills tooltip: secondary surface, 1px border, `4px 8px` padding, a single row with an 8px gap, and a 2px horizontal fade/translation.
- With a fine pointer (`any-pointer: fine`, i.e. mouse, pen or trackpad) it behaves like a scrollbar. A hit zone 8px wider on each side and 10px past each end shows a `grab` cursor. Pressing within 8px of the cursor grabs it where it is; pressing elsewhere on the scale jumps there first, then drags. Scrolling uses `behavior: "instant"`, because `auto` would inherit the root's smooth scrolling and lag behind the pointer. Clicks emit `scroll_ruler` through `data-track`.
- Touch input never drags. On touch-only devices the hit zone does not exist, and on hybrids touch pointers are ignored, so the edge keeps the native scroll gesture and the system back gesture. This matches the passive mobile scroll indicator it replaces.
- It is `aria-hidden` and never receives focus, like the native scrollbar: keyboard scrolling is unchanged. It shares BackToTop's 100px scroll threshold and stays invisible below it. It is `.no-print`.

Do not turn the ruler into section navigation (no snapping to marks, no clickable labels), enable drag for touch, add more data to the readout, or add other instruments beside it. Its marks come from the real section layout; never place them at decorative intervals.

`BackToTop.astro` observes a 1px sentinel at the document end using `IntersectionObserver` with a 48px bottom root margin. The button appears near the end only when document height exceeds the viewport by more than 100px. It is not shown after an arbitrary scroll-distance threshold. Without IntersectionObserver it is shown as a fallback.

At rest it uses panel fill, a 1px border, faint border glow, mono 10px weight-600 label with `0.15em` tracking, a 14px upward arrow, 8px gap and `8px 14px` padding. Desktop placement is right 24px / bottom 52px. Mobile placement is right 12px / bottom 12px, minimum height 44px, `8px 12px` padding.

Hidden state combines opacity zero, `visibility: hidden`, disabled pointer events, and a 10px downward / `0.96` scale offset; it stays out of focus and hit testing. `.is-visible` restores those states. Preserve this functional relationship if visibility is extended.

Existing z-index values: background 0, app layout 1, hero corner marks 2 locally, scroll ruler 3 (above content and the hero corners so its narrow-mode tag can overlay the gutter edge, below the palette), back-to-top 49, command footer/mobile trigger 50, language switch 51, glitch stage/noise/flash 9998/9999/10000. Local stacking contexts matter; these numbers are not a global overlay guarantee. Do not increase z-indices arbitrarily or place new fixed UI over existing bottom controls.

## Motion and animation

Ordinary feedback uses `--transition-fast: 150ms ease`; panel changes use `--transition-normal: 250ms ease`. Prefer color, background, border, opacity, or small local translations. Existing cards do not bounce, tilt, or lift on hover. Do not add entrance choreography or animation to every item.

| Motion | Current behavior |
| --- | --- |
| Background fog | 20s ease-in-out, infinite alternate, from zero to `translate(-2%, 1%)` |
| Terminal cursor | 1s step-end blink, opacity 1 → 0 → 1 |
| Hero status dot | 2s ease-in-out pulse, opacity 1 → 0.5 → 1 |
| Active project dot | 2s ease-in-out pulse, opacity 1 → 0.4 → 1 |
| Back-to-top reveal | 420ms opacity/transform, `cubic-bezier(0.22, 1, 0.36, 1)`; delayed visibility removal when hiding |
| Back-to-top arrow | 2.8s ease-in-out loop after 420ms, maximum upward travel 2px |
| Scroll ruler | Cursor follows scroll and drag directly, without easing; active-section label fades in over 250ms ease-out; readout color 250ms; narrow-mode tag 150ms opacity plus 2px translation; passed-mark color 150ms; visibility 250ms opacity |
| Skill tooltip / cert arrow | Small local translation paired with fast feedback |

### Glitch signature

Glitch is a short event effect over the real visible content, not ambient decoration. Preserve its three automatic triggers: one intro burst 3 seconds after `load`, each theme toggle, and each user language switch routed through `withGlitch`. Intro duration defaults to 260–500ms; transition duration is 560ms with the mutation at `0.45` (about 252ms).

The effect uses short distortion phases separated by clean gaps, chromatic offsets, scan regions, blocks, noise and low-opacity flashes. Its saturated cyan/red/other tints belong to this temporary effect, not the resting interface palette. Overlays are fixed, ignore pointer events, and are hidden outside a burst. They remain direct body children so blend/backdrop behavior works. Only visible main children are distorted; quality adapts to rendering performance, and temporary transforms/filters are cleared afterward.

Do not add recurring glitch timers, attach distortion to every hover, lengthen effects into transitions that interrupt reading, or reuse glitch colors as normal component colors. Theme/language mutations must always complete: `withGlitch` applies them immediately if the effect is unavailable, disabled, already active, or the tab is hidden. A hidden-tab intro is deferred once; active effects stop when the tab hides or printing begins.

### Reduced motion: current boundary

Glitch checks `prefers-reduced-motion` in JS and hides its layers in CSS. Back-to-top removes its transform/arrow animation and uses a 120ms linear fade; its click handler requests `auto` rather than `smooth` scrolling. The scroll ruler drops its label fade, color transitions and tag translation (the tag keeps a 120ms linear fade); its cursor still tracks the scroll position, since that is direct feedback, not animation. There is no blanket reduced-motion override for background fog, cursor/status loops, the palette fade, other CSS transitions, or the global smooth-scroll declaration. Do not claim the whole site disables motion. New motion should provide its own reduced-motion alternative and must never be necessary for an action to work.

## Iconography and imagery

Use existing custom SVG components for interface/contact icons and `astro-icon`'s `<Icon name={...} />` for data-driven technology logos. Technology names/icons come from `content.json`; the build inlines SVGs from local Iconify packages configured in `astro.config.mjs`. Do not add a runtime icon CDN to extend this pattern.

- Interface SVGs typically use a 24×24 viewBox, `currentColor`, 1.5–2px strokes, and simple rounded line ends/joins. Filled social marks also use `currentColor`.
- Contact and technology icons display at 14px; location/external/action icons are about 10–12px, the language globe 13px, palette command icons 16px, and mobile command trigger icon 20px.
- Technology logos and certification artwork retain their brand colors where embedded in the source. They are small recognizability accents, not colors to promote into the site theme.
- Preserve aspect ratio: `object-fit: contain` for credentials, `cover` for the portrait. The portrait and credential badge are the main visible raster imagery; projects are text/status/stack cards without thumbnail banners.
- Not every SVG file in `src/icons` is used by the current page. Existing legacy technology SVGs do not supersede the data-driven icon approach used by Skills and Projects.

Avoid emoji as UI icons, oversized decorative icon medallions, mixed unrelated illustration styles, or turning the portrait into a circular avatar. The favicon's code-bracket motif and the page's terminal details reinforce the same engineering identity.

## Translation, print, and implementation boundaries

Keep language-neutral facts and stable IDs in `src/data/content.json`; put user-facing copy in every `src/i18n/<lang>.json`. Use `<T>` for text and `tAttr` for translated attributes, importing the public `@/i18n` API. Keep matching structure across languages: switching patches the same DOM rather than loading another page. Do not hardcode uppercase through JS where CSS can apply it, or force English-sized widths onto translated text.

Styles are scoped Astro component styles except for deliberate global rules in Layout, GlitchFX, the palette overrides and the scrollbar rule in ScrollRuler. Use `@/` for project imports. Content inserted through `set:html` does not receive Astro's scoped attributes; the footer's `.footer-text :global(kbd)` is the reference for styling such descendants. Do not broaden component styles globally to solve a local problem.

Browser printing hides `.no-print` UI and background effects, reveals `.print` content (including the hero contact text), and avoids breaks inside articles. Glitch stops before print. This is not a full separate monochrome print theme. The downloadable CV is rendered separately by [pdf.ts](../src/cv/pdf.ts) from the same data: an ATS-oriented single column with Helvetica, restrained purple accents, text contacts and simple rules. Do not transfer web panel/glitch geometry into that document or use its font as the website font.

Some definitions are inactive: Skills has `.skill-bar`/`.skill-fill` CSS without rendered bars; KeyboardManager defines `fadeIn` without applying it; radius and additional accent/glow tokens are not all consumed. These do not establish skill progress bars, entry animations, or a broader palette. The scroll ruler measures reading position and is not a precedent for decorative metrics. `public/en/index.html` is a legacy redirect, not a second designed page.

## Patterns to avoid

- Generic SaaS styling: large rounded cards, pill actions everywhere, strong floating shadows, pricing-style layouts, glass panels, or many competing bright accents.
- Template portfolio styling: oversized centered slogans, a full-screen marketing hero, project thumbnail mosaics, decorative skill percentages, or unrelated illustration sections.
- Exaggerated cyberpunk styling: persistent glitch, dense scanlines over body copy, neon text glow, multicolored borders, fictional telemetry, or complex angular frames around every block.
- A universal all-monospace page: prose uses the body font and item titles use the heading font.
- Random one-off spacing, new font families, hardcoded theme colors, or broad global CSS overriding unrelated components.
- Using green for arbitrary emphasis, decorative accent colors for essential text, or color alone to convey status.
- Making hover the only path to an action, removing visible focus, or treating inert tags/cards as buttons.
- Adding scroll reveals, sticky navigation, or new utility controls without an explicit feature need and checking existing fixed UI.
- Generic full-width reading-progress bars, restoring the native scrollbar next to the ruler, or a second scroll indicator.

## Rules for extending the UI

1. Read this document and the nearest source example before coding. Identify whether the requested element is a section, information panel, record, project, chip, link, or utility action.
2. Reuse Section's width/gutters and the matching panel/header/body pattern. Keep the page's established order unless the requested change requires a different one.
3. Choose color and font by role from Layout tokens; reuse local component spacing. Add a token only when the request needs a reusable role the existing tokens cannot express.
4. Keep details proportionate: short mono labels, thin borders, restrained hover tints, selective corner cuts, compact icons, and primary titles above supporting metadata. Do not combine every decorative signature in one element.
5. Make data and translated copy follow the existing content/i18n flow. Preserve natural wrapping and check both English and Spanish, including longer titles/status labels.
6. For new controls, implement appropriate semantics, accessible labels, keyboard focus and usable touch targets. Define needed active/disabled/loading states deliberately; they are not preexisting site-wide variants.
7. Use 150/250ms token feedback unless a specific established exception applies. Provide reduced-motion handling for new animation and keep effects independent of successful actions.
8. Verify the affected UI in both themes, above/below 768px, at a narrow mobile width, with keyboard focus, and with reduced motion. Check bottom controls and print behavior when relevant. Run `pnpm build` for Astro/TypeScript and translation-parity validation.
9. Update this document if an explicitly requested change establishes a new shared visual rule. Keep detailed design guidance here and the agent rules files as concise read-first pointers.
