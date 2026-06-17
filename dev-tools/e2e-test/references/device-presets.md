# Device & Viewport Presets Reference

Complete reference for all supported devices and desktop viewport sizes.

## Desktop Presets

Custom viewport sizes set via `agent-browser set viewport <width> <height>`.

| Preset | Width | Height | Notes |
|--------|-------|--------|-------|
| Small laptop | 1280 | 800 | 13" MacBook Air |
| Laptop (default) | 1440 | 900 | 15" MacBook Pro |
| Desktop | 1680 | 1050 | External monitor |
| Large desktop | 1920 | 1080 | Full HD monitor |

**Example:**
```bash
agent-browser open http://localhost:3000
agent-browser set viewport 1440 900
agent-browser set media dark
```

## Mobile Device Presets

Device presets set via `agent-browser set device "<name>"`. These properly configure viewport, user agent, touch events, and device scale factor.

| Preset | Device Name | Viewport | Scale | Platform |
|--------|-------------|----------|-------|----------|
| iPhone 12 | `"iPhone 12"` | 390x844 | 3.0 | iOS |
| iPhone 14 (default) | `"iPhone 14"` | 390x844 | 3.0 | iOS |
| iPhone 15 | `"iPhone 15"` | 393x852 | 3.0 | iOS |
| iPad | `"iPad"` | 820x1180 | 2.0 | iOS |
| iPad Pro | `"iPad Pro"` | 1024x1366 | 2.0 | iOS |
| Pixel 5 | `"Pixel 5"` | 393x851 | 2.75 | Android |
| Pixel 7 | `"Pixel 7"` | 412x915 | 2.625 | Android |
| Galaxy S21 | `"Galaxy S21"` | 360x800 | 3.0 | Android |

**Example:**
```bash
agent-browser close                        # Close desktop session first
agent-browser open http://localhost:3000
agent-browser set device "iPhone 14"
agent-browser reload && agent-browser wait --load networkidle   # Required for media queries
agent-browser set media dark
```

**Gotcha:** `set device` changes the viewport but CSS media queries don't re-evaluate until a reload. Auth redirects (e.g. Clerk) also reset the viewport — re-apply `set device` + reload after sign-in. If `set device` doesn't take effect, fall back to `set viewport 390 844`.

## iOS Simulator (macOS + Xcode + Appium)

For real mobile Safari testing:
```bash
agent-browser -p ios --device "iPhone 16 Pro" open http://localhost:3000
agent-browser -p ios snapshot -i
agent-browser -p ios tap @e1
agent-browser -p ios screenshot mobile.png
agent-browser -p ios close
```

## Custom Viewport

Users can specify any dimensions:
```bash
agent-browser set viewport 1366 768    # Any width/height
```

## Important Rules

- **Always close the desktop session before switching to mobile.** Open a fresh session, then `set device`.
- **Always reload after `set device` or `set viewport`.** Media queries need a page reload to take effect.
- **Viewport resets after auth redirects.** Re-apply `set device` (or `set viewport`) + reload after sign-in.
- **Start recording AFTER viewport is stable.** Never record before device/viewport is set — the video dimensions will be wrong.
- **Always `set media dark` after opening any session.**
- **Test all desktop stories first**, then close and reopen with `set device` for mobile.
- **Headless is default.** Use `--headed` only for debugging.
