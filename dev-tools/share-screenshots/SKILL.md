---
name: share-screenshots
description: Capture screenshots of work just done - on the web app (agent-browser) or the Expo iOS app (simulator) - upload them to CDN, and return one shareable gallery link. Use when the user wants to show or share screenshots of what was built ("screenshot the app", "grab some screens", "share screenshots", "show me the screens"). NOT for testing or pass/fail verification - use the e2e-test skill for verify-and-report.
---

# Share Screenshots

Capture a set of screenshots of the work just done, on web or iOS, and hand back **one shareable gallery link**.

This is the lightweight cousin of `e2e-test`: no user stories, no pass/fail, no QA report - just snap the screens and share them. If the user wants verification + a hosted QA report, use `e2e-test` instead.

## Critical rules

- **Always upload to CDN and return a link.** Screenshots + the gallery HTML upload via `scripts/upload-artifact.sh` (dependency-free node; reads `R2_*` env). If `R2_*` is missing, **fail loudly** with the fix - never return only local `file://` paths.
- **Capture the current/visible state by default.** Only navigate to other screens (serve-sim taps / Maestro / agent-browser routes) when the user names specific screens to capture.
- **Wait for the screen to settle before each shot - never shoot on a timer or right after a tap/navigation.** A frame grabbed mid-load is a blank/spinner screenshot. Gate the capture on the screen's anchor being visible first: web - `agent-browser wait --text "<anchor>"` (or a locator) before `screenshot`; iOS - a Maestro `assertVisible: "<anchor>"` (or poll the screen) before `simctl io screenshot`. This matters most when you navigate to a named screen before capturing.
- **Multi-app simulator etiquette (iOS):** prefer a pinned simulator **UDID** over a device *name* (name-matching can boot a *different* device that shares the family name) and use dedicated ports; **confirm the intended app is the foreground app on that UDID before shooting** (`xcrun simctl listapps <UDID> | grep <bundleId>`, launch if needed) so you never screenshot the wrong app; never run global simulator-erase or kill-all; only shut down the simulator you booted.
- **Fresh worktree?** Run the repo's setup script first (`node scripts/setup-codex-worktree.mjs`, else `pnpm install`) before flagging missing deps. Only stop-and-instruct for what a repo script can't fix (R2 creds, Xcode, system tools).

## Setup

- **R2 env** - `R2_ENDPOINT`, `R2_BUCKET`, `R2_PUBLIC_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`. Store in `~/.claude/settings.json` `env` (and your Codex env). The uploader needs no aws CLI.
- **Node** - the uploader + gallery builder.
- **Web** - agent-browser. **iOS** - Xcode + a booted simulator (`xcrun simctl`).

## Workflow

1. **Pick the platform from the work.** Web → agent-browser; Expo iOS → the simulator. Do both if the work spans both.
2. **Capture** into `docs/screenshots/<name>/`:
   - Web: `agent-browser screenshot docs/screenshots/<name>/<slug>.png` (current page, or named routes).
   - iOS: `xcrun simctl io <udid> screenshot docs/screenshots/<name>/<slug>.png` (current screen; navigate only if specific screens were requested).
3. **Upload each shot** and collect the URLs:
   ```bash
   bash scripts/upload-artifact.sh docs/screenshots/<name>/<slug>.png   # prints the CDN URL
   ```
4. **Build one gallery page:**
   - Write `docs/screenshots/<name>/manifest.json`:
     ```json
     { "title": "Onboarding cover art", "subtitle": "iOS - iPhone 16 Pro",
       "shots": [ { "url": "<cdn-url>", "caption": "Cover picker", "group": "iOS" } ] }
     ```
     `group` is optional - set it (e.g. `"Web"` / `"iOS"`) to split the gallery into sections.
   - `node scripts/build-gallery.mjs docs/screenshots/<name>/manifest.json docs/screenshots/<name>/gallery.html`
   - Upload it: `bash scripts/upload-artifact.sh docs/screenshots/<name>/gallery.html`
5. **Return the gallery URL** - the single link to share - and verify it's live: `bash scripts/upload-artifact.sh --verify <gallery-url>`.

## Raw-links fallback

If the user only wants the image URLs (no gallery page), skip steps 4-5 and return the uploaded screenshot URLs from step 3.

## Quality bar

Every run: screenshots captured for the requested work, all uploaded and `200`-verified, one shareable gallery link returned (or raw links if asked), and the simulator left as it was found.

## References

| File | Purpose |
|------|---------|
| [scripts/build-gallery.mjs](scripts/build-gallery.mjs) | manifest JSON → self-contained gallery HTML |
| [scripts/upload-artifact.sh](scripts/upload-artifact.sh) | upload to R2 + `--verify`; reads `R2_*` env (wraps `upload-artifact.mjs`) |
