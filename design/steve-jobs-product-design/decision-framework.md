# Decision Framework

How to apply Steve Jobs' principles to real product decisions.

---

## The Core Question

Before any decision, ask:

> "Does this make the product simpler, more focused, and more delightful?"

If the answer isn't clearly yes, the answer is no.

---

## Feature Decisions

### Should We Build This Feature?

```
┌─────────────────────────────────────────┐
│ Does this serve the core experience?    │
└─────────────────────┬───────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
         YES                      NO
          │                       │
          ▼                       ▼
┌─────────────────────┐    ┌─────────────┐
│ Can we do it        │    │   KILL IT   │
│ exceptionally well? │    └─────────────┘
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
   YES          NO
    │           │
    ▼           ▼
┌─────────┐  ┌─────────────┐
│ Would   │  │ KILL IT     │
│ removing│  │ (or wait    │
│ it hurt │  │ until we    │
│ signif- │  │ can do it   │
│ icantly?│  │ right)      │
└────┬────┘  └─────────────┘
     │
  ┌──┴──┐
  ▼     ▼
 YES    NO
  │     │
  ▼     ▼
BUILD  KILL IT
```

### Feature Evaluation Matrix

| Question | Strong Yes | Weak Yes | No |
|----------|------------|----------|-----|
| Serves core experience? | Essential | Nice to have | Tangential |
| Execution quality possible? | Best in class | Adequate | Compromised |
| User impact if removed? | Product breaks | Minor inconvenience | Unnoticed |
| Resource cost? | Worth it | Expensive | Prohibitive |

**Rule:** All answers must be "Strong Yes" to build.

---

## Design Decisions

### Simplicity Test

For any design element, ask:

| Question | Action if No |
|----------|--------------|
| Is this necessary? | Remove it |
| Can this be simpler? | Simplify it |
| Does this need explanation? | Redesign it |
| Would a first-time user understand? | Redesign it |
| Can we combine this with something else? | Combine it |

### The Reduction Process

1. **List everything** in the current design
2. **Remove one thing** — does it still work?
3. **If yes** — that thing wasn't needed
4. **Repeat** until removing anything breaks it
5. **Then simplify** each remaining element

### Visual Hierarchy Test

| Element | Question |
|---------|----------|
| Primary action | Is it obvious what to do first? |
| Secondary actions | Are they clearly subordinate? |
| Content | Does the most important content stand out? |
| Navigation | Can users always find their way? |
| Distractions | Is anything competing for attention unnecessarily? |

---

## Technology Decisions

### Experience-First Evaluation

**Wrong approach:**
> "We have this technology. What can we do with it?"

**Right approach:**
> "Users need this experience. What technology enables it?"

### Technology Selection Criteria

| Criterion | Question |
|-----------|----------|
| Experience quality | Does this enable the ideal experience? |
| Reliability | Will this work every time? |
| Performance | Will this feel instant? |
| Control | Do we own the critical path? |
| Future | Does this support where we're going? |

### Build vs Buy vs Partner

| Consideration | Build | Buy/Partner |
|--------------|-------|-------------|
| Core experience | Always build | Never |
| Differentiating feature | Usually build | Rarely |
| Commodity feature | Sometimes | Usually |
| Non-user-facing | Rarely | Usually |

---

## Prioritization Decisions

### The Jobs Priority Stack

1. **Core experience** — The fundamental job to be done
2. **Quality of core** — Polish every detail
3. **Secondary experiences** — Only if core is excellent
4. **Nice-to-haves** — Usually never

### What to Cut When Constrained

Cut in this order:
1. Features users haven't asked for
2. Features competitors have but aren't essential
3. Customization and settings
4. Edge case handling (make it graceful, not comprehensive)
5. Secondary user flows

**Never cut:**
- Core experience quality
- First-time user success
- Critical error handling
- Performance

---

## Scope Decisions

### When to Expand Scope

Almost never. But consider if:
- Core experience is truly complete
- New scope directly serves core users
- You can execute at the same quality bar
- It doesn't dilute focus

### When to Reduce Scope

Often. Definitely when:
- Quality is suffering
- Team is stretched thin
- Core experience isn't excellent yet
- You're adding features to "compete"

### The 10x Rule

Only expand scope for ideas that are:
- 10x better than current alternatives
- Essential to the core experience
- Achievable at your quality standard

---

## Timing Decisions

### When to Ship

Ship when:
- First-time users succeed without help
- Details are polished (visible AND invisible)
- You're genuinely proud
- It's better than alternatives

### When NOT to Ship

Do not ship when:
- "It's good enough"
- "We can fix it later"
- "Users will figure it out"
- "We promised this date"
- "Competitors just shipped"

> "Details matter, it's worth waiting to get it right."

### The Restart Decision

Start over when:
- Core concept isn't working after multiple iterations
- Accumulated compromises undermine the vision
- New insight fundamentally changes direction
- You can't make it "feel right"

This isn't failure. It's taste.

---

## Team Decisions

### Who Decides

| Decision Type | Who |
|---------------|-----|
| Product vision | One person with taste |
| User experience | Designers with user empathy |
| Technical approach | Engineers who build it |
| Quality bar | Highest-taste person in room |
| Ship/no-ship | One person with authority |

### Decision-Making Anti-Patterns

| Pattern | Problem | Jobs' Way |
|---------|---------|-----------|
| Design by committee | Compromised vision | One visionary decides |
| Feature voting | Lowest common denominator | Taste decides |
| Stakeholder appeasement | Diluted focus | Say no |
| Consensus required | Slowest person wins | Make a decision |

---

## Quick Reference: Decision Heuristics

### When in Doubt

| Situation | Default Action |
|-----------|----------------|
| Feature request | Say no |
| Adding complexity | Don't |
| Choosing between options | Pick simpler one |
| Ship date pressure | Delay if quality suffers |
| Competitive feature | Ignore unless essential |
| User research conflict | Trust vision |
| "Good enough" | Not good enough |
| Edge case handling | Make it graceful, not comprehensive |

### The Final Test

Before any decision ships:

> "Would Steve be proud of this?"

Not "would Steve approve" (he was demanding).
Would he look at this and see taste, focus, and simplicity?

If you hesitate, you know the answer.
