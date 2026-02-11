---
name: iframely
description: URL metadata extraction and rich media embedding with the Iframely API. Use when implementing link previews, URL unfurling, oEmbed integration, rich media embeds, or extracting metadata (title, description, thumbnails) from URLs. Covers API endpoints, React integration, embed.js setup, query parameters, response parsing, and batch fetching.
---

# Iframely API

Iframely extracts metadata and generates embed codes for URLs. It parses Open Graph, Twitter Cards, oEmbed, and structured data from 1900+ domains.

## API Endpoints

### Iframely API (primary)

```
GET https://iframe.ly/api/iframely?url={URL}&api_key={API_KEY}
```

### oEmbed API

```
GET https://iframe.ly/api/oembed?url={URL}&api_key={API_KEY}
```

### CDN endpoint (for client-side calls)

```
GET https://iframely.net/api/iframely?url={URL}&key={MD5_OF_API_KEY}
```

Use `key` (MD5 hash of API key) instead of `api_key` for client-side requests.

## Required Parameters

| Param     | Description                          |
|-----------|--------------------------------------|
| `url`     | URL-encoded target URL               |
| `api_key` | Your API key (server-side)           |
| `key`     | MD5 hash of API key (client-side)    |

## Response Structure

```json
{
  "meta": {
    "title": "Page Title",
    "description": "Page description",
    "author": "Author Name",
    "author_url": "https://...",
    "site": "Site Name",
    "canonical": "https://...",
    "duration": 120,
    "date": "2024-01-01",
    "medium": "video"
  },
  "links": {
    "player": [{ "href": "...", "type": "text/html", "rel": ["player"], "media": {"aspect-ratio": 1.778}, "html": "<div>...</div>" }],
    "thumbnail": [{ "href": "...", "type": "image/jpeg", "rel": ["thumbnail"] }],
    "icon": [{ "href": "...", "type": "image/png", "rel": ["icon"] }]
  },
  "html": "<div>recommended embed HTML</div>",
  "rel": ["player", "ssl"],
  "id": "content-id"
}
```

### Link Rel Types

| Rel         | Purpose                                    |
|-------------|--------------------------------------------|
| `player`    | Video, audio, slideshow widgets            |
| `image`     | Main content photos/pictures               |
| `app`       | General embeds (Twitter, Maps, etc.)       |
| `thumbnail` | Preview images                             |
| `reader`    | Long-form text widgets                     |
| `survey`    | Polls and questionnaires                   |
| `summary`   | Summary cards                              |
| `file`      | Downloadable files                         |
| `icon`      | Favicons                                   |
| `logo`      | Site logos                                 |

### MIME Types

| Type                                | Renders as          |
|-------------------------------------|---------------------|
| `text/html`                         | iframe              |
| `video/mp4`                         | `<video>` element   |
| `application/x-mpegURL`            | Streaming video     |
| `audio/mp3`, `audio/mpeg`          | `<audio>` element   |
| `image/*`                           | `<img>` element     |

## Query Parameters

### iFrame & Rendering

| Param          | Description                                     |
|----------------|-------------------------------------------------|
| `iframe=1`     | Activate async iFrames with delivery helper     |
| `iframe=0`     | Disable iFrame helper and interactives          |
| `omit_script=1`| Put rich media into Iframely iFrame (for React) |
| `omit_css=1`   | Replace inline styles with CSS class names      |
| `lazy=1`       | Lazy-load hosted iFrames                        |
| `align=left`   | Remove default center alignment                 |

### Content Control

| Param             | Description                              |
|-------------------|------------------------------------------|
| `media=1`         | Return media instead of rich apps        |
| `media=0`         | Disable media, force summary cards       |
| `ssl=1`           | Return only HTTPS-compatible media       |
| `autoplay=1`      | Enable player autoplay                   |
| `card=1`          | Place media in card layout               |
| `card=small`      | Small card layout                        |
| `click_to_play=1` | Load players only on user click          |
| `consent=1`       | Activate consent management              |
| `theme=dark`      | Dark theme (`light`, `auto` also valid)  |

### Sizing

| Param       | Description                                 |
|-------------|---------------------------------------------|
| `maxwidth`  | Max width in pixels for responsive embeds   |
| `maxheight` | Max height in pixels or viewport percentage |

### Output Format

| Param        | Description                        |
|--------------|------------------------------------|
| `id=1`       | Include content ID in response     |
| `amp=1`      | Format output for AMP framework    |
| `playerjs=1` | Enable Player.js event controls    |
| `title=1`    | Add title attributes (a11y)        |
| `callback`   | JSONP function name                |
| `format=xml` | XML response (oEmbed only)         |
| `language`   | Accept-Language header (ISO 639-1) |

## Batch Fetching

Fetch up to 100 content IDs in one request:

```
GET https://iframe.ly/{ID1}-{ID2}-...-{IDn}.json
```

Response keys are the IDs (order not guaranteed):

```json
{
  "ID1": { "meta": {...}, "links": {...} },
  "ID2": { "meta": {...}, "links": {...} }
}
```

## React / Next.js Integration

### Key Constraints

- React's `innerHTML` ignores `<script>` tags per HTML5 spec
- Must use `&omit_script=1` parameter to get iframe-only HTML
- Must load `embed.js` manually on the page
- Must call `window.iframely.load()` after rendering

### embed.js Setup

Add to your layout or `_document`:

```html
<script src="//cdn.iframe.ly/embed.js" async></script>
```

### React Component

```tsx
"use client";

import { useEffect, useState } from "react";

const IFRAMELY_KEY = process.env.NEXT_PUBLIC_IFRAMELY_KEY!; // MD5 hash of API key

interface IframelyEmbedProps {
  url: string;
}

export function IframelyEmbed({ url }: IframelyEmbedProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(
      `https://iframely.net/api/iframely?url=${encodeURIComponent(url)}&key=${IFRAMELY_KEY}&iframe=1&omit_script=1`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.html) {
          setHtml(data.html);
        } else if (data.error) {
          setError(`${data.error}: ${data.message}`);
        }
      })
      .catch((err) => setError(err.message));
  }, [url]);

  useEffect(() => {
    if (html) {
      window.iframely?.load();
    }
  }, [html]);

  if (error) return <div>Error: {error}</div>;
  if (!html) return null;

  // dangerouslySetInnerHTML is safe here because omit_script=1
  // ensures no third-party scripts are included
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

### Server-Side Fetching (Recommended)

Fetch metadata server-side and cache results:

```typescript
// Server action or API route
export async function getUrlMetadata(url: string) {
  const apiKey = process.env.IFRAMELY_API_KEY!;
  const res = await fetch(
    `https://iframe.ly/api/iframely?url=${encodeURIComponent(url)}&api_key=${apiKey}&omit_script=1`,
    { next: { revalidate: 3600 } } // Cache 1 hour
  );
  return res.json();
}
```

### Extracting Metadata Only (No Embed)

```typescript
// Get just title, description, thumbnail
const data = await getUrlMetadata(url);

const meta = {
  title: data.meta?.title,
  description: data.meta?.description,
  thumbnail: data.links?.thumbnail?.[0]?.href,
  icon: data.links?.icon?.[0]?.href,
  site: data.meta?.site,
};
```

## Error Handling

The API returns HTTP error codes:

| Code | Meaning                          |
|------|----------------------------------|
| 403  | Invalid or missing API key       |
| 404  | URL not found / not supported    |
| 408  | Timeout fetching the URL         |
| 417  | URL returned error to Iframely   |
| 429  | Rate limit exceeded              |

## TypeScript Types

```typescript
interface IframelyResponse {
  meta: {
    title?: string;
    description?: string;
    author?: string;
    author_url?: string;
    site?: string;
    canonical?: string;
    duration?: number;
    date?: string;
    medium?: string;
  };
  links: Record<string, IframelyLink[]>;
  html?: string;
  rel?: string[];
  id?: string;
}

interface IframelyLink {
  href: string;
  type: string;
  rel: string[];
  media?: {
    "aspect-ratio"?: number;
    width?: number;
    height?: number;
    "max-width"?: number;
    "max-height"?: number;
  };
  html?: string;
}
```

## Common Patterns

### Link Preview Card

Extract `meta.title`, `meta.description`, `links.thumbnail[0].href`, and `links.icon[0].href` to build a link preview card without embedding.

### Rich Media Embed

Use the top-level `html` field for the recommended embed. Fall back to `links.player[0].html` or `links.app[0].html`.

### Thumbnail Extraction

```typescript
const thumbnail = data.links?.thumbnail?.[0]?.href
  ?? data.links?.image?.[0]?.href;
```

### Check If URL Has Embed

```typescript
const hasEmbed = !!data.html || data.links?.player?.length > 0 || data.links?.app?.length > 0;
```
