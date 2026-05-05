---
name: research-collector
description: Use when starting a new project, feature, or research-heavy task that benefits from prior art (arxiv papers, OSS repos, product docs). Turns a fresh idea into a curated, deduplicated, semantically indexed local corpus that downstream agents can draw from. Triggers include "gather prior art", "research the space", "what already exists for X", "fan-out research", "Software Factory", "Attractor", "Fabro", "Kilroy".
---

# Research Collector

Five-stage workflow that converts a one-paragraph project idea into a dense, locally cached, indexed corpus of prior art. The middle of the pipeline is **human-in-the-loop**: stage 1 produces a short prompt that the human pastes into ChatGPT, Claude, and Gemini's *deep research* (web) modes. The agent picks up again once the human drops the outputs into `docs/research/`.

Adapted from Justin McCarthy's "Software Factory" pattern at StrongDM AI (factory.strongdm.ai). Implemented end-to-end by Fabro (fabro.sh) and Kilroy (github.com/danshapiro/kilroy).

## When to Use

- Greenfield project where prior art shapes design (arxiv papers, OSS repos, product docs)
- About to write a non-trivial spec and want to ground it in what already exists
- User asks for a research spike before any code is written
- User mentions "Software Factory", "non-interactive development", "grown software", Attractor, Fabro, Kilroy, or "fan-out research"

**Skip when:** the task is contained inside the current codebase, or the user wants a quick answer rather than a curated corpus.

## Four Patterns

| Pattern | What it is |
|---|---|
| **Fan-out Research** | Human pastes one prompt into ChatGPT, Claude, and Gemini *deep research* modes in parallel. Each tool sees a different slice of the web; coverage is union-of-tools, not best-of. |
| **Token Cache** | Download every source once into local files. Future agents read from disk, not from the network. Reconstitutable from a manifest, so it's gitignored. |
| **Semantic Index** | A multi-level index (topics, citations, cross-refs, tags, clusters, themes) over the corpus. Lets the next agent build context efficiently instead of re-reading everything. |
| **Critic Application** | A deliberately adversarial validator agent — a "super negative" persona whose job is to poke holes. Reads the semantic index and tears into proposed designs, specs, or outputs using the prior art as ammunition ("paper X already showed this fails", "repo Y took the opposite approach because…"). Built later, on top of the index. |

## Core Workflow

```
            ┌──── 0. Ask the user (interactive)
            │     "What are we researching, and where's the seed doc?"
            ▼
   1. Research Brief  ──► simple prompt printed to chat
            │              (human pastes into ChatGPT + Claude + Gemini deep research)
            ▼
   ─── HUMAN STEP: run deep research on all 3, save results to docs/research/ ───
            │
            ▼
   2. Download Manifest  ──► docs/research/downloads.yaml   (idempotent)
            │
            ▼
   3. Parallel Download  ──► inspiration/   (gitignored token cache)
            │
            ▼
   4. Semantic Index  ──► docs/research/index/   (topics, tags, clusters, xrefs)
```

### 0. Ask the User (always start here)

Before doing anything else, ask one question to anchor the corpus. Use [AskUserQuestion](#) if available, otherwise plain prose:

> **What's the project, and where should I read the seed from?**
> - Option A: read an existing file (e.g. `IDEA.md`, `SEED.md`, `README.md`) — give me the path
> - Option B: paste the idea inline now (a paragraph is fine)
> - Option C: I don't have one yet — help me write a `SEED.md` first

Do not proceed past stage 1 until the seed exists on disk. The brief is only as good as the seed.

### 1. Research Brief

Read the seed and produce **one short, plain-English prompt** the user can copy into a deep-research UI. Keep it under ~10 lines. Do not include framework jargon, do not reference local file paths, do not assume the model has access to the repo. Imagine pasting it into a fresh browser tab.

Print it to chat in a fenced block, then tell the user:

> Run this prompt in **deep research mode** on all three:
> - ChatGPT — chatgpt.com → Tools → "Deep research"
> - Claude — claude.ai → "Research"
> - Gemini — gemini.google.com → "Deep Research"
>
> When each finishes, save/export the result as markdown into `docs/research/` (one file per tool, e.g. `chatgpt.md`, `claude.md`, `gemini.md`). Tell me when at least one has landed and I'll continue.

Canonical brief-generator prompt (run inside Claude Code):

```
Look at our [IDEA.md / SEED.md / README.md]. Write a short, plain-English
research brief that a non-technical user can paste into a deep-research
agent (ChatGPT, Claude, Gemini). The brief should instruct the agent to
identify all useful prior art — especially arxiv.org papers, git repos,
product documentation, and other authoritative sources. Output ONLY the
brief itself, ready to copy-paste. No preamble.
```

### 2. Download Manifest

Once one or more deep-research outputs are in `docs/research/`, run:

```
Look through docs/research. I want to produce a list of unique URLs and repos
which will be downloaded to act as prior art for our upcoming project.
Because research results will continue to stream in from other researchers,
create a docs/research/downloads.yaml to track which papers, repos, articles
etc have already been downloaded. The format should be suitable for idempotent
upsert as new URLs are discovered.
```

`downloads.yaml` is the source of truth — re-runnable as new tools' results arrive.

### 3. Parallel Download

```
Use sub-agents to download all materials identified in download.yaml into the
inspiration/ directory. Update the status in the yaml file as each sub-agent
completes a download. Balance throughput and rate-limiting. Start with 5
sub-agents. Verify that inspiration/ is in gitignore; if it's not, add it (we
can always reconstitute this directory from download.yaml later)
```

Invariants:
- `inspiration/` MUST be gitignored — it's a cache, not source
- Sub-agents update yaml status atomically so re-runs skip completed items
- Start at 5 concurrent; back off on rate limits, ramp up on idle

### 4. Semantic Index

```
Construct a semantic index of our research materials. The inspiration/
directory contains all known prior art for our project; however, the token
volume is very large. Construct docs/research/index/ as a semantic index:
topics, citations, cross-references, bookmarks, tags, clusters, themes -
anything which will aid a future coding agent in quickly locating the most
dense and useful aspects of our prior art materials. Be sure to use
sub-agents for each project - think MapReduce.
```

MapReduce style: one sub-agent per source produces local notes; a reducer merges into `docs/research/index/`.

## Resulting Layout

```
project/
├── IDEA.md | SEED.md | README.md
├── docs/
│   └── research/
│       ├── chatgpt.md              # deep-research export, pasted by human
│       ├── claude.md               # deep-research export, pasted by human
│       ├── gemini.md               # deep-research export, pasted by human
│       ├── downloads.yaml          # idempotent manifest, source of truth
│       └── index/                  # semantic index (topics, tags, clusters, xrefs)
├── inspiration/                    # gitignored token cache
└── .gitignore                      # contains inspiration/
```

## Software Factory Context

This skill is one technique inside the broader "Software Factory" pattern — non-interactive development where specs and scenarios drive agents that write code, run harnesses, and converge without human review. Other techniques in the same family:

- **Scenarios over tests** — end-to-end user stories, often kept outside the codebase, validated probabilistically by an LLM. Not reward-hackable like a unit test.
- **Satisfaction over green/red** — fraction of trajectories through scenarios that likely satisfy the user, not boolean test pass.
- **Digital Twin Universe (DTU)** — behavioral clones of third-party services (Okta, Jira, Slack, Google Docs/Drive/Sheets) so scenarios can be validated at volumes far exceeding production limits.
- **Deliberate naivete** — actively shed Software 1.0 habits ("we'd never build that, it'd take a year"); the agentic moment changed the economics.

Surface these when the user is designing the harness around the corpus, not when they just want the corpus.

## References

| Source | What it is |
|---|---|
| factory.strongdm.ai | The Software Factory — principles, techniques, products |
| Attractor (NLSpec) | Spec for a non-interactive coding agent suitable for a Software Factory |
| fabro.sh | Open-source workflow orchestration — graph pipelines, verification gates, Git checkpointing. Implements Attractor. |
| github.com/danshapiro/kilroy | Local-first CLI that turns English requirements into Attractor pipelines in a git repo. Implements Attractor. |

## Common Mistakes

- **Skipping the user question** — never assume the seed. Always ask first; the brief is only as good as the seed.
- **Writing a jargon-heavy brief** — it gets pasted into a fresh browser tab. Keep it plain English, under ~10 lines, no local paths.
- **Trying to drive deep research from inside Claude Code** — you can't. Stage 1 hands off to a human who pastes into three web UIs.
- **Stopping at one deep-research tool** — fan out to all three. Coverage differs; the union is the corpus.
- **Committing `inspiration/`** — it's a cache, not source. Always gitignore. Reconstitutable from `downloads.yaml`.
- **Skipping the manifest** — downloading inline from research outputs loses idempotency when new research arrives.
- **One agent over the whole corpus** for the index — token-bloated and slow. Always MapReduce: one sub-agent per source, one reducer at the end.
- **Treating the index as final** — it's a living artifact. Re-run stage 4 as new sources land in `inspiration/`.
