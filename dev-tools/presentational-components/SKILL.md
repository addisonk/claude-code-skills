---
name: presentational-components
description: Enforces presentational UI component patterns where components receive all data via props and callbacks, with data logic in domain-focused hooks. Use when creating new components, reviewing component architecture, or separating data from presentation in React apps using Convex, Clerk, or similar providers.
---

# Presentational Components

UI components must be **presentational only** — they receive all data via props and call callback functions for actions.

## Rules

Components must NOT contain:
- `useQuery` or `useMutation` (Convex)
- `useUser` (Clerk)
- `useRouter` for navigation logic
- Any data fetching or external side effects

Local UI state via `useState` (form input, dropdown open/closed, hover) is fine — that's presentation, not data.

## Naming

Presentational components use simple names without suffixes:

| Good | Bad | Why |
| --- | --- | --- |
| `Message` | `MessageUI` | No suffix needed — all components are presentational |
| `PostCard` | `PostCardUI` | The component _is_ the UI |
| `JoinCard` | `JoinCardPresentation` | Verbose and unnecessary |

## Where Data Logic Goes

1. **Custom hooks** in `hooks/` — for reusable data patterns
2. **Page components** — for one-off data needs

## Hook Naming

Hooks should be **domain-focused**, not component-focused:

| Good (Domain) | Bad (Component) | Why |
| --- | --- | --- |
| `useCommunity` | `useJoinCard` | Reusable by any component needing community data |
| `usePostActions` | `usePostCard` | Reusable for delete/like actions anywhere |
| `useUser` | `useProfileCard` | User data needed in many places |

Domain hooks can serve multiple components:
- `useCommunity` → JoinCard, CommunityHeader, CommunitySidebar, MemberList
- `usePostActions` → PostCard, PostDetail, MessageList, ActivityFeed

## File Structure

```
components/feature/my-component.tsx  → Presentational component
hooks/use-{domain}.ts                → Domain-focused hook
```

## Pattern

```tsx
// hooks/use-community.ts — Domain-focused hook
export function useCommunity(slug: string) {
  const community = useQuery(api.communities.getBySlug, { slug });
  const join = useMutation(api.communityMembers.join);
  return { community, join, isLoading: !community };
}

// components/community/join-card.tsx — Presentational
export function JoinCard({ community, onJoin }: Props) {
  return (
    <Card>
      <h2>{community.name}</h2>
      <Button onClick={onJoin}>Join</Button>
    </Card>
  );
}

// app/c/[slug]/page.tsx — Page wires them together
export default function CommunityPage({ params }) {
  const { community, join } = useCommunity(params.slug);
  return <JoinCard community={community} onJoin={join} />;
}
```

## Worked Examples

### Simple: data + single action

Pass shaped data and named callbacks explicitly:

```tsx
<JoinCard
  community={{ name: "...", memberCount: 123 }}
  isMember={false}
  onJoin={handleJoin}
/>
```

Or spread the hook result when the hook already returns the props the component expects:

```tsx
const props = useCommunity({ communitySlug: "my-community" });
return <JoinCard {...props} />;
```

### Richer: permissions + multiple mutations

When a hook needs to compute permissions and own multiple mutations, take context as input and return everything the component needs as plain values and callbacks:

```tsx
// hooks/use-post-actions.ts
const actions = usePostActions({ post, communitySlug, communityOwnerId });
// → { canDelete, canEdit, onDelete, onLike, isLiked, ... }

// Page:
return <PostCard {...actions} post={post} communitySlug={communitySlug} />;
```

The component receives flags (`canDelete`, `isLiked`) and callbacks (`onDelete`, `onLike`) — never raw mutations, auth state, or routing.

## Adding New Components

1. **Start with the presentational component** — define props interface with all needed data and callbacks
2. **Create a domain-focused hook** in `hooks/` — name it after the data domain, not the UI component

## Presentational Blocks

A **block** is a copy-pasteable composition that ships a complete UI section (dashboard, sign-in, feed) — a folder of presentational components plus one wiring page. Follows the [shadcn/ui blocks](https://ui.shadcn.com/blocks) convention.

The same rules apply at the block level: components stay presentational, the block's `page.tsx` is the only file that calls hooks, and mock data lives alongside so the block previews without providers.

For folder layout, the block-vs-component decision, and a worked example, see [`references/blocks.md`](references/blocks.md).

## Templates

Starter scaffolds in `templates/`:

- [`templates/component.tsx`](templates/component.tsx) — presentational component
- [`templates/domain-hook.ts`](templates/domain-hook.ts) — domain-focused hook
- [`templates/block/`](templates/block) — full shadcn-style block scaffold (page + components + mock data)

## Benefits

- Components work in registries/storybooks without providers
- Easy testing with mock props
- Clear separation of concerns
- Reusable across different data sources

## Review Checklist

When reviewing or creating components, verify:

- [ ] Component has zero data-fetching imports
- [ ] All dynamic data comes through props
- [ ] All actions are callback props (e.g., `onJoin`, `onDelete`)
- [ ] Hook is named after the domain, not the component
- [ ] Hook lives in `hooks/use-{domain}.ts`
- [ ] Page/parent component wires hook to presentational component
