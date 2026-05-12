# Document Readability

Use this reference after reading project styling sources such as `globals.css`,
`DESIGN.md`, design tokens, or `design-system.html`.

This is advisory, not a replacement for brand direction. Respect the project's
visual language, but translate product UI styling into a document that can be
read comfortably for several minutes.

## Principle

HTML artifacts are usually type to live with: plans, findings, specs,
explainers, research notes, and handoff docs. Project pages and dashboards often
use type for a moment: all-caps labels, tight cards, dramatic display faces,
compressed nav, and dense data panels.

Borrow the brand's voice. Do not copy density or display typography when it
hurts reading.

## Do

- Use project color, surface, border, shadow, icon, and accent patterns to keep
  the artifact on-brand.
- Keep body text comfortable: roughly 16-18px, 1.5-1.7 line height, and a
  readable measure around 45-75 characters.
- Give major sections enough vertical separation that the page can be scanned
  while scrolling.
- Use sentence case or title case for headings that need to be read as prose.
- Reserve all-caps for short labels, eyebrows, metadata, small badges, and
  compact UI chrome.
- Let wide elements be wide when the format needs it: tables, diagrams,
  timelines, code blocks, comparison grids, and interactive prototypes.
- Use cards for summaries, options, examples, repeated items, or comparison
  units.
- Favor whitespace over borders when separating long-form content sections.
- Test with real artifact content, not placeholder text. Long titles, dense
  findings, and source links reveal typography problems quickly.

## Don't

- Do not let `DESIGN.md` or product CSS force long-form prose into dashboard
  density.
- Do not use all-caps for long headings, section titles, nav tabs, paragraphs,
  or anything meant to be read continuously.
- Do not stretch paragraphs across the full content width just because the page
  has a wide grid.
- Do not put every section inside a card. A document can use full-width bands,
  ruled sections, or simple whitespace.
- Do not stack many small headings inside one cramped panel. Split dense
  findings into sections, articles, tables, or callouts.
- Do not overuse letter spacing. Tracked text is useful for tiny labels, but it
  makes normal reading slower.
- Do not copy marketing hero scale into documents unless the artifact is
  explicitly a presentation or visual concept.

## Translating Brand Patterns

When project styling conflicts with readability, adapt it:

- **All-caps product labels** become sentence-case document headings, while
  metadata and small labels can stay all-caps.
- **Dense dashboard cards** become roomier summary cards or table rows with
  more line height.
- **Dramatic display type** becomes a restrained hero or section accent, not the
  default for all headings.
- **Tight app navigation** becomes a readable table of contents with larger hit
  areas and clearer spacing.
- **Brand grid backgrounds or decorative motifs** stay subtle enough that prose
  contrast and legibility remain strong.

## Quick Check

Before calling the artifact done, scan it at desktop and mobile widths:

- Can the body copy be read without tracking across very long lines?
- Do sections feel separated without every section becoming a boxed card?
- Are long headings readable at a glance, without all-caps fatigue?
- Does brand expression support the content instead of competing with it?
- At 400px width, does the page still feel like a readable document rather than
  a squeezed dashboard?
