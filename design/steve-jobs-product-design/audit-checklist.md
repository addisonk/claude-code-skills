# Product Audit Checklist

Use this checklist for systematic review of products, features, and designs using Steve Jobs' principles.

---

## Pre-Audit: Challenge the Premise

Before reviewing details, question whether this should exist at all.

| Question | Answer | Red Flag If... |
|----------|--------|----------------|
| Why does this need to exist? | | "Because competitors have it" |
| What problem does this solve? | | "Users might want it" |
| What happens if we don't build this? | | "Nothing critical" |
| Is this a good idea or a great idea? | | "It's a good idea" |
| Can we do this exceptionally well? | | "We can do it adequately" |

**Verdict:** Should we proceed with the audit?

---

## Simplicity Audit

### Core Simplicity

| Check | Status | Notes |
|-------|--------|-------|
| First-time user can succeed without instructions | | |
| Number of steps is minimal | | |
| Interface requires no explanation | | |
| Cognitive load is low | | |
| Intent is immediately clear | | |

### Reduction Opportunities

| Element | Necessary? | Can Be Simpler? | Action |
|---------|------------|-----------------|--------|
| | | | |
| | | | |
| | | | |

### The Interface Test

| Question | Yes | No |
|----------|-----|-----|
| Can we eliminate any screens? | | |
| Can we reduce button count? | | |
| Can anything happen automatically? | | |
| Does technology disappear or demand attention? | | |

---

## Focus Audit

### Feature Inventory

List all features and evaluate:

| Feature | Serves Core? | Exceptional Execution? | If Removed? | Verdict |
|---------|--------------|------------------------|-------------|---------|
| | Yes/No | Yes/No | Hurt/Fine | Keep/Kill |
| | | | | |
| | | | | |

### Kill List Candidates

| Feature | Why It Exists | Why It Should Die |
|---------|---------------|-------------------|
| | | |
| | | |

### Focus Score

- Total features: ___
- Essential features: ___
- Features to kill: ___
- Focus ratio (essential/total): ___%

**Target:** Focus ratio should be >80%

---

## Detail Audit

### Visible Details

| Detail | Intentional? | Quality Level | Notes |
|--------|--------------|---------------|-------|
| Typography | | 1-10 | |
| Spacing | | 1-10 | |
| Color usage | | 1-10 | |
| Animations | | 1-10 | |
| Icons | | 1-10 | |
| Copy/microcopy | | 1-10 | |
| Visual hierarchy | | 1-10 | |

### Invisible Details

| Detail | Designed? | Quality Level | Notes |
|--------|-----------|---------------|-------|
| Error states | | 1-10 | |
| Empty states | | 1-10 | |
| Loading states | | 1-10 | |
| Edge cases | | 1-10 | |
| Accessibility | | 1-10 | |
| Performance | | 1-10 | |
| Offline behavior | | 1-10 | |

### The Carpenter Test

> "Would you use plywood on the back of a beautiful chest of drawers?"

| Hidden Area | Quality Match Visible? | Notes |
|-------------|------------------------|-------|
| Code architecture | Yes/No | |
| Error handling | Yes/No | |
| Internal documentation | Yes/No | |
| Test coverage | Yes/No | |

---

## Experience Audit

### First-Time User Flow

| Step | Clear? | Necessary? | Delightful? |
|------|--------|------------|-------------|
| 1. | | | |
| 2. | | | |
| 3. | | | |
| 4. | | | |

**Total steps:** ___ (Target: fewer than expected)

### Emotional Design

| Moment | Intended Feeling | Actual Feeling | Gap |
|--------|------------------|----------------|-----|
| First impression | | | |
| Core task completion | | | |
| Error/failure | | | |
| Repeat usage | | | |

### The Feel Test

| Question | Answer |
|----------|--------|
| How should this feel to use? | |
| How does it actually feel? | |
| What's the gap? | |

---

## Integration Audit

### Stack Ownership

| Component | Own/Partner/Buy | Quality Control? |
|-----------|-----------------|------------------|
| | | |
| | | |
| | | |

### Seam Check

| Integration Point | Seamless? | Friction Observed |
|-------------------|-----------|-------------------|
| | | |
| | | |

---

## Vision Audit

### Innovation Check

| Question | Answer | Concern If... |
|----------|--------|---------------|
| Are we leading or following? | | "Following" |
| What would surprise users? | | Can't articulate |
| What's impossible that we're making possible? | | Nothing |
| What are we doing that no one else can? | | Nothing |

### Research vs Vision

| Recent Decisions | Driven By Research or Vision? |
|------------------|-------------------------------|
| | |
| | |

---

## Overall Scoring

### The Three Pillars

| Pillar | Score (1-10) | Evidence |
|--------|--------------|----------|
| Simplicity | | |
| Taste | | |
| Focus | | |

**Overall:** ___/30

### Interpretation

| Score | Meaning |
|-------|---------|
| 27-30 | Ship with pride |
| 24-26 | Close, fix identified issues |
| 18-23 | Significant work needed |
| Below 18 | Consider starting over |

---

## Audit Summary Template

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUDIT: [Product/Feature Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Simplicity: [X]/10 | Taste: [X]/10 | Focus: [X]/10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## The Hard Truth
[What Jobs would say in one sentence]

## What's Working
-
-

## What Must Change

**Remove Entirely**
| Item | Reason |
|------|--------|
| | |

**Simplify**
| Item | Current | Should Be |
|------|---------|-----------|
| | | |

**Fix Details**
| Detail | Issue | Standard |
|--------|-------|----------|
| | | |

## The Vision
[What this could become with focus and courage]

## Verdict
[ ] Ship with pride
[ ] Fix and reassess
[ ] Major rework needed
[ ] Start over
```

---

## Quick Reference: Jobs Quotes for Audits

Use these as standards during review:

| Context | Quote |
|---------|-------|
| Complexity | "Simplicity is the ultimate sophistication." |
| Details | "Details matter, it's worth waiting to get it right." |
| Focus | "Focus is about saying no." |
| Quality | "Be a yardstick of quality." |
| Vision | "People don't know what they want until you show it to them." |
| Shipping | "Real artists ship." (But only when ready) |
| Courage | "The people who are crazy enough to think they can change the world are the ones who do." |
