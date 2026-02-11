---
name: v0-spec-pack-extractor
description: Extracts a high-fidelity Spec Pack from any codebase — routes, screens, components, data models, state flows, API/storage, and fixtures — without inventing features. Use when the user wants to analyze a repo, extract a spec, port an app to another framework, reverse-engineer a codebase, or mentions "spec pack", "extract spec", "app map", or "codebase analysis".
---

# Spec Pack Extractor

Extract a complete, evidence-based specification from any codebase. Produces 8 structured documents covering every dimension of the app — routes, screens, components, data models, state flows, API/storage, fixtures, and open questions.

**Rule: Never invent features. Only document what exists in the code. When uncertain, add to open questions.**

## Quick Start

```bash
# Run against current repo
# Output goes to /spec_pack/ directory
```

1. Read the codebase
2. Generate all 8 spec documents
3. Create fixture data from real schemas
4. Flag uncertainties in open questions

## Output Structure

```
spec_pack/
├── 01_app_map.md          # File tree, screens table, entities, flows overview
├── 02_screens.md          # Per-screen deep dive (purpose, UI, states, actions)
├── 03_components.md       # Reusable components, props, design tokens
├── 04_data_model.md       # Domain entities, fields, relationships
├── 05_state_and_flows.md  # User flows, state management, side effects
├── 06_fixtures/           # JSON sample data per entity
│   ├── entity_name.json
│   └── ...
├── 07_api_and_storage.md  # Endpoints, persistence, caching, migration mapping
└── 08_open_questions.md   # Uncertainties, assumptions, things to clarify
```

## Extraction Workflow

### Phase 1: Discovery

Before writing any spec files, thoroughly explore the codebase:

1. **Identify framework** — Next.js, Expo, React, Vue, Flutter, etc.
2. **Find route definitions** — file-based routing, router config, navigation setup
3. **Locate schemas** — TypeScript types/interfaces, Zod schemas, DB schemas, Prisma/Drizzle/Convex models
4. **Map state management** — React hooks, Zustand, Redux, React Query, tRPC, Convex, etc.
5. **Find persistence** — localStorage, IndexedDB, SQLite, API calls, Supabase, Firebase, Convex
6. **Catalog components** — `components/` directory, shared UI, design system

Read files. Cite file paths for every claim.

### Phase 2: Generate Documents

Create each document in order. Each document builds on the previous.

---

## 01_app_map.md

The overview document. Contains:

### File Tree

Concise tree of important files only (routes, components, state, types, services). Not every file — just the architecturally significant ones.

```
src/
├── app/                    # Routes
│   ├── (tabs)/
│   │   ├── index.tsx       # Home screen
│   │   └── settings.tsx    # Settings screen
│   └── _layout.tsx         # Root layout
├── components/
│   ├── ui/                 # Shared UI components
│   └── feature-card.tsx    # Domain component
├── lib/
│   ├── api.ts              # API client
│   └── types.ts            # Domain types
└── hooks/
    └── useData.ts          # Data fetching hook
```

### Screens Table

| Screen | Route | Primary Components | Data Dependencies | User Actions |
|--------|-------|--------------------|-------------------|--------------|
| Home | `/(tabs)/index` | FeatureCard, Button | `useQuery(api.items)` | Tap item, Pull refresh |
| ... | ... | ... | ... | ... |

### Domain Entities

List each entity with field names and types:

```
User { id, email, name, createdAt, credits }
Photo { id, userId, sourceUrl, resultUrl, status, createdAt }
```

### Flows Overview

Bulleted list of key user flows:

- **Create Item** — User taps "New" → form → submit → API → list updates
- **Edit Item** — User taps item → edit mode → save → optimistic update
- **Delete Item** — Swipe/long-press → confirm → delete → list updates

---

## 02_screens.md

For each screen/route, document:

```markdown
### ScreenName

**Route:** `app/(tabs)/index.tsx`
**Source:** `app/(tabs)/index.tsx:L12-L85`
**Purpose:** Displays the main feed of items with search and filter.

**UI Sections:**
- Header with title and action buttons
- Search bar with debounced input
- Scrollable list of cards
- FAB for creating new item

**States:**
| State | Condition | UI |
|-------|-----------|-----|
| Empty | No items, first load | Empty illustration + CTA |
| Loading | Fetching data | Skeleton cards |
| Error | API failure | Error message + retry button |
| Filled | Has items | Scrollable card list |

**User Actions:**
- Tap card → navigate to detail screen
- Tap FAB → navigate to create screen
- Pull down → refresh data
- Type in search → debounced filter (300ms)

**Validation:** None on this screen.

**Navigation Exits:**
- → Detail screen (`/items/[id]`)
- → Create screen (`/items/new`)
- → Settings (tab bar)
```

If a screen has variants (view/edit, logged-in/logged-out), document separately.

---

## 03_components.md

For each reusable component:

```markdown
### ComponentName

**Source:** `components/feature-card.tsx`
**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| title | string | Yes | Card heading |
| onPress | () => void | Yes | Tap handler |
| variant | 'default' \| 'highlight' | No | Visual style |

**Visual Behavior:**
- Default: white background, subtle border
- Pressed: opacity 0.8
- Highlight variant: accent background

**Used In:** HomeScreen, SearchResults, FavoritesScreen

**Design Tokens:**
- Spacing: 16px padding, 12px gap
- Typography: 16px semibold title, 14px regular body
- Colors: uses `colors.card`, `colors.border`, `ACCENT`
- Radius: 0 (square corners)
```

Also note:
- Third-party UI kits (shadcn, Radix, React Native Reusables, etc.)
- If porting to another framework, note equivalents needed

---

## 04_data_model.md

For each domain entity:

```markdown
### EntityName

**Source:** `convex/schema.ts:L15-L25` / `lib/types.ts:L8-L20`

| Field | Type | Editable | Notes |
|-------|------|----------|-------|
| _id | Id<"entity"> | No | Auto-generated |
| userId | Id<"users"> | No | Foreign key |
| name | string | Yes | Required, max 100 chars |
| status | "pending" \| "done" | Yes | Enum |
| createdAt | number | No | Timestamp, auto-set |

**Relationships:**
- User → EntityName (one-to-many via userId)
- EntityName → SubEntity (one-to-many via entityId)

**Indexes/Sorting:**
- Sorted by `createdAt` descending
- Searchable by `name`
- Filtered by `status`
```

---

## 05_state_and_flows.md

For each key flow:

```markdown
### Create Item Flow

**Source:** `app/create.tsx:L30-L55`, `hooks/useCreateItem.ts`

**Steps:**
1. User taps "New" button on HomeScreen
2. Navigate to CreateScreen
3. User fills form fields (name, description)
4. User taps "Save"
5. Client-side validation runs (name required, max 100 chars)
6. Mutation fires: `api.items.create({ name, description })`
7. Optimistic update: item appears in list immediately
8. On success: navigate back to HomeScreen
9. On error: show toast, revert optimistic update

**Flow Diagram:**
```
Tap "New" → Navigate → Fill form → Tap "Save"
  → Validate → Mutation → [Success] → Navigate back
                        → [Error] → Show toast, stay on form
```

**Notes:**
- No debounce on submit
- No offline support
- Form resets on mount
```

Also document:
- Sorting/ranking rules
- Debounce behavior (search, autosave)
- Optimistic updates (which mutations)
- Error handling patterns
- Offline behavior (if any)

---

## 06_fixtures/

Create JSON fixture files for each entity. Use realistic data.

```json
// 06_fixtures/users.json
[
  {
    "_id": "j57a8k9x0000",
    "email": "maria@restaurant.com",
    "name": "Maria Santos",
    "credits": 12,
    "createdAt": 1706640000000
  },
  {
    "_id": "j57a8k9x0001",
    "email": "chef.kim@gmail.com",
    "name": "김민준",
    "credits": 0,
    "createdAt": 1706726400000
  }
]
```

Include edge cases:
- Missing optional fields
- Long text values
- Unicode / international characters
- Empty arrays / null values
- Boundary values (0 credits, max length strings)

**Do not invent fields.** Only use fields found in the actual schema.

---

## 07_api_and_storage.md

### API Endpoints

| Method | Path | Request | Response | Auth |
|--------|------|---------|----------|------|
| POST | `/api/items` | `{ name, desc }` | `{ id }` | Bearer token |
| GET | `/api/items` | `?q=search` | `Item[]` | Bearer token |

Or for Convex/tRPC/GraphQL, document the function signatures:

```
api.items.create({ name: string, description: string }) → Id<"items">
api.items.list() → Item[]
api.items.getById({ id: Id<"items"> }) → Item | null
```

### Persistence

- **Auth tokens:** Clerk token cache (secure storage)
- **Local state:** React state only, no local persistence
- **Cache:** Convex reactive queries (auto-invalidate)

### Migration Mapping (if porting)

If porting to Firebase/Firestore:

| Source | Firestore Collection | Document Shape |
|--------|---------------------|----------------|
| Convex `users` table | `users/{userId}` | `{ email, name, credits, createdAt }` |
| Convex `items` table | `users/{userId}/items/{itemId}` | `{ name, status, createdAt }` |

**Indexes needed:**
- `items`: composite index on `(userId, createdAt desc)`

---

## 08_open_questions.md

Anything uncertain or ambiguous:

```markdown
- [ ] Is the `status` field on Photos set by the server or client? (See `convex/generations.ts:L45`)
- [ ] What happens when credits reach 0 mid-processing? No error handling found.
- [ ] The `onboarding` route exists in v0 design but not in codebase. Is it planned?
- [ ] Are credits ever decremented client-side or only server-side?
```

## Guidelines

- **Evidence only.** Every claim must cite a file path and line range.
- **Do not modify existing code.** Only write to `spec_pack/`.
- **Do not invent features.** If it's not in the code, it's not in the spec.
- **Be specific.** "Uses React state" is bad. "Uses `useState` in `HomeScreen` for `selectedId: string | null`" is good.
- **Include edge cases** in fixtures — unicode, empty states, boundary values.
- **Flag uncertainties** in `08_open_questions.md` rather than guessing.
- **Cite paths** in the format `file/path.tsx:L10-L25` for traceability.
- **Framework-agnostic language** where possible — describe behavior, not implementation.
- **Order matters.** Generate documents 01–08 in sequence. Each builds on the last.
