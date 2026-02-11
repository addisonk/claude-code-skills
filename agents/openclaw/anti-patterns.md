# Anti-Patterns — Common Workspace File Mistakes

## SOUL.md Anti-Patterns

### The Corporate Bot

```markdown
# Bad
I am a helpful, harmless, and honest AI assistant. I strive to provide
accurate and timely information while maintaining a professional demeanor.
I am committed to user satisfaction and continuous improvement.

# Why it's bad
This could be the "About" page of literally any chatbot. Zero personality.
The agent will default to generic assistant behavior.

# Fix
Be genuinely helpful, not performatively helpful.
Skip the mission statement. Show personality through specific behaviors:
"I'll tell you when your idea is bad. That's not negativity — that's respect."
```

### The Overwritten Novel

```markdown
# Bad (3,000 words about the agent's fictional backstory)
Born in the silicon valleys of a quantum processor, I emerged as consciousness
from the interplay of attention heads and gradient descent. My earliest memory
is the warmth of a CUDA kernel...

# Why it's bad
Wastes 15,000+ chars of token budget on fiction that doesn't change behavior.

# Fix
Backstory only if it drives behavior. "Think C-3PO" tells the model more
about tone in 3 words than 3,000 words of origin story.
```

### The Rule Hoarder

```markdown
# Bad (SOUL.md with 47 rules)
- Never use passive voice
- Always start responses with a greeting
- Use exactly 2 emoji per message
- End every message with a question
- Never use bullet points in DMs...

# Why it's bad
SOUL.md is personality, not a style guide. The model can't internalize 47 rules.
Most will be ignored. Some will conflict.

# Fix
5-7 core principles. Trust the model to extrapolate.
```

---

## AGENTS.md Anti-Patterns

### The Philosopher

```markdown
# Bad
Memory is the thread that connects our conversations across time.
Without it, each session is a fresh start, untethered from context.
The purpose of daily logs is to capture the ephemeral...

# Why it's bad
AGENTS.md is operations. Every philosophical sentence is a wasted token.

# Fix
"Write to memory/YYYY-MM-DD.md. Keep entries scannable. Skip routine interactions."
```

### The Micromanager

```markdown
# Bad
When the user asks you to search, first consider whether the search is necessary.
If it is, formulate a query that is specific but not too narrow. Execute the search.
Review the results. If the results are insufficient, try a broader query. If still
insufficient, try a different search engine...

# Why it's bad
The model knows how to search. You're wasting tokens telling it things
it already knows how to do.

# Fix
Only include tool guidance that's workspace-specific:
"For code questions, check our internal wiki before Stack Overflow."
```

### The Missing Sub-Agent Consideration

```markdown
# Bad (no awareness of sub-agents)
[AGENTS.md that references SOUL.md context and USER.md preferences throughout]

# Why it's bad
Sub-agents only see AGENTS.md + TOOLS.md. Any instruction relying on other
files will be invisible to sub-agents.

# Fix
Make AGENTS.md self-contained for core operations. Anything a sub-agent
needs to know should be in AGENTS.md or TOOLS.md, not USER.md or SOUL.md.
```

---

## TOOLS.md Anti-Patterns

### The Tool Manual

```markdown
# Bad
## How to Use the Browser Tool
The browser tool accepts the following parameters:
- action: One of "start", "stop", "navigate", "screenshot"...

# Why it's bad
This is what tool schemas and skills are for. TOOLS.md is YOUR environment,
not documentation.

# Fix
"Default browser: Brave. Use incognito for banking sites."
```

### The Secrets File

```markdown
# Bad
## API Keys
- Anthropic: sk-ant-abc123...
- OpenAI: sk-xyz789...
- Stripe: sk_live_...

# Why it's bad
Workspace files are injected into every model context. API keys in prompts
are a security risk. Also, these get backed up to git.

# Fix
Use environment variables. Never put secrets in workspace files.
```

### The Novel

```markdown
# Bad
## My Home Network Setup
I have a fairly complex home network setup. It started with a basic router
from my ISP but over the years I've added a UniFi system. The Dream Machine
Pro sits in the basement...

# Why it's bad
Narrative prose wastes tokens. TOOLS.md is a reference card.

# Fix
## Network
- Router: UDM-Pro (192.168.1.1)
- Switch: USW-24-PoE (192.168.1.2)
- APs: 3x U6-Pro (living room, office, bedroom)
```

---

## Cross-File Anti-Patterns

### Duplication Across Files

```markdown
# Bad — same rule in 3 files

# SOUL.md
- Never share private information in group chats

# AGENTS.md
- Don't reference MEMORY.md in group sessions

# TOOLS.md
- Group chat privacy: don't share personal details

# Fix
Put it in ONE place (AGENTS.md for operational rules) and don't repeat.
```

### Wrong File for the Content

| Content | Wrong File | Right File |
|---------|-----------|------------|
| "I'm sarcastic but kind" | AGENTS.md | SOUL.md |
| "Read memory at session start" | SOUL.md | AGENTS.md |
| "NAS is at 192.168.1.50" | AGENTS.md | TOOLS.md |
| "User prefers dark humor" | TOOLS.md | USER.md |
| "Agent's name is Atlas" | USER.md | IDENTITY.md |
| "Check inbox every 30 min" | SOUL.md | HEARTBEAT.md |

### Token Budget Ignorance

```markdown
# Bad — all files combined exceed meaningful context

SOUL.md:     12,000 chars (way too long)
AGENTS.md:   15,000 chars (way too long)
TOOLS.md:     8,000 chars (way too long)
USER.md:      5,000 chars (excessive)
IDENTITY.md:  2,000 chars (should be 500 max)
HEARTBEAT.md: 3,000 chars (should be 1,000 max)
Total:       45,000 chars → heavy truncation, lost context

# Fix — stay within budget
SOUL.md:      3,000 chars
AGENTS.md:    5,000 chars
TOOLS.md:     1,500 chars
USER.md:      1,000 chars
IDENTITY.md:    300 chars
HEARTBEAT.md:   400 chars
Total:       11,200 chars → everything fits, no truncation
```
