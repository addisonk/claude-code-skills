---
name: research-collector
description: Use when starting a new project, feature, or research-heavy task that benefits from prior art (arxiv papers, OSS repos, product docs). Turns a fresh IDEA.md / SEED.md / README.md into a curated, deduplicated, semantically indexed local corpus that downstream agents can draw from. Triggers include "gather prior art", "research the space", "what already exists for X", "fan-out research", "Software Factory", "Attractor", "Fabro", "Kilroy".
---

# Research Collector

Four-stage workflow that converts a one-paragraph project idea into a dense, locally cached, indexed corpus of prior art. Each stage hands off to the next via files on disk so the work is resumable, idempotent, and reusable across agents.

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
| **Fan-out Research** | Use ChatGPT, Gemini, and Claude *deep research* (web modes) in parallel. Each tool sees a different slice of the web; coverage is union-of-tools, not best-of. |
| **Token Cache** | Download every source once into local files. Future agents read from disk, not from the network. The cache is reconstitutable from a manifest, so it's gitignored. |
| **Semantic Index** | A multi-level index (topics, citations, cross-refs, tags, clusters, themes) over the corpus. Lets the next agent build context efficiently instead of re-reading everything. |
| **Critic Application** | A domain-specific validator agent that checks downstream outputs against the indexed prior art. Built later, on top of the index. |

## Core Workflow

```
IDEA.md / SEED.md / README.md
            │
            ▼
   1. Research Brief  ──► docs/research/<deep-research-output>.md
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

Run stages in order. Each stage has a canonical prompt — use it verbatim or close to it.

### 1. Research Brief

Generate a brief, then fan it out to multiple deep-research agents (ChatGPT, Gemini, Claude web research) in parallel. Each result lands as a new file under `docs/research/`.

```
Look at our [IDEA.md, SEED.md, README.md]. Write a research brief which will
instruct a deep research agent to identify all useful prior art, especially
arxiv.org papers, git repos, product documentation and other authoritative
sources.
```

### 2. Download Manifest

Walk through the streaming research outputs and produce one normalized list of URLs. The yaml is the source of truth and is safe to re-run as more research arrives.

```
Look through docs/research. I want to produce a list of unique URLs and repos
which will be downloaded to act as prior art for our upcoming project.
Because research results will continue to stream in from other researchers,
create a docs/research/downloads.yaml to track which papers, repos, articles
etc have already been downloaded. The format should be suitable for idempotent
upsert as new URLs are discovered.
```

### 3. Parallel Download

Fan out sub-agents to fetch every entry into `inspiration/`, updating yaml status per item. Tunable concurrency to balance throughput against rate limits.

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

MapReduce over the corpus: one sub-agent per source produces local notes; a reducer merges into `docs/research/index/`. The index is what every future agent in the project will read first.

```
Construct a semantic index of our research materials. The inspiration/
directory contains all known prior art for our project; however, the token
volume is very large. Construct docs/research/index/ as a semantic index:
topics, citations, cross-references, bookmarks, tags, clusters, themes -
anything which will aid a future coding agent in quickly locating the most
dense and useful aspects of our prior art materials. Be sure to use
sub-agents for each project - think MapReduce.
```

## Resulting Layout

```
project/
├── IDEA.md | SEED.md | README.md
├── docs/
│   └── research/
│       ├── <chatgpt-deep-research>.md
│       ├── <gemini-deep-research>.md
│       ├── <claude-deep-research>.md
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

- **Committing `inspiration/`** — it's a cache, not source. Always gitignore. Reconstitutable from `downloads.yaml`.
- **Skipping the manifest** — downloading inline from research outputs loses idempotency when new research arrives.
- **One agent over the whole corpus** for the index — token-bloated and slow. Always MapReduce: one sub-agent per source, one reducer at the end.
- **Stopping at one deep-research tool** — fan out to ChatGPT + Gemini + Claude. Coverage differs; the union is the corpus.
- **Re-snapshotting research mid-flight** — once `downloads.yaml` exists, upsert into it. Don't regenerate from scratch.
- **Treating the index as final** — it's a living artifact. Re-run stage 4 as new sources land in `inspiration/`.
