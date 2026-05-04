# Presentational Blocks

A **block** is a copy-pasteable composition that ships a complete UI section — a dashboard, a sign-in flow, a feed, a settings panel — packaged as a folder of presentational components plus one wiring page. This follows the [shadcn/ui blocks](https://ui.shadcn.com/blocks) convention, where blocks are how you ship working layouts that another app can drop in and adapt.

The presentational rules at the top of `SKILL.md` apply at the block level too: every component inside a block stays presentational, and only the block's `page.tsx` is allowed to call hooks or read data.

## Folder structure

```
blocks/feed-01/
├── page.tsx                      → Wires hook(s) to components — only stateful file
├── components/
│   ├── feed-item.tsx             → Presentational
│   ├── feed-composer.tsx         → Presentational
│   └── feed-empty-state.tsx      → Presentational
├── hooks/use-feed.ts             → Block-specific hook (optional)
├── data.json                     → Mock data so the block previews standalone (optional)
└── lib/format-time.ts            → Block-specific util (optional)
```

## Rules

- Components in `components/` follow the rules at the top of the skill: no `useQuery`, no `useUser`, no routing — props and callbacks only.
- The block's `page.tsx` is the only file that may call hooks. It assembles the composition.
- Ship `data.json` (or hardcode mock data in `page.tsx`) so the block renders with no providers — that's what makes it copy-pasteable.
- A **block-specific hook** lives under the block's `hooks/` folder. A **reusable domain hook** that other components or blocks share lives at the app's top-level `hooks/`.
- Names are kebab-case with a numeric suffix when versions diverge: `dashboard-01`, `login-04`, `feed-01`.

## Component vs block

| Concern | Component | Block |
| --- | --- | --- |
| Scope | One presentational piece (card, row, header) | A composed section (dashboard, sign-in, feed) |
| Files | `components/foo.tsx` | `blocks/foo-01/` folder with `page.tsx` + `components/` |
| Wiring | A page elsewhere wires it | The block's own `page.tsx` wires it |
| Demo data | Mock props in tests/storybook | `data.json` or hardcoded in `page.tsx` |

If a single hook drives a single component, that's the component pattern. If a section composes multiple components and ships its own internal hook plus mock data so it previews standalone, it's a block.

## Worked example

```tsx
// blocks/feed-01/page.tsx — the only stateful file in the block
import data from "./data.json"
import { useFeed } from "./hooks/use-feed"
import { FeedComposer } from "./components/feed-composer"
import { FeedEmptyState } from "./components/feed-empty-state"
import { FeedItem } from "./components/feed-item"

export default function FeedPage() {
  // Real wiring uses the hook; preview falls back to bundled mock data.
  const { items = data.items, onPost, onLike } = useFeed?.() ?? {}

  if (items.length === 0) return <FeedEmptyState />
  return (
    <div>
      <FeedComposer onPost={onPost} />
      {items.map((item) => (
        <FeedItem key={item.id} item={item} onLike={() => onLike?.(item.id)} />
      ))}
    </div>
  )
}
```

The block can be copied into another app and dropped in as-is — it renders with the bundled mock data even before `useFeed` is wired up to real Convex queries. See `templates/block/` in this skill for a starter scaffold.
