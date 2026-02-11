# Naming Conventions

How Lucide icons are named. Use this guide when naming new icons or validating existing names.

---

## Core Format

- **Lowercase kebab-case**: `arrow-right`, `map-pin`, `file-text`
- **International English** terminology (not locale-specific)
- **No special characters** — only lowercase letters and hyphens

---

## Naming Philosophy: Visual, Not Functional

Icons are named for what they **look like**, not what they **do**.

| Correct (Visual) | Wrong (Functional) | Why |
|-------------------|--------------------|----|
| `pen` | `edit` | It looks like a pen |
| `magnifying-glass` / `search` | `find` | It looks like a magnifying glass |
| `house` | `home` | It looks like a house |
| `trash-2` | `delete` | It looks like a trash can |
| `floppy-disk` | `save` | It looks like a floppy disk |
| `bell` | `notification` | It looks like a bell |

**Exception**: Some names are so universally understood as functions that the functional name IS the visual name (e.g., `search` — everyone sees a magnifying glass as "search").

---

## Grouping & Variants

### Group Format: `<group>-<variant>`

Related icons share a group prefix:

```
arrow-up
arrow-down
arrow-left
arrow-right
arrow-up-left
arrow-down-right
```

```
chevron-up
chevron-down
chevron-left
chevron-right
```

```
align-left
align-center
align-right
align-justify
```

### Container Variants: `<container>-<content>`

When an icon places content inside a container shape:

```
circle-check      (check inside circle)
circle-x          (x inside circle)
circle-alert      (alert inside circle)
square-check      (check inside square)
square-x          (x inside square)
```

### State Variants

Suffixes indicate icon state:

```
eye              (default/open)
eye-off          (crossed out)
bell             (default)
bell-ring        (ringing state)
bell-off         (muted)
volume           (default)
volume-1         (low)
volume-2         (high)
volume-x         (muted)
```

---

## Element Ordering in Names

### Multiple elements: decreasing size

Name the largest element first:

```
file-text        (file shape + text lines inside)
file-image       (file shape + image inside)
folder-open      (folder + open state)
```

### Equal-sized elements: front-to-back or reading order

```
layers           (stacked equally-sized shapes)
columns          (left-to-right columns)
```

---

## Modifiers

Applied to elements as `[element]-[modifier]`:

```
star-half        (half-filled star)
circle-dot       (circle with center dot)
bell-ring        (bell in ringing state)
cloud-rain       (cloud with rain drops)
sun-moon         (sun transitioning to moon)
```

### Common Modifiers

| Modifier | Meaning |
|----------|---------|
| `-off` | Disabled/crossed out |
| `-plus` | With addition symbol |
| `-minus` | With subtraction symbol |
| `-x` | With X/close symbol |
| `-check` | With checkmark |
| `-half` | Half-filled/half state |
| `-dot` | With center dot |

---

## Number Usage

**No numerals** in icon names unless the icon literally represents a number.

| Correct | Wrong | Why |
|---------|-------|-----|
| `hash` | `number-sign` | Visual name for # |
| `binary` | `01-code` | Descriptive name |

**Exception**: Sequential variants of the same concept:
- `volume-1`, `volume-2` (volume levels)
- `heading-1`, `heading-2`, `heading-3` (heading sizes)

---

## Aliased Names

Some icons have multiple valid names (aliases). This happens when:
1. **Feather legacy**: Original Feather name kept as alias (e.g., `home` → `house`)
2. **Consistency renames**: Better name chosen, old name kept for compatibility
3. **Common alternatives**: Both names are valid visual descriptions

### Import Patterns (React)

```typescript
// All three import the same icon:
import { House } from "lucide-react";        // Default
import { HouseIcon } from "lucide-react";    // Suffixed
import { LucideHouse } from "lucide-react";  // Prefixed
```

### Common Aliases

| Primary Name | Alias | Reason for Rename |
|-------------|-------|-------------------|
| `house` | `home` | Visual accuracy |
| `pen` | `edit-2` | Visual accuracy |
| `pen-line` | `edit-3` | Visual accuracy |
| `square-pen` | `edit` | Visual accuracy |
| `rotate-ccw` | `undo` | Visual accuracy |
| `rotate-cw` | `redo` | Visual accuracy |

---

## Naming Decision Flowchart

When naming a new icon:

1. **What does it look like?** → Use that as the base name
2. **Is there a group it belongs to?** → Use `<group>-<variant>` format
3. **Does it have a state?** → Add modifier suffix (`-off`, `-plus`, etc.)
4. **Does it contain something inside?** → `<container>-<content>`
5. **Is the name already taken?** → Find a more specific visual descriptor
6. **Is it internationally clear?** → Avoid locale-specific terms

### Good Names

- `coffee` — clearly a coffee cup shape
- `shield-check` — shield with checkmark inside
- `cloud-lightning` — cloud with lightning bolt
- `folder-tree` — folder with tree structure

### Bad Names

- `secure` — functional, not visual (use `shield`)
- `notification-active` — functional (use `bell-ring`)
- `save-file` — functional (use `floppy-disk` or `download`)
- `go-back` — functional (use `arrow-left` or `undo`)
