# Expo iOS Arm - serve-sim + Maestro

The Expo arm tests the iOS app in a simulator. Two tools, distinct roles:

- **Maestro** - the semantic driver and the **durable, rerunnable regression asset**. It reads the view hierarchy, so it can locate elements (`tapOn: "Continue"`, by id, by text) and assert. The Maestro flow YAML is what you keep and re-run later. **Maestro needs a JDK** (`brew install --cask temurin`); a bare `/usr/bin/java` stub will fail with "Unable to locate a Java Runtime".
- **serve-sim** (verified v0.1.41) - the agent's **eyes and hands**. It streams the simulator to the browser as an MJPEG video and exposes a CLI for coordinate input: `tap <x> <y>` (normalized 0..1 coords), `gesture '<json>'`, `button`, `type`, `rotate`. It does **not** record - capture video with `xcrun simctl io ... recordVideo` (step 5). Because it's a video stream (not a DOM), agent-browser's semantic locators do **not** work against it - do not try to drive the app by pointing agent-browser at the serve-sim web UI.

> serve-sim ships its own agent skill (`skills/serve-sim` in the serve-sim repo) and Maestro authoring is covered by the `maestro-e2e` skill. Prefer those for deep tool detail; this file covers how the e2e-test workflow wires them together. serve-sim isn't always pre-installed - confirm its exact CLI with `npx serve-sim --help` before relying on flag names below.

## Canonical per-story deliverable

For each iOS story: **a rerunnable Maestro flow + a simulator screen recording of the run** (`xcrun simctl io ... recordVideo`).

Exception - **serve-sim-only exploratory** verification (recording + screenshots, no Maestro flow) is allowed for stories too awkward to script or one-off smoke checks. Mark every such story "not yet regression-covered" in the report's `gaps` block. Never silently skip the flow without flagging it.

## Multi-app simulator etiquette (critical)

Multiple iOS testing sessions can share one machine. To avoid stepping on another agent's app:

- **Target a specific simulator** by UDID or exact device name - never a global command.
- **Use dedicated ports** per app: a serve-sim port (`-p`) and a Metro/Expo port distinct from any other running app.
- **Never** run `xcrun simctl erase all`, `shutdown all`, or `serve-sim --kill` blindly. Those hit every app.
- **Before stopping** any simulator, Metro, or serve-sim process, identify the owning repo/app and port (see "Inventory" below). Only stop the ones this run started.
- On cleanup, stop only this run's serve-sim stream (kill it by its device, never bare `--kill`) and the simulator this run booted - leave others running.

### Inventory before acting

```bash
xcrun simctl list devices booted          # which simulators are up (note UDIDs)
npx serve-sim --list                       # running serve-sim streams + their ports
lsof -iTCP -sTCP:LISTEN | grep -E '3100|3200|8081'   # who owns the ports
```

## Workflow

### 1. Pick + boot a dedicated simulator

```bash
xcrun simctl list devices available | grep -i iphone     # choose a device + grab its UDID
xcrun simctl boot <UDID>                                  # boot only that one
```
Record the UDID for the run; pass it explicitly to every subsequent command.

**What "a clean simulator" means:** a booted device is *not* a fresh-install state, and a reboot only clears runtime/recorder state, not onboarding-completion. If the test needs true first-run state, either `xcrun simctl erase <UDID>` **this device only** (never `erase all`) before installing, or force the flow through the app's own reviewer/replay entry (e.g. a sign-in token + `?replay=1`). State which you did in the report - don't imply a full wipe you didn't do.

### 2. Start the app (dedicated Metro/Expo port)

Launch the Expo dev server on a non-default port so it can't collide with another app, and install/open the build on the chosen simulator. Confirm the app is up before driving.

### 3. Start serve-sim on a dedicated port

```bash
npx serve-sim "<device name>" -p <ourPort> --detach     # detached (daemon) stream for the chosen device
```
serve-sim's defaults are preview `:3200` and stream `:3100`; `-p` sets the starting port so concurrent runs don't clash. Open the preview in agent-browser only to **watch/screenshot** the stream - not to drive.

### 4. Author + run the Maestro flow

Use serve-sim to observe while you write the flow; author element-based steps (`tapOn`, `assertVisible`, `inputText`) so the flow is robust. Use serve-sim's CLI only for input Maestro can't express - `npx serve-sim tap <x> <y>` (normalized 0..1), `npx serve-sim gesture '<json>'` for custom swipes/pinch, `button` / `type` / `rotate`. Save the flow under the test folder:

```bash
# docs/testing/<feature>/flows/<label>-<slug>.yaml
maestro --udid <UDID> test docs/testing/<feature>/flows/<label>-<slug>.yaml
```

### 5. Record the run (`xcrun simctl io`, ONE recording for the whole iOS flow)

serve-sim does not record - capture the simulator screen directly. **A single Maestro flow that walks several stories (3a/3b/3c) in one session produces ONE recording** - name it for the story group, `recording-<group>-<slug>.mp4` (e.g. `recording-3-ios-onboarding.mp4`); never copy that clip into fake per-story files (the audit accepts a group recording). Per-story distinction comes from the screenshots, not duplicated videos. Start it **before** the flow / exploratory interaction, then stop it cleanly with SIGINT:

```bash
xcrun simctl io <UDID> recordVideo --codec h264 docs/testing/<feature>/recording-<group>-<slug>.mp4 &
REC_PID=$!
# ... run the Maestro flow (step 4) or do the exploratory interaction ...
kill -INT $REC_PID      # SIGINT finalizes the file; a hard kill corrupts it
```
This is the recorder for both scripted and exploratory stories; Maestro's built-in recording is not required. The `.mp4` extension makes `simctl` write an MP4 directly (no ffmpeg step needed). If `recordVideo` errors with **"Host recording is already in progress,"** a prior recorder never finalized - find and `kill -INT` it (or reboot only this UDID) before retrying, and verify the `.mp4` actually landed (a flow can pass while the recorder silently produced no file).

### 6. Capture screenshots + logs

Take a screenshot at **every screen** the flow passes through (not just one per story) - each becomes a frame in the `userflows` block, so the report shows the whole journey. **Wait for the screen to settle first** - `simctl io screenshot` grabs whatever pixels are on the device *right now*, so shoot only after the screen's anchor is up. Drive the screenshots **from inside the Maestro flow**: `assertVisible: "<anchor>"` (auto-waits, with retry) then `waitForAnimationToEnd`, then `takeScreenshot`. Never `sleep` before a shot. (See the `maestro-e2e` skill - `rules/assertions.md`, `rules/advanced/waiting.md`.)

```yaml
# in the flow: settle, then capture - one per screen, named in order
- assertVisible: "What do you want to hear about?"
- waitForAnimationToEnd
- takeScreenshot: docs/testing/<feature>/screenshot-<label>-02-topic
```
If you must screenshot from the shell instead, `assertVisible` the anchor via a tiny Maestro step (or poll the serve-sim stream) before the `simctl` shot:
```bash
xcrun simctl io <UDID> screenshot docs/testing/<feature>/screenshot-<label>-01-welcome.png
# ... assert the next screen's anchor is visible (Maestro), then ...
xcrun simctl io <UDID> screenshot docs/testing/<feature>/screenshot-<label>-02-topic.png
```
Save the Maestro run output / report and the flow YAML as artifacts - they upload alongside the recording and feed the report's `maestro` block.

### 7. Report evidence

- `flow-results` row per story (status + device).
- `maestro` block listing the flow YAML + Maestro report artifacts (uploaded URLs).
- `recording` block with the screen-recording MP4 (mandatory).
- `gaps` entry for any serve-sim-only story ("not yet regression-covered").

### 8. Cleanup (etiquette-safe)

```bash
npx serve-sim --kill "<device-name-or-udid>"   # stop only our stream, by device (bare --kill kills ALL)
xcrun simctl shutdown <UDID>                    # shut down only the sim we booted
```
Stop the Metro/Expo process this run started. Do not touch other simulators, streams, or ports.

## Artifact naming (matches web arm + audit script)

```
docs/testing/<feature>/
├── flows/3a-onboarding-continue.yaml
├── recording-3a-onboarding-continue.mp4
├── screenshot-3a-onboarding-continue.png
└── maestro-3a-report.xml            # optional Maestro report output
```
