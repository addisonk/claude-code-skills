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

**Pin the UDID in `e2e-config.json` (`expo.simulatorUdid`); don't let the tooling pick by name.** Expo / `simctl` device-*name* matching can boot a different device that shares the family name (e.g. a stray "Diem iPhone 17" instead of the intended "iPhone 17 Pro Max"), silently running the whole test on the wrong sim. Target the exact UDID everywhere.

**Identity preflight before each Maestro leg.** Confirm the app you intend to drive is actually installed and frontmost on *that* UDID before handing off to Maestro, so a flow never runs against the wrong app/device:
```bash
xcrun simctl listapps <UDID> | grep <bundleId>        # installed on this exact device?
xcrun simctl launch <UDID> <bundleId>                 # foreground it
# then verify it's frontmost (serve-sim frame / a Maestro assertVisible on a known app anchor)
```

### 2. Start the app (dedicated Metro/Expo port)

Launch the Expo dev server on a non-default port so it can't collide with another app, and install/open the build on the chosen simulator. Confirm the app is up before driving.

### 3. Start serve-sim on a dedicated port

```bash
npx serve-sim "<device name>" -p <ourPort> --detach -q   # JSON: {"url":..., "streamUrl":..., ...}
```
`-p` sets the starting port so concurrent runs don't clash (defaults preview `:3200`, stream `:3100`). **Open the `url` from the `-q` JSON - the preview UI - and never the raw `streamUrl`/`:3100/stream.mjpeg`.** That endpoint is the binary MJPEG the preview *consumes*, not a viewable page, so a browser pointed at it shows nothing usable (a common dead end). Don't hard-code `:3100` or `:3200` either - read the actual `url`/`streamUrl` from the JSON, since `-p` shifts them. Open the preview only to **watch/screenshot**, not to drive.

**Optional single-origin preview:** serve-sim also ships a Metro/dev-server middleware - `import { simMiddleware } from "serve-sim/middleware"` then `app.use(simMiddleware({ basePath: "/.sim" }))` in `metro.config.js` - so the preview is served at `<metroOrigin>/.sim` (e.g. `http://localhost:8082/.sim`). Convenient if you want one origin, but **not required**: the standalone `url` works with no config change.

### 4. Author + run the Maestro flow

Use serve-sim to observe while you write the flow; author element-based steps (`tapOn`, `assertVisible`, `inputText`) so the flow is robust. Use serve-sim's CLI only for input Maestro can't express - `npx serve-sim tap <x> <y>` (normalized 0..1), `npx serve-sim gesture '<json>'` for custom swipes/pinch, `button` / `type` / `rotate`. Save the flow under the test folder:

```bash
# docs/testing/<feature>/flows/<label>-<slug>.yaml
maestro --udid <UDID> test docs/testing/<feature>/flows/<label>-<slug>.yaml
```

**Verifying something the run just created (e.g. a published episode):** assert it by its *own identity*, not by ordinal position. Capture the artifact's identity during the run (write the published title/id to a file like `published-episode.json`), then in the flow **reset scroll to top**, `assertVisible` that exact title/id, and tap a *stable* control (a labelled "Play latest episode" button, not `row-first`). Positional testIDs like `episode-row-first` drift to a neighboring row when the feed reorders or is scrolled, which false-fails the last mile of an otherwise-passing live run.

### 5. Record the run (`xcrun simctl io`, one pipeline for all iOS stories)

serve-sim does not record - capture the simulator screen directly. Start it **before** the flow / exploratory interaction, then stop it cleanly with SIGINT:

```bash
xcrun simctl io <UDID> recordVideo --codec h264 docs/testing/<feature>/recording-<label>-<slug>.mp4 &
REC_PID=$!
# ... run the Maestro flow (step 4) or do the exploratory interaction ...
kill -INT $REC_PID      # SIGINT finalizes the file; a hard kill corrupts it
```
This is the recorder for both scripted and exploratory stories; Maestro's built-in recording is not required. The `.mp4` extension makes `simctl` write an MP4 directly (no ffmpeg step needed).

### 6. Capture screenshots + logs

Take a screenshot at **every screen** the flow passes through (not just one per story) - each becomes a frame in the `userflows` block, so the report shows the whole journey:

```bash
# one per screen, named in order: <label>-NN-<screen>.png
xcrun simctl io <UDID> screenshot docs/testing/<feature>/screenshot-<label>-01-welcome.png
xcrun simctl io <UDID> screenshot docs/testing/<feature>/screenshot-<label>-02-topic.png
# ... step the app forward (Maestro/serve-sim), screenshot each screen ...
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
