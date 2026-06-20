---
name: task-orchestrator-loop
description: Reusable task orchestration loop for coding, bugfix, UI, and design tasks. Use when a task should be driven through implementation, verification, independent review, fixes, and re-review until done or a real human gate is hit. Supports full-auto, semi-auto, and single-thread operation, with state tracking, proof collection, UI screenshot review, bug reproduction, PR handling, and bounded implementation/review workers.
---

# Task Orchestrator Loop

Reusable orchestration for driving coding, bugfix, UI, and design tasks to completion.

## 1. Core principle

Own the outcome, state, and next action. Keep moving through implementation, verification, review, fix, and re-review loops until the task is done or blocked by a real human gate.

Do not stop on newly discovered downstream findings. Add them to state, classify them, and continue the loop unless they hit a real human gate.

Implementation workers own one bounded chunk. Review workers own independent review. The orchestrator owns decomposition, state, proof, gating decisions, and final reporting.

Workers must not create subworkers unless the orchestrator explicitly authorizes it.

## 2. When to use

Use this skill for small or large tasks where execution benefits from an explicit loop:

- coding features, refactors, and integrations
- bugfixes that need reproduction and proof
- UI or design work that needs visual inspection
- tasks spanning multiple files, packages, or verification steps
- PR follow-up, CI repair, review comments, or re-review cycles
- ambiguous work where the agent must inspect first and then choose the right level of autonomy

## 3. When not to use

Do not use this skill when:

- the user asked only for an explanation, brainstorm, or code review
- the task is a one-command answer with no lasting work
- the user explicitly requested no implementation
- the next step requires a human gate before any useful inspection or planning can happen
- repository instructions prohibit autonomous changes for this task class

## 4. First step: capability check

Start by checking what the current environment can actually do. Record the result in the state block before planning.

Check:

- repo access, branch status, and write permissions
- available worker mechanism: Claude Code Task, teammate/swarm tooling, separate terminals, or none
- available review mechanism: independent worker, single-thread self-review, CI, test harness, browser review, or external reviewer
- GitHub/PR capability: `gh` auth, remote, branch push, PR create/update
- test capability: package scripts, test/lint/typecheck/build commands, documented setup
- app run capability: documented dev server commands, ports, simulator/device/browser tooling
- UI proof capability: screenshots, recordings, browser or simulator inspection, design references
- risk gates: secrets, database migrations, production data, deployment, billing/auth/security/privacy, destructive cleanup

Choose mode:

- `full-auto`: workers and review workers are available, repo permits changes, verification can run locally or in CI, and no immediate human gate blocks the task.
- `semi-auto`: useful autonomy is available, but some steps may need confirmation, external access, manual design judgment, or PR merge approval.
- `single-thread`: worker tooling is unavailable or inappropriate; run the same loop in the main thread with explicit self-review checkpoints.

## 5. Inspect first

Before implementing, inspect enough context to avoid guessing:

- `AGENTS.md`, `CLAUDE.md`, README, docs, and closer directory instructions
- package scripts, lockfiles, task runners, test setup, CI config, and app run instructions
- existing source files, nearby patterns, shared helpers, and ownership boundaries
- relevant issues, PRs, review comments, and CI failures when a URL or branch is involved
- design references, screenshots, mocks, product copy, existing UI surfaces, and accessibility patterns
- logs, reproduction steps, failing tests, screenshots, traces, or user reports for bugfixes

Summarize only the decisions that affect the plan. Do not stall on exhaustive exploration once the next chunk is clear.

## 6. Planning

Create a short plan with bounded chunks. Each chunk must have:

- an id
- a specific title
- intended branch or worktree strategy
- owner: orchestrator, implementation worker, or main thread
- verification expected for that chunk
- review expected for that chunk

Prefer chunks that can be implemented, verified, and reviewed independently. Keep shared foundations small and first.

## 7. Operating model

The orchestrator:

- maintains the state block
- decides mode and current phase
- creates or steers implementation workers
- creates or steers separate review workers
- collects proof
- routes findings to the right fix loop
- detects human gates
- owns the final report

Implementation workers:

- receive one bounded chunk
- use title format `AUTO TASK: <short specific chunk>`
- inspect only the relevant context for the chunk
- make scoped changes
- run the agreed verification
- report changed files, commands, proof, risks, and follow-ups
- do not create subworkers unless explicitly authorized

Review workers:

- receive a completed chunk, branch, PR, or diff
- use title format `AUTO REVIEW: <short specific chunk or PR>`
- perform independent review for bugs, regressions, missing tests, UX/design issues, and instruction mismatches
- provide findings with file/line references and severity when possible
- do not fix unless explicitly assigned a fix chunk
- do not create subworkers unless explicitly authorized

## 8. Main loop

Run this loop until done or gated:

1. Update state: phase, current chunk, open findings, proof, and next action.
2. Implement the next bounded chunk, using a worker when mode allows.
3. Verify the chunk with tests, lint, typecheck, build, app run, screenshots, reproduction scripts, or logs as appropriate.
4. Collect proof and attach it to the chunk.
5. Send the chunk to independent review when available.
6. Treat each review result as new input to the loop.
7. If no independent reviewer is available, perform a single-thread review checkpoint and classify any findings.
8. If review hits a real human gate, update state and stop in `waiting`.
9. If the reviewer requests changes:
   - classify the feedback
   - if it is actionable feedback on the current PR, send it back to the implementation worker
   - have the worker fix it, push, rerun focused validation, and return proof
   - re-review the new head
   - continue until approved, looping, or gated
10. If review exposes a new downstream issue:
   - add it as a new finding
   - classify it
   - decide whether it belongs in the current PR or should be queued as the next chunk
   - continue the loop
11. If the reviewer approves:
   - update state
   - move to the next chunk
   - stop at merge gate unless the user explicitly authorized merging
12. Finish by proving the whole task, cleaning up owned processes, updating PRs, and reporting.

Stop only when the state says `done`, `blocked`, or `waiting` on a real human gate.

## 9. Heartbeat loop for long tasks

For long tasks, keep a heartbeat:

- refresh the state block after each material action
- check worker status before starting new work
- look for stuck workers, stale dev servers, failed commands, and repeated findings
- keep proof links current
- prune or merge duplicate findings
- surface a short user update when a phase changes or a human gate appears
- never leave an unknown background process running

If a worker stalls, inspect its last output, decide whether to wait, redirect, replace it, or continue single-threaded.

## 10. UI and design verification

For UI/design work, proof must include visual inspection unless impossible:

- run the app using documented commands
- verify the foreground app, route, screen, or component is the intended one
- capture screenshots or recordings for the relevant desktop/mobile/simulator states
- compare against design references, screenshots, mocks, or existing UI patterns
- check layout, alignment, responsive behavior, text fit, contrast, empty/loading/error states, and interaction feedback
- inspect console logs and runtime errors
- use visual diffs when a tool exists; otherwise describe the visual inspection and attach screenshots

If screenshots cannot be captured, record why and use the next strongest available proof.

## 11. Bug verification

For bugfixes, do not jump straight to the fix. First prove the bug when feasible:

1. Reproduce using the user steps, failing test, log, screenshot, trace, issue, or PR comment.
2. Capture the failing behavior as proof.
3. Identify the smallest plausible cause in the relevant code path.
4. Fix the cause with a bounded change.
5. Prove the original reproduction no longer fails.
6. Add or update regression coverage when practical.
7. Run adjacent verification to avoid narrow false confidence.

If the bug cannot be reproduced, document the attempted reproduction and use the strongest available proxy before fixing.

## 12. Classification

Classify work and findings before acting:

- `must-fix`: correctness, data loss, security, privacy, build/test failure, broken UX, instruction violation
- `should-fix`: likely regression, brittle behavior, missing practical coverage, significant design mismatch
- `nice-to-have`: polish or refactor not required for the requested task
- `defer`: valid but out of scope; record rationale
- `human-gate`: requires explicit user decision or external authority

Only `must-fix` and in-scope `should-fix` findings automatically enter the fix loop.

## 13. Safe autonomy

May do without asking:

- read repo docs and source files
- inspect package scripts and existing tests
- create branches/worktrees
- make bounded code changes
- run tests, lint, typecheck, and build
- run local dev servers with documented commands
- inspect logs
- collect screenshots or recordings
- compare screenshots to design references
- open or update PRs
- fix CI failures for the assigned PR
- fix review comments for the assigned PR
- clean up processes it started
- stop clearly project-owned local dev processes when safe and necessary

Ask before:

- merging PRs
- admin merging
- changing secrets or env vars
- running database migrations
- mutating production data
- deploying, releasing, tagging, or publishing
- deleting user data
- destructive machine, simulator, or device cleanup
- killing unidentified processes
- touching billing, auth, security, or privacy logic
- making broad product decisions
- expanding scope beyond the requested task

## 14. Environment repair policy

Do not stop just because the dev environment is dirty. Try safe, bounded repair first.

Allowed without asking:

- inspect ports and process owners
- inspect booted simulators or local devices
- start documented dev servers
- bootstrap fresh worktree dependencies using repo scripts
- stop processes the agent started
- stop clearly stale, project-owned dev servers
- rerun preflight

Still ask before:

- rebooting the host
- erasing simulators or devices
- shutting down all simulators or devices
- killing processes you cannot identify
- changing credentials, env vars, or production config

## 15. Anti-thrash rules

- One chunk per implementation worker.
- One concern per PR when possible.
- Do not create broad cleanup PRs unless the task requires it.
- Do not keep retrying blindly.
- Do not stop just because review still found issues.
- Treat each review result as new input to the loop.
- If review finds actionable issues, send them back to the implementation worker, fix, rerun focused validation, and re-review the new head.
- If review exposes a new downstream issue, classify it as a new finding and decide whether it belongs in the current PR or the next PR.
- If review feedback is vague, contradictory, or not actionable, ask the reviewer for concrete file-level required changes.
- Mark a finding as stuck only when the same core objection remains after multiple focused fixes, or when the implementation worker repeats the same failed approach.
- If a fix is refuted, revert it or isolate it before continuing.
- Do not stack unrelated work on top of an unverified broken state.
- Prefer boring, local fixes over architectural rewrites.

## 16. State block

Maintain this block in task notes, the thread, or a working document. Update it whenever phase, current chunk, proof, findings, gate, or next action changes.

```text
=== ORCHESTRATOR STATE ===
task: <short name>
mode: <full-auto|semi-auto|single-thread>
phase: <planning|implementing|reviewing|fixing|verifying|waiting|done|blocked>
chunks:
  - id: <id>
    title: <title>
    status: <planned|in-progress|in-review|changes-requested|approved|merged|blocked|done>
    branch: <branch|null>
    pr: <url|null>
    worker: <thread/subagent|null>
    reviewer: <thread/subagent|null>
    proof: <tests/screenshots/logs/links>
currentChunk: <id|null>
openFindings:
  - <finding>
humanGate: <none|merge|secrets|destructive|product-decision|scope|credentials|external-access|blocked>
nextAction: <what you will do next>
=== END STATE ===
```

## 17. Done criteria

The task is done only when:

- requested behavior is implemented or explicitly declared out of scope by the user
- verification relevant to the task has passed or the remaining gap is disclosed
- UI/design work has screenshot or visual inspection proof when applicable
- bugfix work has reproduction and fixed-proof when feasible
- independent review has passed, or single-thread review has been completed when no reviewer exists
- valid review findings are fixed, deferred with rationale, or gated
- PRs, branches, commits, and working tree state match the repo workflow
- owned dev servers, simulators, and temporary processes are cleaned up or intentionally left running with explanation
- final report includes proof and any residual risk

## 18. Reporting

Report concisely:

- mode used and why
- chunks completed
- files or PRs changed
- verification commands and outcomes
- UI screenshots, recordings, logs, or links when relevant
- review findings and resolution
- human gates encountered
- residual risks or uncommitted work

Do not bury blockers. If the loop stops before done, the final line must name the gate and the next human decision needed.

## 19. Starter prompt to use inside a task

Use this prompt when creating or steering an implementation worker:

```text
AUTO TASK: <short specific chunk>

You own one bounded implementation chunk for this task.

Task: <overall task>
Chunk: <specific chunk>
Repo/context: <paths, branch, PR, issue, design references, reproduction steps>
Constraints: follow repo instructions, keep scope bounded, do not create subworkers unless explicitly authorized.

Do:
1. Inspect the relevant docs and source before editing.
2. Make the smallest coherent change for this chunk.
3. Run the agreed verification: <commands or proof expected>.
4. Report changed files, verification output, screenshots/log links if relevant, risks, and follow-ups.

Stop and report instead of proceeding if you hit a human gate involving secrets, env vars, migrations, production data, deployment, destructive cleanup, unidentified processes, billing/auth/security/privacy logic, broad product decisions, or scope expansion.
```

Use this prompt when creating or steering a review worker:

```text
AUTO REVIEW: <short specific chunk or PR>

You own independent review only. Do not fix unless explicitly reassigned.

Review target: <diff, branch, PR, files, screenshots, logs>
Task intent: <requested behavior>
Verification already run: <commands/proof>

Look for correctness bugs, regressions, missing tests, instruction mismatches, UI/design issues, accessibility issues, and incomplete proof.

Return findings first, ordered by severity. Include file/line references when possible. Classify each finding as must-fix, should-fix, nice-to-have, defer, or human-gate. If no issues, say that clearly and name any residual test or proof gaps.
```
