# AGENTS.md

Read the shared machine setup checklist first:

`/Users/addisonkowalski/Dropbox/.agents/docs/agent-machine-setup.md`

## Project

`addisonk/claude-code-skills` is an open-source collection of Claude Code
skills grouped by domain: design, mobile, agents, dev tools, and services.

## Working In This Repo

- Keep each skill self-contained in its existing folder.
- Prefer updating the relevant skill instructions and README entries together.
- Do not add generated runtime output, local tool caches, or API keys.

## Services And Env

Non-secret service identity notes live in `.agent-context/infra.md`.

No repo-level runtime service identity is detected from committed config in
this checkout. Individual skills may mention external services; document only
non-secret names and setup notes.
