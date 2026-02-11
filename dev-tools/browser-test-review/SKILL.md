---
name: browser-test-review
description: Reviews completed features or todos by testing them in the browser using agent-browser. Use after implementing a feature, fixing a bug, or completing a todo to verify the change works in the running app. Triggers on "verify feature", "test in browser", "review with browser", or after completing implementation tasks.
---

# Browser Test Review

After completing a feature, bug fix, or todo, verify it works by testing in the running app with agent-browser.

## Workflow

1. **Identify what to test** - Determine the URL and interactions needed based on what was just implemented
2. **Ensure dev server is running** - Check if localhost:3000 is reachable
3. **Authenticate if needed** - Sign in with test credentials for protected routes
4. **Navigate to the feature** - Open the relevant page
5. **Interact and verify** - Test the happy path and edge cases
6. **Screenshot the result** - Capture visual proof

## Authentication

Test credentials (from `.env.local`):
- Email: `addisonkowalski+agent@gmail.com`
- Password: `wqg_MEX-ufw5mha6cpy`

```bash
agent-browser open http://localhost:3000
agent-browser snapshot -i
agent-browser click @e3          # "Sign in" button
agent-browser snapshot -i
agent-browser fill @e6 "addisonkowalski+agent@gmail.com"
agent-browser fill @e7 "wqg_MEX-ufw5mha6cpy"
agent-browser click @e9          # "Continue" button
agent-browser wait 2000
agent-browser get url            # Should be /generate
```

## Testing Pattern

```bash
# 1. Check dev server
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# 2. Navigate to feature
agent-browser open http://localhost:3000/<route>

# 3. Get interactive elements
agent-browser snapshot -i

# 4. Interact with the feature
agent-browser click @<ref>
agent-browser fill @<ref> "test input"

# 5. Verify result
agent-browser snapshot -i        # Check updated state
agent-browser screenshot /tmp/browser-test-result.png

# 6. Check for errors
agent-browser errors
```

## What to Verify

- Page loads without errors
- Expected elements are present (buttons, inputs, text)
- Interactions produce correct results (form submits, navigation, state changes)
- No console errors after interactions
- Visual output matches expectations (take screenshot)

## Examples

### After adding a new page
```bash
agent-browser open http://localhost:3000/new-page
agent-browser snapshot -i
agent-browser screenshot /tmp/new-page.png
agent-browser errors
```

### After adding a form feature
```bash
agent-browser open http://localhost:3000/generate
agent-browser snapshot -i
agent-browser fill @e5 "test prompt with [icon] wildcard"
agent-browser snapshot -i        # Verify wildcard parsed
agent-browser screenshot /tmp/form-test.png
```

### After fixing a bug
```bash
# Reproduce the original bug scenario
agent-browser open http://localhost:3000/<affected-route>
agent-browser snapshot -i
# Perform the action that previously triggered the bug
agent-browser click @<ref>
agent-browser wait 1000
# Verify the fix
agent-browser snapshot -i
agent-browser errors             # Should be clean
agent-browser screenshot /tmp/bug-fix-verified.png
```

## Guidelines

- Always run `snapshot -i` before interacting - refs change between page loads
- Wait after async actions (API calls, animations) before asserting
- Check `agent-browser errors` to catch silent failures
- Take screenshots as evidence of working state
- If the dev server isn't running, inform the user rather than failing silently
- Test both the happy path and at least one edge case when possible
