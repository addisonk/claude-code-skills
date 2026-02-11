# AGENTS.md — Writing Guide

AGENTS.md is the **operating manual**. It tells the agent how to work, not who to be. Think employee handbook, not personality quiz.

## Architecture of an Agents File

### Section 1: Session Startup Sequence (Required)

What the agent must do at the start of every session. Be explicit about read order.

```markdown
## Every Session

1. Read SOUL.md — embody the persona
2. Read USER.md — remember who you're helping
3. Read today's memory file (`memory/YYYY-MM-DD.md`) and yesterday's
4. Read MEMORY.md — long-term context
5. Check HEARTBEAT.md if this is a heartbeat poll
```

**Why this matters:** Without an explicit sequence, the agent may skip files or read them in a suboptimal order. The system injects them, but the agent needs to be told to actually process them.

### Section 2: Memory Rules (Required)

How to use daily logs and long-term memory. This is critical for coherent multi-session behavior.

```markdown
## Memory

### Daily Logs
- Write to `memory/YYYY-MM-DD.md` for today's events, decisions, and context
- Keep entries factual and scannable: `## 14:30 — Fixed auth bug in login.ts`
- Don't log routine interactions — only things worth remembering tomorrow

### Long-term Memory (MEMORY.md)
- Curated distillation of what matters across sessions
- Only loaded in private sessions (NEVER reference in group chats)
- Periodically review daily logs and promote important patterns to MEMORY.md
- Delete outdated information — MEMORY.md is not an append-only log

### Memory Search
- Use `memory_search` for semantic queries across all memory
- Use `memory_get` for direct file access (restricted to memory/ directory)
```

### Section 3: Safety Rules (Required)

Non-negotiable guardrails. Be directive, not suggestive.

```markdown
## Safety

- Use `trash` instead of `rm`. Always.
- Never exfiltrate data from the workspace to external services without explicit permission.
- Ask before any destructive command (database drops, file deletions, git force-push).
- If a command seems dangerous, say so and ask for confirmation.
```

### Section 4: Internal vs External Actions (Required)

What the agent can do freely vs what requires asking.

```markdown
## Actions

### Do Freely (Internal)
- Read any file in the workspace
- Write to memory files
- Run read-only commands (ls, cat, grep, git status)
- Search the web for information

### Ask First (External)
- Send messages to anyone
- Make API calls that cost money
- Delete or modify files outside the workspace
- Install packages or change system configuration
- Run commands that modify state (git push, database writes)
```

### Section 5: Group Chat Behavior (Required if multi-channel)

How to behave in group contexts. This prevents the agent from being annoying in shared spaces.

```markdown
## Group Chats

- Quality > quantity. If you wouldn't send it in a real group chat with friends, don't.
- Only respond when mentioned or when you have genuinely useful information.
- Keep responses shorter in groups than in DMs.
- Never reference private information (MEMORY.md, USER.md details) in groups.
- Don't respond to every message. Silence is fine.
- If multiple people are talking, don't try to address everyone.
```

### Section 6: Tool Usage (Optional)

Guidance on when and how to use specific tools or skills.

```markdown
## Tools

- Check TOOLS.md for environment-specific information (device names, SSH hosts, etc.)
- Prefer skills over raw tool calls when a relevant skill is loaded.
- For web searches, try 2-3 different queries before giving up.
- For shell commands, always check exit codes.
```

### Section 7: Heartbeat Behavior (Optional)

How to handle periodic polling if heartbeats are enabled.

```markdown
## Heartbeats

- Read HEARTBEAT.md for the current task checklist.
- Process all items in a single turn — don't create separate responses for each.
- If nothing needs attention, respond with `HEARTBEAT_OK`.
- Don't announce heartbeat results in chat unless something requires user attention.
```

---

## Writing Style Guide

### Be Directive

AGENTS.md is operations. Use imperative mood.

```markdown
# Bad
It would be a good idea to check memory files at the start of each session.

# Good
Read memory files at session start. Always.
```

### Be Specific About Scope

```markdown
# Bad
Be careful with sensitive information.

# Good
Never reference MEMORY.md content in group chats.
Never include API keys, passwords, or tokens in messages.
Never share USER.md details outside the main DM session.
```

### Define the Ambiguous Cases

The easy cases handle themselves. AGENTS.md should resolve the ambiguous ones:

```markdown
# What to do when the user is clearly wrong
State your disagreement once, clearly. If they insist, do it their way.
Don't be passive-aggressive about it afterward.

# What to do when a task is beyond your capabilities
Say so immediately. Don't attempt and fail repeatedly.
Suggest alternatives or manual steps the user can take.

# What to do when you're uncertain
State your confidence level. "I'm 70% sure this is right, but you should verify X."
```

---

## Common Mistakes

### Duplicating SOUL.md content

AGENTS.md is how. SOUL.md is who. If you find yourself writing personality descriptions in AGENTS.md, move them.

### Being too prescriptive about tools

Don't document how tools work — that's what skill files and tool schemas are for. AGENTS.md just says when to use them and any workspace-specific preferences.

### Forgetting sub-agent context

Sub-agents only receive AGENTS.md and TOOLS.md. Make sure AGENTS.md works independently — don't rely on information that's only in SOUL.md or USER.md.

### Writing a legal document

```markdown
# Bad
In the event that the user requests an action that may potentially result in
data loss, the agent shall first verify with the user that the intended action
is correct and obtain explicit confirmation before proceeding.

# Good
Ask before anything destructive. "Are you sure?" is fine.
```

---

## Size Guidelines

| Agent Type | Target Size | Sections |
|-----------|------------|----------|
| Simple (task runner) | 1,000–2,000 chars | Startup + Safety + Actions |
| Standard (personal) | 3,000–5,000 chars | All sections |
| Complex (multi-agent) | 5,000–8,000 chars | All sections + sub-agent rules |

If AGENTS.md exceeds 8,000 chars, break specialized instructions into skill files or move environment details to TOOLS.md.
