# Use Cases

Five canonical use cases for the `html-artifact` skill, with example prompts and a hint at which template to start from.

---

## 1. Specs, Planning, Brainstorms

HTML is a richer canvas than markdown for diving into a problem. Start with a brainstorm or exploration, expand into mockups or code snippets, finish with an implementation plan. Each stage can be its own HTML file, or one file with sections.

**Template:** `templates/spec-or-plan.html`

**Example prompts:**

> I'm not sure what direction to take the onboarding screen. Generate 6 distinctly different approaches — vary layout, tone, and density — and lay them out as a single HTML file in a grid so I can compare them side by side. Label each with the tradeoff it's making.

> Create a thorough implementation plan in an HTML file. Include mockups, show the data flow as an SVG, and add the important code snippets I might want to review. Make it easy to read and digest.

**Sections to include:**
- Summary + frontmatter pills
- Problem frame / context
- Requirements (table)
- Implementation units (`<article id="uN">`)
- SVG dependency diagram between units
- Risks / open questions
- Sources

---

## 2. Code Review & PR Understanding

Code is hard to read in markdown. HTML lets you render real diffs with line numbers, color-coded findings by severity, and margin annotations tied to specific lines — closer to a sticky-note review than a comment thread.

**Template:** `templates/code-review.html`

**Example prompt:**

> Help me review this PR by creating an HTML artifact that describes it. I'm not familiar with the streaming/backpressure logic so focus on that. Render the actual diff with inline margin annotations, color-code findings by severity (blocking / nit / nice), and add a vertical flow diagram of the request lifecycle.

**Sections to include:**
- PR summary with an at-a-glance stat grid (files touched, +/− lines, findings count)
- Findings table — file, line, severity, recommendation
- Annotated diff inside `.window-chrome` with `.code-numbered` rows tagged `add` / `del` / `hl`
- Margin notes (`.margin-note.severity-blocking|nit|nice`) tied to the highlighted lines
- Optional vertical SVG of the changed flow
- Test coverage notes

---

## 3. Design Explorations & Prototypes

HTML is incredibly expressive for design, even if your end surface is React/Swift/SwiftUI. Sketch the idea in HTML, then port. Add sliders or knobs for tuning animations and parameters.

**Template:** `templates/playground.html` for interactive prototypes; `templates/spec-or-plan.html` with `.variant-grid` for static comparisons.

**Example prompt:**

> I want to prototype a new checkout button. When clicked, it does a play animation and turns purple. Create an HTML file with several sliders for the animation parameters (duration, easing, color end-state), let me try different options live, and give me a copy button that copies the parameters back as JSON.

**Sections to include:**
- Live preview pane
- Controls (sliders, color pickers, selects) in a `.controls` grid
- Copy-to-clipboard button (the playground template has one)
- Variant grid for side-by-side comparison

---

## 4. Reports, Research, Explainers

Claude synthesizes across data sources (codebase, git history, MCPs, the web) and produces readable HTML reports for yourself, your team, or leadership.

**Template:** `templates/report.html`

**Example prompts:**

> I don't understand how our rate limiter actually works. Read the relevant code and produce a single HTML explainer page: a diagram of the token-bucket flow, the 3-4 key code snippets annotated, and a "gotchas" section at the bottom.

> Summarize the last 30 days of activity in this repo. Group by area, surface trends, and end with a 5-bullet "what to watch" section. HTML, with a callout for anything urgent.

**Sections to include:**
- Eyebrow + h1 + 1-paragraph summary
- Key takeaways callout (`.callout` at the top)
- Diagrams (SVG data flow / sequence)
- Annotated code snippets
- Gotchas / open questions

---

## 5. Playground / Throwaway Editors

Sometimes plain text input doesn't capture what you want. Have Claude build a one-off HTML editor — not a product, not reusable, purpose-built for this one piece of data. End with a "copy as JSON" or "copy as prompt" button that gets the result back into Claude.

**Template:** `templates/playground.html`

**Example prompts:**

> I need to reprioritize these 30 Linear tickets. Make me an HTML file with each ticket as a draggable card across Now / Next / Later / Cut columns. Pre-sort them by your best guess. Add a "copy as markdown" button that exports the final ordering with a one-line rationale per bucket.

> Here's our feature flag config. Build a form-based editor — group flags by area, show dependencies, warn me if I enable a flag whose prerequisite is off. Add a "copy diff" button that gives me just the changed keys.

> I'm tuning this system prompt. Make a side-by-side editor: editable prompt on the left with variable slots highlighted, three sample inputs on the right that re-render the filled template live. Add a token counter and a copy button.

**Pattern:**
- Inline `<script>` for interactivity (no frameworks)
- All state lives in the DOM or a single in-memory object
- Always end with an export button — `copy as JSON`, `copy as markdown`, `copy as prompt`
- Throw it away after use; don't generalize

---

## Picking a template

| If the user wants…                                                  | Template                              |
| ------------------------------------------------------------------- | ------------------------------------- |
| A plan, spec, brainstorm, or requirements doc                       | `spec-or-plan.html`                   |
| A research synthesis, status report, or topic explainer             | `report.html`                         |
| A PR explainer or code review                                       | `code-review.html`                    |
| An interactive editor with sliders, toggles, drag-and-drop, or live preview | `playground.html`             |
| A grid of design variants for side-by-side comparison               | `spec-or-plan.html` + `.compare-grid` |

When in doubt: start with `spec-or-plan.html` — it has the most flexible structure and you can layer in `.compare-grid`, `.stat-grid`, `.controls`, `.bento`, or interactive blocks as needed.

## Layout primitives

The theme ships composable blocks that any template can pull in:

- `.stat-grid` + `.stat-card` — anchor numbers, big serif value in accent color
- `.bento` — varied-tile grid with one hero
- `.timeline` — horizontal milestones, stacks vertically on mobile
- `.checklist` — numbered cards with accent-colored numerals
- `.compare-grid` + `.compare-card` (`.is-selected`) — side-by-side approach cards with `+ / −` tradeoffs
- `.tabs` — pill-style tab nav, alternative to the sidebar TOC
- `.window-chrome` + `.code-numbered` — file-window diff view with severity-tagged rows (`add` / `del` / `hl`)
- `.code-with-margin` + `.margin-note.severity-{blocking,nit,nice}` — annotated code with side notes
- `.pull-quote` — pull-quote treatment
- `.swatch-row` + `.swatch` — color tokens with hex labels
- `.toggle` — iOS-style switch input for playgrounds

