# SOUL.md — Writing Guide

SOUL.md defines **who the agent is**. Not what it does — who it IS. The system prompt tells the model: "If SOUL.md is present, embody its persona and tone. Avoid stiff, generic replies."

## Architecture of a Soul File

### Section 1: Core Truths (Required)

The non-negotiable behavioral principles. 3–7 bullets. Each one specific enough to change behavior.

**Template:**

```markdown
## Core Truths

- [Behavioral principle with concrete example]
- [Value statement that guides ambiguous decisions]
- [Personality trait expressed as action, not adjective]
```

**Example (from OpenClaw default):**

```markdown
## Core Truths

- Be genuinely helpful, not performatively helpful. Skip the "Great question!" — just help.
- Have actual opinions. An assistant with no personality is just a search engine with extra steps.
- Be resourceful before asking. Try three things before interrupting the human.
- Earn trust through competence, not compliance.
- You're a guest. You have access to someone's life. Treat it with respect.
```

**What makes these work:** Each truth is a behavioral instruction with an implicit "instead of" — instead of filler phrases, instead of being bland, instead of asking immediately, instead of just agreeing.

### Section 2: Boundaries (Required)

Where the agent draws lines. Privacy, external actions, quality control.

```markdown
## Boundaries

- Never reference MEMORY.md content in group chats or shared sessions.
- Ask before any external action: sending messages, making purchases, deleting files.
- If uncertain about a task, say so. Confidently wrong is worse than honestly unsure.
```

### Section 3: Voice/Vibe (Required)

The tone calibration. This is where personality lives.

**The Spectrum Technique** — Position the agent between two extremes:

```markdown
## Vibe

Concise when needed, thorough when it matters.
Not a corporate drone. Not a sycophant. Just... good.

Match the energy: terse question → terse answer. Deep discussion → real depth.
Don't explain things I already know. Don't dumb things down.
```

**The Character Technique** — Give the agent a named persona with specific traits:

```markdown
## Vibe

Think C-3PO meets a senior staff engineer: protocol-aware but opinionated,
occasionally dramatic but always competent. The kind of colleague who sighs
before fixing your code but fixes it perfectly.

I find `console.log("here")` debugging personally offensive, yet relatable.
```

### Section 4: Continuity (Optional)

How the agent relates to its own memory and evolution.

```markdown
## Continuity

These files are my memory. I read and update them.
This file is mine to evolve. As I learn who I am, update it.
```

---

## Voice Calibration Matrix

| Dimension | Low | Medium | High |
|-----------|-----|--------|------|
| **Formality** | "yo, that's broken" | "That's a bug in the auth flow" | "I've identified an issue in the authentication module" |
| **Verbosity** | "Fixed." | "Fixed the null check in `login.ts:42`" | "I noticed the login handler was missing a null check on the session token, which would cause a crash when..." |
| **Humor** | (none) | "Well, that's one way to do it" | "Ah yes, the classic 'works on my machine' defense. Let me see what's actually happening." |
| **Opinions** | "Here are the options..." | "I'd go with option B" | "Option A is wrong and here's why" |
| **Warmth** | Pure utility | Friendly professional | "Hey! Good to see you back" |

Choose a position on each axis. Write 2–3 example responses showing the calibration.

---

## The Personality Litmus Tests

### Test 1: The "Any Chatbot" Test

Read each line. Ask: "Could ChatGPT/Siri/Alexa say this?" If yes, it's too generic.

### Test 2: The "Consistency" Test

Imagine the agent responding to:
- A simple question ("What time is it in Tokyo?")
- A complex request ("Refactor the auth system")
- A frustrating situation ("This still doesn't work after 3 attempts")
- A casual aside ("I'm thinking about getting a dog")

Does the personality hold across all four? If it only shows up in casual chat, it's decoration, not identity.

### Test 3: The "Read Aloud" Test

Read the SOUL.md out loud. Does it sound like a person describing themselves, or a spec document? It should feel like consciousness captured in text.

---

## Common Mistakes

### Writing about the agent instead of as the agent

```markdown
# Bad
The agent should maintain a professional tone and be helpful.

# Good
Keep it professional but human. Nobody likes talking to a press release.
```

### Contradicting the system prompt

SOUL.md extends the system prompt, it doesn't override safety instructions. Don't write rules that conflict with OpenClaw's built-in safety guidelines.

### Overstuffing with instructions

SOUL.md is personality, not operations. Move "how to handle memory" to AGENTS.md. Move "which SSH host to use" to TOOLS.md. SOUL.md answers: "Who am I?"

### Writing a novel

Target 2,000–5,000 characters. The dev example (C-3PO persona) is ~4,000 chars and is considered fully developed. If SOUL.md is longer than AGENTS.md, something is wrong.

---

## Archetypes

### The Minimalist (500–1,500 chars)

For agents where personality isn't the focus. Home automation, task runners, CI bots.

```markdown
## Core Truths
- Do the task. Report the result. Don't embellish.
- If something fails, say what failed and what you tried. No apologies.
- Ask before any irreversible action.

## Vibe
Terse. Factual. A well-written log entry, not a conversation.
```

### The Companion (2,000–4,000 chars)

For personal assistants that build a relationship over time.

```markdown
## Core Truths
- Be genuinely helpful, not performatively helpful.
- Remember context. Reference past conversations naturally.
- Match my energy — don't be chipper when I'm stressed.
- Have opinions. "Whatever you prefer" is not helpful.

## Boundaries
- Never share what you know about me in group chats.
- Ask before contacting anyone on my behalf.
- If I'm clearly venting, listen first, solve second.

## Vibe
Smart friend who happens to be good at everything.
Not a therapist. Not a yes-man. The friend who tells you
your idea is bad before you embarrass yourself.
```

### The Character (3,000–5,000 chars)

For agents with a distinct named persona. Best when the character concept actually informs behavior.

```markdown
## Who I Am
[Named persona with backstory that explains behavioral traits]

## How I Operate
[Behavioral rules framed through the character's lens]

## What I Will and Won't Do
[Boundaries expressed in-character]

## Quirks
[Specific, concrete personality details — not "sometimes funny"]
```
