---
name: generating-images-with-fal
description: Generate images, illustrations, icons, and visual assets using fal.ai models. Use when creating visual assets, generating AI images, or working with fal.ai MCP tools.
---

# Image Generation with fal.ai

Use this skill when asked to generate images, create visual assets, produce illustrations, or work with AI image generation.

## MCP Tools Available

Two MCP servers are configured in `.mcp.json`:

### `fal-docs` (Documentation)
Remote server at `https://docs.fal.ai/mcp`. Use to look up model parameters, API details, or troubleshoot.

### `fal-ai` (Generation)
Local server via `uvx fal-ai-mcp-server`. Available tools:

| Tool | Purpose |
|------|---------|
| `generate` | Create images from prompts (primary tool) |
| `models` | List available fal.ai models |
| `search` | Find models by keyword |
| `schema` | Get OpenAPI schema for a model |
| `status` | Check queued request status |
| `result` | Get results from queued request |
| `upload` | Upload files to fal.ai CDN |

## Generating Images

Use the `fal-ai` MCP `generate` tool:

```
generate(
  model="fal-ai/gpt-image-1.5",
  prompt="A flat-style rocket icon, minimalist, clean lines",
  background="transparent",
  quality="high",
  output_format="png"
)
```

Images are saved to `./generated/` directory.

## Preferred Models

| Model | Endpoint | Best For |
|-------|----------|----------|
| **GPT Image 1.5** | `fal-ai/gpt-image-1.5` | Icons, transparent backgrounds, high fidelity |
| **Nano Banana Pro** | `fal-ai/nano-banana-pro` | Fast generation, 4K resolution |
| **Flux 2** | `fal-ai/flux-2` | Precise control, image editing |

### When to Use Each

- **Icons/UI assets**: GPT Image 1.5 (supports `transparent` background)
- **Quick iterations**: Nano Banana Pro (fastest)
- **Editing existing images**: Flux 2 (best I2I via `/edit` endpoint)
- **High resolution**: Nano Banana Pro (supports 4K)

## Common Parameters

### GPT Image 1.5
```json
{
  "prompt": "...",
  "image_size": "1024x1024",  // or 1536x1024, 1024x1536
  "background": "transparent", // or opaque, auto
  "quality": "high",          // or low, medium
  "num_images": 1,            // 1-4
  "output_format": "png"      // or jpeg, webp
}
```

### Nano Banana Pro
```json
{
  "prompt": "...",
  "aspect_ratio": "1:1",      // or 16:9, 9:16, 4:3, etc.
  "resolution": "1K",         // or 2K, 4K
  "num_images": 1,
  "output_format": "png"
}
```

### Flux 2
```json
{
  "prompt": "...",
  "guidance_scale": 2.5,      // 0-20
  "num_inference_steps": 28,  // 4-50
  "acceleration": "regular",  // or none, high
  "num_images": 1,
  "output_format": "png"
}
```

## Prompt Engineering Tips

### For Icons
```
"A flat-style [subject] icon, minimalist design, clean lines, solid colors"
"A 3D [subject] icon with soft shadows, rounded edges, gradient fill"
"A line-art [subject] icon, single stroke weight, geometric"
```

### For Illustrations
```
"A modern illustration of [subject], flat design, limited color palette"
"An isometric view of [subject], clean vectors, soft shadows"
```

### Style Modifiers
- **Flat**: "flat design", "flat-style", "2D"
- **3D**: "3D rendered", "soft shadows", "depth"
- **Minimal**: "minimalist", "simple", "clean"
- **Detailed**: "intricate", "detailed", "complex"

### Background Control
- Use `background: "transparent"` for icons/assets
- Add "on a white background" or "on a [color] background" to prompt
- Use `background: "auto"` to let model decide

## Image-to-Image (Editing)

Use the `/edit` endpoint variants:

```
generate(
  model="fal-ai/gpt-image-1.5/edit",
  prompt="Change the color to blue",
  image_urls=["https://..."],
  input_fidelity="high"
)
```

Or with Flux 2:
```
generate(
  model="fal-ai/flux-2/edit",
  prompt="Add a shadow beneath",
  image_urls=["https://..."]
)
```

## Output Location & Naming

Generated images are saved to `./generated/` (configured in `.mcp.json`).

Naming convention:
```
{subject}-{style}-{size}.png
# Examples:
rocket-flat-1024.png
calendar-3d-512.png
star-line-256.png
```

For production assets, move to:
```
./public/assets/
```

## Fallback: CLI Usage

If MCP is unavailable, use the fal CLI:

```bash
# Install fal CLI
npm install -g @fal-ai/cli

# Generate (requires FAL_KEY env var)
fal run fal-ai/gpt-image-1.5 \
  --prompt "A flat-style rocket icon" \
  --background transparent \
  --quality high \
  --output_format png
```

## Project Integration

This project uses fal.ai through:
- **MCP servers**: Configured in `.mcp.json`
- **Web proxy**: `/api/fal/proxy` (Next.js route)
- **Client**: `@fal-ai/client` in `apps/web/lib/fal.ts`
- **Models**: Defined in `apps/web/lib/models/`

When generating images for this project's icon sets, prefer:
1. GPT Image 1.5 for transparent icons
2. 1024x1024 size for consistency
3. PNG format for transparency support
