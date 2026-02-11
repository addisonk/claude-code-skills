# React Native Reusables Audit Checklist

## Pre-Audit: Configuration Check

Before auditing components, verify the project setup:

### Critical Configuration

| Check | File | What to Look For | Action if Missing |
|-------|------|------------------|-------------------|
| PortalHost | `app/_layout.tsx` | `<PortalHost />` as last child | Add after Stack |
| inlineRem | `metro.config.js` | `inlineRem: 16` in withNativeWind | Add to config |
| Dark mode selector | `global.css` | `.dark:root` (not `.dark`) | Change to `.dark:root` |
| cn() helper | `lib/utils.ts` | Exports `cn` function | Add utility |
| Theme sync | `lib/theme.ts` | Matches `global.css` variables | Run sync prompt |

### Optional Configuration

| Check | File | What to Look For | Impact |
|-------|------|------------------|--------|
| components.json | Root | CLI configuration | CLI won't work |
| tailwind.config.js | Root | Nativewind preset | Styles won't compile |
| hairlineWidth | tailwind.config.js | `borderWidth: { hairline }` | 1px borders inconsistent |

---

## Component Audit Checklist

### 1. Structure & Behavior Layer

#### Accessibility
- [ ] `accessible={true}` on interactive elements
- [ ] `role` prop set appropriately (`button`, `checkbox`, etc.)
- [ ] `aria-label` or `accessibilityLabel` for icon-only buttons
- [ ] Focus management for modals and dialogs

#### RN Primitives Usage
- [ ] Using RN Primitives for complex interactions (not custom implementations)
- [ ] Portal components have PortalHost configured
- [ ] Ref-based control for DropdownMenu, ContextMenu
- [ ] Slot pattern for asChild composition

### 2. Styling Layer

#### cn() Usage
- [ ] All className props pass through cn()
- [ ] Conditional classes use cn() not template literals
- [ ] User className is last parameter (allows overrides)

```typescript
// Correct
className={cn(baseStyles, conditionalStyle, className)}

// Incorrect
className={`${baseStyles} ${conditionalStyle} ${className}`}
```

#### CVA Implementation
- [ ] Variants extracted to cva() (not inline conditionals)
- [ ] defaultVariants specified
- [ ] VariantProps exported with types
- [ ] Both component and variants exported

#### Platform-Specific Styles
- [ ] `hover:` states wrapped in `Platform.select({ web: })`
- [ ] `active:` states used for native press feedback
- [ ] Web-only features (focus-visible, pointer-events) gated

```typescript
// Correct
cn(
  'active:bg-primary/90',  // Native press state
  Platform.select({ web: 'hover:bg-primary/90' })  // Web hover
)

// Incorrect - hover won't work on native
'hover:bg-primary/90 active:bg-primary/90'
```

#### TextClassContext
- [ ] Components with text children provide TextClassContext
- [ ] Text component consumes TextClassContext
- [ ] Text variant styles match component variants

### 3. Interface Layer

#### Props Pattern
- [ ] Extends native component props (Pressable, View, etc.)
- [ ] Includes VariantProps from CVA
- [ ] Supports ref forwarding
- [ ] Optional asChild prop for composition

#### Exports
- [ ] Component exported
- [ ] Variants exported (e.g., `buttonVariants`)
- [ ] Text variants exported if applicable
- [ ] Types exported

---

## Common Issues Quick Reference

### Critical Issues (Must Fix)

| Issue | Symptom | Fix |
|-------|---------|-----|
| Missing PortalHost | Modals/menus don't appear | Add `<PortalHost />` to root layout |
| Missing inlineRem | Sizing inconsistent | Add `inlineRem: 16` to metro.config.js |
| Using .dark | Dark mode broken on native | Change to `.dark:root` in global.css |
| hover: without Platform.select | Hover states on native | Wrap in `Platform.select({ web: })` |

### Important Issues (Should Fix)

| Issue | Symptom | Fix |
|-------|---------|-----|
| No TextClassContext | Text styles don't inherit | Add Provider to parent component |
| Direct className | Style overrides don't work | Wrap in cn() |
| Inline conditionals | Hard to maintain | Extract to cva() |
| Missing role prop | Accessibility issues | Add appropriate role |

### Opportunities (Could Improve)

| Enhancement | Benefit | Implementation |
|-------------|---------|----------------|
| Export variants | External styling | `export { buttonVariants }` |
| asChild support | Composition | Add Slot pattern |
| Ref forwarding | External control | `React.forwardRef` |

---

## Audit Output Template

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 AUDIT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 [X] Critical  |  🟡 [X] Important  |  🟢 [X] Opportunities

**Configuration**: [OK / Issues found]
**Components audited**: [count]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Configuration Issues

| | Issue | File | Action |
|-|-------|------|--------|
| 🔴 | [Issue] | `file` | [Fix] |

## Component Issues

### [ComponentName]

**What's Working**
- ✓ [Observation] — `file:line`

**Issues**
| | Issue | Location | Action |
|-|-------|----------|--------|
| 🔴 | [Critical issue] | `file:line` | [Fix] |
| 🟡 | [Important issue] | `file:line` | [Fix] |

**Opportunities**
| | Enhancement | Impact |
|-|-------------|--------|
| 🟢 | [Enhancement] | [Benefit] |

---

## Recommendations Summary

**Critical (Must Fix)**
1. [Issue] — [Brief action]

**Important (Should Fix)**
1. [Issue] — [Brief action]

**Opportunities**
1. [Enhancement] — [Brief benefit]
```

---

## Quick Audit Commands

```bash
# Check for missing Platform.select on hover
grep -r "hover:" --include="*.tsx" components/

# Check for PortalHost
grep -r "PortalHost" app/

# Check inlineRem
grep -r "inlineRem" metro.config.js

# Check dark mode selector
grep -r "\.dark" global.css

# Check cn() usage
grep -r "className=" --include="*.tsx" components/ | grep -v "cn("
```
