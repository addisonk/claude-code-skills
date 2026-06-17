# agent-browser Techniques Reference

Detailed techniques for browser automation during E2E testing. Load on-demand when needed during test execution.

## Command Chaining

Chain with `&&` when you don't need to read intermediate output:
```bash
agent-browser open http://localhost:3000 && agent-browser wait --load networkidle && agent-browser snapshot -i
```
Run commands separately when you need to parse output first (e.g., snapshot to discover refs, then interact).

## Ref Lifecycle

Refs (`@e1`, `@e2`) are invalidated when the page changes. **Always re-snapshot after:**
- Clicking links/buttons that navigate
- Form submissions
- Dynamic content loading (dropdowns, modals)

## Waiting Strategies

```bash
agent-browser wait --load networkidle    # Wait for network to settle (best for slow pages)
agent-browser wait @e1                   # Wait for specific element to appear
agent-browser wait --url "**/dashboard"  # Wait for URL pattern (after redirects)
agent-browser wait 2000                  # Fixed wait (last resort)
```

## Semantic Locators

Use when refs are unreliable (e.g., text changes between loads):
```bash
agent-browser find text "Green Community" click
agent-browser find role button click --name "Submit"
agent-browser find label "Email" fill "user@test.com"
```

## Get Element Info

```bash
agent-browser get text @e1               # Get element text
agent-browser get url                    # Get current URL
agent-browser get title                  # Get page title
agent-browser get text body > page.txt   # Get all page text
```

## JavaScript Evaluation

For checking things not visible in the accessibility tree:
```bash
agent-browser eval 'document.querySelectorAll(".error-message").length'
agent-browser eval 'window.location.pathname'
```

## Visual Diffing

Compare before/after states to verify a change:
```bash
agent-browser screenshot baseline.png
# ... perform action ...
agent-browser diff screenshot --baseline baseline.png
```

Use `diff snapshot` for accessibility tree diffs:
```bash
agent-browser snapshot -i              # Baseline
agent-browser click @<ref>             # Action
agent-browser diff snapshot            # See what changed (+ additions, - removals)
```

## Scoped Snapshots

Scope snapshots to a specific area when the full page is too noisy:
```bash
agent-browser snapshot -s "[role=menu]"          # Scope to CSS selector
agent-browser snapshot -s "#sidebar"
```

Use `snapshot -i -C` to also capture cursor-interactive elements (divs with `onclick`, `cursor:pointer`):
```bash
agent-browser snapshot -i -C
```

## Screenshot Options

```bash
# Annotated — labels interactive elements with numbered refs
agent-browser screenshot --annotate docs/testing/<feature>/screenshot-1a-label.png

# Full page — captures below the fold
agent-browser screenshot --full docs/testing/<feature>/screenshot-1a-label.png
```

## Error Checking

```bash
agent-browser errors    # Show console errors since last check
```

Run after each story to catch silent failures.
