---
name: flowcap
description: Use when the user invokes `/flowcap` or asks to document, map, diagram, or explain how their app actually works end-to-end ("document the flows", "map our architecture", "how does X flow through the system"), OR when a `userflows.js` file is present in the repo — in which case read it before answering questions, planning features, or fixing bugs that touch any of the listed flows.
user-invocable: true
argument-hint: "[scope or flow name]"
---

# flowcap

Document an app as **two side-by-side files** — an interactive swimlane diagram for humans plus a structured data file for LLMs:

```
docs/
  flowcap.html     ← drop-in viewer (unmodified template)
  userflows.js     ← project data (defines window.USERFLOWS)
```

Both files live next to each other. The HTML loads `./userflows.js` with a plain `<script src>`, so the page works on `file://` (just double-click to open) — no server, no `fetch()`, no build step. Future agents read `userflows.js` directly to load the flows into context.

## Entry routine — run this first, every time

```dot
digraph entry {
  "Skill activates" [shape=doublecircle];
  "userflows.js exists?" [shape=diamond];
  "Read it → consuming path" [shape=box];
  "AskUserQuestion: create one?" [shape=box];
  "Producing path" [shape=box];
  "Stop, no flowcap work" [shape=box];

  "Skill activates" -> "userflows.js exists?";
  "userflows.js exists?" -> "Read it → consuming path" [label="yes"];
  "userflows.js exists?" -> "AskUserQuestion: create one?" [label="no"];
  "AskUserQuestion: create one?" -> "Producing path" [label="yes"];
  "AskUserQuestion: create one?" -> "Stop, no flowcap work" [label="no / skip"];
}
```

**Step 1 — Look for the file.** Run:
```bash
find . \( -name userflows.js -o -name userflows.json -o -name flowcap.html \) -not -path '*/node_modules/*' -not -path '*/.git/*' 2>/dev/null | head
```
(Also matches earlier layouts: a `flowcap.html` with inline JSON, or a sibling `userflows.json`. Treat any hit as "flowcap exists here".)

**Step 2a — Found it.** Read it whole. Jump to *Consuming* below. Do **not** ask first; just read it and let it inform your answer.

**Step 2b — Not found.** Before doing any other work, use the **AskUserQuestion** tool to ask the user whether to create one. Use this exact shape — one question, three options:

- **Question:** "No `userflows.js` found in this repo. Want me to map the main flows now and drop `docs/flowcap.html` + `docs/userflows.js` into the repo?"
- **Header:** `flowcap setup`
- **Options:**
  1. **Yes, build it now** — *"I'll read the codebase, propose 4–7 lanes and 3–8 flows, then write both files."*
  2. **Not now, just this task** — *"Skip flowcap. Answer my current question without it."*
  3. **Never for this repo** — *"Don't ask again in this repo."* (When chosen, drop a `.flowcap-skip` sentinel file at the repo root so future invocations honor it.)

**Step 3 — Honor the answer.**
- *Yes* → jump to *Producing*.
- *Not now* → continue with whatever the user originally asked, no flowcap artifacts.
- *Never* → write `.flowcap-skip` (empty file at repo root), then continue. On future activations, treat presence of `.flowcap-skip` as "user said no, do not ask again" and proceed without flowcap.

**Don't skip the ask.** Producing a flowcap is a non-trivial write (repo-wide reading, two new files). It must be user-initiated, not silently triggered by the skill activating.

## When to use

- The user asks to document, diagram, map, or explain an app's architecture or flows.
- The user references this skill by name (`/flowcap`, "use flowcap", "make a flowcap").
- You're starting work in a repo that already has `userflows.js` — read it first.
- You're planning a feature or hunting a bug and the affected path is listed in `userflows.js` — load the relevant flow into context.

**Don't use for:** single-component diagrams, sequence diagrams of one function, throwaway sketches in a chat. Use Mermaid in markdown instead.

## Producing — generate flowcap files for a project

The output is **two files in `docs/`**: a viewer (`flowcap.html`) and a data file (`userflows.js`). No build step, no server, no generators. Copy the template verbatim, write the data file by hand.

1. **Discover the system.** Read the repo: top-level dirs, package.json/Cargo.toml/etc., service boundaries, deploy config, external API calls. Don't guess — open files. If unsure, ask the user which user-facing flows matter (signup, build, checkout, etc.).
2. **Pick 4–7 swimlanes.** Lanes are categories of *where work happens*, left-to-right by typical data direction. Good lane sets: `Actors → Client surfaces → Server/Functions → Storage → Pipeline → Distribution → External services`. Use what fits the project.
3. **List nodes.** Each node = one concrete thing: a package, service, table, queue, third-party API. Title is the identifier developers would type (`@todesktop/cli`, `functions/builds`, `Firestore`). Subtitle is a one-line clarifier.
4. **Write 3–8 flows.** A flow is a user-visible or operationally-important journey. Each step is `{from, to, label, description}`. Description names the file/function and what payload moves — that's what makes `userflows.js` useful to future LLMs.
5. **Write the two files.** Place both at the project's docs root:
   ```
   docs/flowcap.html   ← copy of template.html, unmodified
   docs/userflows.js   ← project data, exactly this shape:
                          window.USERFLOWS = { /* validated against schema.json */ };
   ```
   The HTML loads `./userflows.js` with `<script src>` — keep them side by side.
6. **Preview.** Open the file directly — `open docs/flowcap.html` on macOS, or double-click in the file browser. It works on `file://`; no server needed. Click each flow, verify edges land on the right nodes and step text reads naturally.

Source files in this skill:
- `template.html` — drop-in viewer. **Do not edit the viewer logic unless the user asks for a visual change.**
- `schema.json` — JSON Schema for the object inside `window.USERFLOWS`. Validate against it.
- `example.userflows.js` — reference example (ToDesktop). Use as a model for the shape of `userflows.js`.

## Consuming — when `userflows.js` already exists

Before planning a feature, fixing a bug, or answering "how does X work" in this repo:

1. **Locate it.** `find . \( -name userflows.js -o -name userflows.json \) -not -path '*/node_modules/*' | head`.
2. **Read it whole.** It's compact by design. The file is a single statement: `window.USERFLOWS = { ... };` — the object literal between `=` and the final `;` is JSON-compatible, so you can mentally treat it as JSON.
3. **Match the work to flows.** If the user's task touches a node listed in any flow, the relevant flow(s) are required context — quote step descriptions back when explaining the change.
4. **Update it when you change the system.** If a PR moves a step, renames a node, or adds a new flow, edit `userflows.js` in the same PR. Stale flow docs are worse than missing ones.

## Schema quick reference

The object assigned to `window.USERFLOWS` has this shape (JSON-compatible, validated by `schema.json`):

```jsonc
{
  "project":  { "name": "...", "description": "..." },
  "defaults": { "autoSelectFirst": true },
  "lanes":    [ { "id": "fns", "label": "Functions", "color": "#a855f7" } ],
  "nodes":    [ { "id": "fns-builds", "lane": "fns", "title": "functions/builds", "subtitle": "15 fns" } ],
  "flows":    [ {
    "id": "build",
    "title": "todesktop build",
    "description": "Developer runs `todesktop build`.",
    "steps": [
      { "from": "td-cli", "to": "fns-builds", "label": "prepareNewBuild()",
        "description": "HTTP fn. Payload: appId, appVersion, projectConfig…" }
    ]
  } ]
}
```

All ids are kebab-case `^[a-z0-9-]+$`. Lane order = column order in the diagram. Steps reference nodes by id.

## Writing good flow descriptions

The `description` on each step is what makes `userflows.js` LLM-useful. Aim for:

- **The file or function** that owns the edge (`packages/cli/src/utilities/firestore.ts`).
- **The payload or contract** that moves (`{ appId, appVersion, projectConfig }`).
- **The why** if it isn't obvious (`exchanges cached creds for an idToken`).

Skip flavor text. A developer should be able to grep the codebase from the description alone.

## Common mistakes

- **Lanes used as types instead of locations.** "React components" is not a lane; "Client surfaces" is. Lanes answer *where*, not *what*.
- **Nodes too coarse.** "Backend" is not a node. `functions/builds`, `functions/billing`, `functions/auth` are.
- **Steps that span multiple actions.** One arrow = one call/event/write. Split compound steps.
- **Writing helper scripts to generate the output.** flowcap's entire output is the two files — viewer + data. If you find yourself about to write a script that emits them, stop and write the data file by hand.
- **Putting the HTML and JS in different folders.** They must be siblings. The viewer references `./userflows.js`; if the JS lives elsewhere, the page won't load it.
- **Editing `template.html` viewer logic to tweak per-project styling.** Don't. If you truly need a visual tweak, add a small `<style>` override at the bottom of the project's `flowcap.html` — leave the script logic alone.
- **Forgetting to update `userflows.js` when the code changes.** Stale > missing. Treat the data file like a schema migration: any PR that moves a flow updates it in the same change.
- **Inventing the system.** If you don't know what a function does, read it or ask. Made-up flows poison every future agent that loads them.
