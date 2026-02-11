# TOOLS.md — Writing Guide

TOOLS.md is a **cheat sheet** for environment-specific information. It does NOT control tool availability — it is purely context the agent reads to understand YOUR setup.

## The Cardinal Rule

**Skills define HOW tools work. TOOLS.md describes YOUR specifics.**

| Goes in TOOLS.md | Goes in a Skill |
|-------------------|-----------------|
| "Living room camera is `cam-livingroom-01`" | "How to use the camera tool" |
| "SSH to NAS: `ssh nas.local`" | "How to run remote commands" |
| "Preferred TTS voice: `nova`" | "How to use text-to-speech" |
| "Printer is `HP-OfficeJet-4th-floor`" | "How to send print jobs" |

## Structure

Use flat sections with structured data. No prose paragraphs — this is reference material.

```markdown
# Tools & Environment

## Smart Home
- **Living Room Light**: `hue-livingroom-main` (Philips Hue)
- **Bedroom Light**: `hue-bedroom-ceiling` (Philips Hue)
- **Thermostat**: Ecobee, target 72°F day / 68°F night
- **Front Door Camera**: `cam-front-01` (UniFi Protect)
- **Back Yard Camera**: `cam-yard-01` (UniFi Protect)

## SSH Hosts
- **NAS**: `ssh admin@nas.local` — Synology DS920+, media and backups
- **Dev Server**: `ssh dev@192.168.1.50` — Ubuntu, 64GB RAM, GPU workloads
- **Pi**: `ssh pi@homebridge.local` — Homebridge + monitoring

## Voice
- Preferred TTS voice: `nova`
- Preferred language: English (US)
- Wake word: "Hey [agent name]"

## Network
- Home WiFi: `MyNetwork-5G` (main) / `MyNetwork-IoT` (devices)
- VPN: WireGuard at `vpn.example.com`
- Pi-hole at `192.168.1.2`

## Frequently Used Paths
- Projects: `~/Projects/`
- Notes: `~/Documents/notes/`
- Media: `/volume1/media/` (NAS)
```

---

## What NOT to Put in TOOLS.md

### Secrets and credentials

```markdown
# NEVER do this
## API Keys
- OpenAI: sk-abc123...
- Stripe: sk_live_xyz...

# Instead, use environment variables or credential files
```

### Tool documentation

```markdown
# Bad — this is what skills are for
## How to Use the Browser Tool
The browser tool supports the following actions:
- screenshot: Takes a screenshot of...
- click: Clicks on element...

# Good — just your specifics
## Browser
- Default browser: Brave (not Chrome)
- Always use incognito for banking sites
```

### Operational instructions

```markdown
# Bad — this belongs in AGENTS.md
## When to search the web
Always try to answer from memory first. If uncertain, search.

# Good — just the facts
## Search
- Preferred search engine: Brave Search
- For code questions, check Stack Overflow first
```

---

## Size Guidelines

TOOLS.md should be the **shortest** bootstrap file. If it's longer than AGENTS.md, restructure.

| Setup | Target Size |
|-------|------------|
| Minimal (no smart home, basic dev) | 200–500 chars |
| Standard (some devices, SSH hosts) | 500–1,500 chars |
| Complex (full smart home, many servers) | 1,500–3,000 chars |

---

## Maintenance

TOOLS.md is a living document. Update it when:
- You add/remove devices
- Network addresses change
- You set up new servers
- You change preferences (TTS voice, default browser, etc.)

**Don't update it for:** tool behavior changes (update skills instead), general instructions (update AGENTS.md), personality changes (update SOUL.md).

---

## Common Mistakes

### Over-documenting

```markdown
# Bad
## Camera System
I have a UniFi Protect system with 4 cameras. The cameras are manufactured by
Ubiquiti and connected via PoE to a USW-Lite-16-PoE switch. The NVR is a
UNVR running firmware 3.0.14...

# Good
## Cameras (UniFi Protect)
- Front door: `cam-front-01`
- Back yard: `cam-yard-01`
- Garage: `cam-garage-01`
- Driveway: `cam-drive-01`
```

### Duplicating across TOOLS.md and skills

If a skill exists for a tool (e.g., a Home Assistant skill), TOOLS.md only needs device names and locations — not how to control them.

### Mixing environment facts with preferences

Keep them in separate sections. Facts don't change; preferences do.

```markdown
## Network (Facts)
- Router: 192.168.1.1 (UniFi Dream Machine)
- Pi-hole: 192.168.1.2

## Preferences
- Default SSH user: `admin`
- Preferred text editor: `nvim`
- Preferred package manager: `pnpm`
```
