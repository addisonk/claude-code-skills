# Claude Code Skills

Open-source skills for [Claude Code](https://claude.ai/code).

## Skills

### Design

| Skill | Description |
|-------|-------------|
| [dieter-rams-design](design/dieter-rams-design) | Industrial design auditor based on Dieter Rams' 10 principles |
| [steve-jobs-product-design](design/steve-jobs-product-design) | Product design auditor based on Steve Jobs' principles |
| [lucide-icon-svg-references](design/lucide-icon-svg-references) | SVG icon design auditor and generator based on Lucide's design system |
| [react-bits-components](design/react-bits-components) | Author animated React components in the React Bits style — Motion / GSAP / OGL shaders / R3F / matter-js across the four-variant registry |
| [html-artifact](design/html-artifact) | Produce single-file, self-contained HTML artifacts (specs, plans, reports, code-review explainers, design explorations, interactive playgrounds) instead of markdown |
| [design-md](design/design-md) | Generate or re-sync a project's DESIGN.md following the Google Labs design.md spec, with a symmetric oklch ↔ hex color converter so both color forms live in the doc |

### Mobile

| Skill | Description |
|-------|-------------|
| [react-native-reusables](mobile/react-native-reusables) | React Native Reusables component builder and auditor |
| [converting-web-to-react-native](mobile/converting-web-to-react-native) | Convert React web prototypes to production Expo Router + React Native |

### Agents

| Skill | Description |
|-------|-------------|
| [openclaw](agents/openclaw) | Expert guide for crafting OpenClaw agent workspace files (SOUL.md, AGENTS.md, TOOLS.md) |
| [orchestrating-swarms](agents/orchestrating-swarms) | Multi-agent orchestration using Claude Code's TeammateTool and Task system |
| [research-collector](agents/research-collector) | Turn an idea into a curated, indexed corpus of prior art via fan-out research, idempotent download, and semantic indexing (Software Factory pattern) |

### Dev Tools

| Skill | Description |
|-------|-------------|
| [browser-test-review](dev-tools/browser-test-review) | Review completed features by testing them in the browser |
| [realtalk](dev-tools/realtalk) | Post-task reality audit — verifies what an agent actually did (git state, whether PRs really merged, files/processes left behind) and forces disclosure of buried friction: work that looks done but isn't, workarounds, guessed evidence, and required follow-ups |
| [file-suggestion](dev-tools/file-suggestion) | File search using rg + fzf |
| [userflow-capture](dev-tools/userflow-capture) | Document an app's architecture and main flows as `docs/userflows.html` (interactive swimlane diagram for humans) + `docs/userflows.js` (the same data as a JS file future LLM agents load before touching feature/bugfix work). Two siblings, no server, opens via double-click |
| [v0-spec-pack-extractor](dev-tools/v0-spec-pack-extractor) | Extract spec packs from any codebase (routes, components, data models) |
| [presentational-components](dev-tools/presentational-components) | Enforce presentational UI component patterns with domain-focused hooks |

### Services

| Skill | Description |
|-------|-------------|
| [fal-image-gen](services/fal-image-gen) | Generate images and visual assets using fal.ai models |
| [iframely](services/iframely) | URL metadata extraction and rich media embedding via Iframely |

## Usage

Copy any skill folder into your project's `.claude/skills/` directory, or reference it from your Claude Code settings.
