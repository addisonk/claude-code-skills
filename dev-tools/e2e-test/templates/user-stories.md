# {{FEATURE_NAME}} - User Stories

> **Tested on:** {{DATE}}
> **Platforms:** {{PLATFORMS}}  · **Devices:** {{DEVICES}}  · **Capture:** {{CAPTURE_FORMAT}}

Each story has a label (`1a`, `2a`, `3a`…) that must match its artifact filenames
(`screenshot-1a-NN-*.png`, `recording-1a-*.mp4`, `specs/1a-*.spec.ts`, `flows/3a-*.yaml`).

> Write **one story per screen or discrete action**, not a coarse multi-screen
> transition. Each story should map to a screen the userflow can show; capture a
> screenshot at every screen as you go (`screenshot-<label>-01-...`, `-02-...`).

## Web Desktop

> Scripted web stories get a Playwright test (`specs/<label>-*.spec.ts`) + an
> agent-browser recording; exploratory stories get the recording only and are
> flagged "not yet regression-covered" in the report gaps block.

- [ ] **1a.** As a {{USER_TYPE}}, I {{ACTION}} and {{EXPECTED_OUTCOME}}
- [ ] **1b.** As a {{USER_TYPE}}, I {{ACTION}} and {{EXPECTED_OUTCOME}}

## Web Mobile

- [ ] **2a.** As a {{USER_TYPE}} on mobile web, I {{ACTION}} and {{EXPECTED_OUTCOME}}

## iOS

> Drop this section if no Expo app exists. Scripted stories get a Maestro flow +
> recording; exploratory stories get a serve-sim recording and are flagged
> "not yet regression-covered" in the report gaps block.

- [ ] **3a.** As a {{USER_TYPE}} on iOS, I {{ACTION}} and {{EXPECTED_OUTCOME}}

---

## Notes

- {{Test environment notes, blocked stories, or edge cases}}
