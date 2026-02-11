# React Native Reusables Architecture

## Two-Layer Architecture

React Native Reusables follows the same two-layer architecture as shadcn/ui, adapted for React Native.

### Layer 1: Structure & Behavior (RN Primitives)

RN Primitives provides headless, accessible components that handle:
- Keyboard navigation (for web)
- Touch interactions (for native)
- Focus management
- ARIA attributes (web)
- Accessibility roles (native)
- State management (open/closed, checked, etc.)

**Available Primitives:**

| Primitive | Package | Use Case |
|-----------|---------|----------|
| Accordion | `@rn-primitives/accordion` | Expandable sections |
| Alert Dialog | `@rn-primitives/alert-dialog` | Confirmation dialogs |
| Aspect Ratio | `@rn-primitives/aspect-ratio` | Fixed aspect containers |
| Avatar | `@rn-primitives/avatar` | User avatars with fallback |
| Checkbox | `@rn-primitives/checkbox` | Checkboxes |
| Collapsible | `@rn-primitives/collapsible` | Show/hide content |
| Context Menu | `@rn-primitives/context-menu` | Right-click menus |
| Dialog | `@rn-primitives/dialog` | Modal dialogs |
| Dropdown Menu | `@rn-primitives/dropdown-menu` | Dropdown menus |
| Hover Card | `@rn-primitives/hover-card` | Hover tooltips |
| Label | `@rn-primitives/label` | Form labels |
| Menubar | `@rn-primitives/menubar` | Menu bars |
| Popover | `@rn-primitives/popover` | Popovers |
| Portal | `@rn-primitives/portal` | Portal rendering |
| Progress | `@rn-primitives/progress` | Progress bars |
| Radio Group | `@rn-primitives/radio-group` | Radio buttons |
| Select | `@rn-primitives/select` | Select dropdowns |
| Separator | `@rn-primitives/separator` | Visual separators |
| Slider | `@rn-primitives/slider` | Range sliders |
| Slot | `@rn-primitives/slot` | asChild composition |
| Switch | `@rn-primitives/switch` | Toggle switches |
| Tabs | `@rn-primitives/tabs` | Tab navigation |
| Toggle | `@rn-primitives/toggle` | Toggle buttons |
| Toggle Group | `@rn-primitives/toggle-group` | Toggle button groups |
| Tooltip | `@rn-primitives/tooltip` | Tooltips |

### Layer 2: Styling (Nativewind + CVA)

The styling layer handles visual presentation:

**Nativewind** — Compiles Tailwind classes to React Native styles
- Supports most Tailwind utilities
- Uses CSS variables via `hsl(var(--color))`
- Platform prefixes: `web:`, `native:`, `ios:`, `android:`

**CVA (Class Variance Authority)** — Type-safe variant management
- Define variants with full TypeScript support
- Compose base styles with variant-specific overrides
- Export variants for external usage

**cn() Utility** — Class merging
- Combines clsx for conditionals
- Uses tailwind-merge to resolve conflicts

---

## File Structure

Standard React Native Reusables project structure:

```
project/
├── app/
│   ├── _layout.tsx          # Root layout with PortalHost
│   └── (tabs)/
│       └── index.tsx
├── components/
│   └── ui/
│       ├── button.tsx       # UI components
│       ├── text.tsx         # Text with TextClassContext
│       ├── dialog.tsx
│       └── ...
├── lib/
│   ├── utils.ts             # cn() helper
│   └── theme.ts             # TypeScript theme object
├── global.css               # CSS variables
├── tailwind.config.js       # Nativewind config
├── metro.config.js          # Metro with inlineRem
└── components.json          # CLI configuration
```

---

## Component Composition Pattern

Components follow a consistent composition pattern:

```
┌─────────────────────────────────────────┐
│           TextClassContext              │  ← Provides text styles
├─────────────────────────────────────────┤
│           RN Primitive                  │  ← Handles behavior
├─────────────────────────────────────────┤
│           CVA Variants                  │  ← Applies styling
├─────────────────────────────────────────┤
│           Platform.select()             │  ← Platform-specific
└─────────────────────────────────────────┘
```

Example flow for a Button:

1. **TextClassContext.Provider** wraps children with text variant styles
2. **Pressable** (or RN Primitive) handles touch/press behavior
3. **buttonVariants** from CVA applies base + variant styles
4. **Platform.select()** adds web-only hover or native-only active states
