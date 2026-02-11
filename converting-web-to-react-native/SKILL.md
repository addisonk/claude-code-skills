---
name: converting-web-to-react-native
description: Converts React web component prototypes (from v0, Bolt, or similar AI tools) into production-ready Expo Router + React Native Reusables components. Use when converting web React files to React Native, porting v0 designs to mobile, or transforming Tailwind CSS web components into Nativewind mobile components.
---

# Converting Web React to React Native

Convert standalone React web prototypes into production Expo Router apps using React Native Reusables, Nativewind, and Vercel's React Native performance best practices.

## Quick Start

Given a React web file like this:

```jsx
// Web prototype (from v0/Bolt)
const Button = ({ children, variant = 'primary' }) => {
  const style = variant === 'primary'
    ? { background: 'linear-gradient(180deg, #6487FF, #4E62FF)', color: 'white', borderRadius: '999px' }
    : { background: '#1C1F26', border: '1px solid rgba(255,255,255,0.1)', color: 'white' };
  return <button style={style} className="w-full py-4 font-semibold">{children}</button>;
};
```

Convert to:

```tsx
// components/ui/button.tsx (React Native Reusables pattern)
import { cva, type VariantProps } from 'class-variance-authority';
import { Pressable } from 'react-native';
import { TextClassContext } from '~/components/ui/text';
import { cn } from '~/lib/utils';

const buttonVariants = cva(
  'w-full items-center justify-center rounded-full',
  {
    variants: {
      variant: {
        primary: 'bg-accent active:opacity-90',
        secondary: 'bg-surface border border-line active:opacity-90',
      },
      size: {
        default: 'py-4 px-6',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
);

const buttonTextVariants = cva('text-sm font-semibold', {
  variants: {
    variant: {
      primary: 'text-white',
      secondary: 'text-white',
    },
  },
  defaultVariants: { variant: 'primary' },
});

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant })}>
      <Pressable
        className={cn(buttonVariants({ variant, size }), className)}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonVariants, buttonTextVariants };
```

## Conversion Workflow

### Phase 1: Analyze Source Files

Read all web prototype files and identify:

1. **Unique screens** — Many AI tools output variant/iteration files. Deduplicate.
2. **Shared components** — Buttons, headers, cards, modals used across screens.
3. **Design tokens** — Colors, radii, typography, spacing from inline styles and CSS variables.
4. **State patterns** — `useState` hooks, event handlers, data flow.
5. **Navigation structure** — Which screens link to which.

### Phase 2: Set Up Expo Project Structure

Map screens to Expo Router file-based routes:

```
app/
├── _layout.tsx              # Root layout (ThemeProvider, PortalHost)
├── (tabs)/
│   ├── _layout.tsx          # Tab bar layout
│   ├── index.tsx            # Home screen
│   ├── gallery.tsx          # Gallery screen
│   └── settings.tsx         # Settings screen
├── camera.tsx               # Camera capture (modal)
├── processing.tsx           # Processing view
├── compare.tsx              # Before/after result
└── store.tsx                # Credit purchase
components/
├── ui/                      # React Native Reusables components
│   ├── button.tsx
│   ├── text.tsx
│   ├── card.tsx
│   └── ...
├── header.tsx               # App header with credits badge
├── compare-slider.tsx       # Before/after slider
└── ...
lib/
├── utils.ts                 # cn() utility
└── theme.ts                 # THEME + NAV_THEME objects
```

**Rules:**
- Routes belong in `app/` only. Never co-locate components in `app/`.
- Use kebab-case for file names.
- Configure tsconfig path aliases (`~/` → `src/`).

### Phase 3: Extract Design Tokens

Convert web CSS variables and inline styles to Nativewind CSS-first config.

**From web:**
```js
const styles = {
  '--color-canvas': '#0F1115',
  '--color-surface': '#1C1F26',
  '--color-accent': '#5674FF',
  '--color-ink-sub': '#9CA3AF',
  '--color-line': 'rgba(255,255,255,0.1)',
};
```

**To global.css:**
```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";
@import "nativewind/theme";

@theme {
  --color-canvas: hsl(var(--canvas));
  --color-surface: hsl(var(--surface));
  --color-accent: hsl(var(--accent));
  --color-ink-sub: hsl(var(--ink-sub));
  --color-line: hsl(var(--line));
}

:root {
  --canvas: 225 15% 7%;
  --surface: 222 14% 13%;
  --accent: 229 100% 67%;
  --ink-sub: 218 11% 65%;
  --line: 0 0% 100% / 0.1;
}
```

**Do NOT create `tailwind.config.js`** — Tailwind v4 uses CSS-first configuration.

### Phase 4: Convert Components

Follow this mapping for every conversion:

#### Element Mapping

| Web | React Native |
|-----|-------------|
| `<div>` | `<View>` |
| `<span>`, `<p>`, `<h1-h6>` | `<Text>` (from `~/components/ui/text`) |
| `<button>` | `<Pressable>` with `role="button"` |
| `<img>` | `<Image>` from `expo-image` |
| `<input type="text">` | `<TextInput>` |
| `<input type="range">` | `<Slider>` from `@react-native-community/slider` |
| `<svg>` inline icons | `expo-symbols` (SF Symbols) or icon library |
| `<a href>` | `<Link>` from `expo-router` |
| `className="..."` | `className="..."` (Nativewind) |
| `style={{ ... }}` | `style={{ ... }}` (inline) or `className` (Nativewind) |
| `onClick` | `onPress` |
| `onMouseDown/Up` | `onPressIn/Out` |
| CSS `hover:` | `active:` for native, `web:hover:` for web |
| CSS `transition` | `react-native-reanimated` |
| CSS `linear-gradient` | `expo-linear-gradient` or `experimental_backgroundImage` |
| CSS `backdrop-filter: blur()` | `expo-blur` BlurView or `expo-glass-effect` |
| CSS `box-shadow` | `boxShadow` style prop (New Architecture) |
| CSS `clipPath` | Masked views or custom SVG |
| `position: fixed` | `position: absolute` (no fixed in RN) |
| `overflow: auto` | `<ScrollView>` or `<FlashList>` |
| `aspect-ratio: 3/4` | `style={{ aspectRatio: 3/4 }}` |
| `border-radius: 999px` | `rounded-full` class |
| `document.addEventListener` | Gesture Handler or Reanimated |

#### Styling Mapping

| Web Pattern | React Native Pattern |
|-------------|---------------------|
| Inline style objects with conditionals | CVA variants |
| `isActive ? styleA : styleB` | CVA variant + `active:` classes |
| Tailwind `className` strings | Nativewind `className` (same syntax) |
| CSS animations (`@keyframes`) | `react-native-reanimated` (entering/exiting/layout) |
| `transform: scale(0.98)` on press | `Animated.View` with `withTiming` or `active:scale-[0.98]` |
| `rgba()` colors | Nativewind opacity modifier (`bg-white/10`) |

#### Component Architecture

Every component should follow React Native Reusables patterns:

1. **CVA for variants** — Extract all conditional styles to `cva()`.
2. **TextClassContext** — Wrap parent components that contain text children.
3. **Platform.select()** — Split web-only styles (hover, focus-visible).
4. **cn() for merging** — Always use `cn()` for className composition.
5. **Export variants** — Export component, variants, and text variants.

### Phase 5: Convert Interactions

#### Touch & Gestures

```tsx
// Web: mouse events
<div onMouseDown={start} onMouseMove={move} onMouseUp={end}>

// React Native: Gesture Handler
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const pan = Gesture.Pan()
  .onStart(start)
  .onUpdate(move)
  .onEnd(end);

<GestureDetector gesture={pan}>
  <Animated.View />
</GestureDetector>
```

#### Animations

```tsx
// Web: CSS transition
style={{ transition: 'transform 0.2s ease' }}

// React Native: Reanimated
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: withTiming(isPressed ? 0.98 : 1, { duration: 200 }) }],
}));
```

**Performance rule:** Only animate `transform` and `opacity` for GPU-optimized animations.

#### Modals & Overlays

```tsx
// Web: position fixed + backdrop
<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)' }}>

// React Native: Use Expo Router modal or RN Primitives Dialog
// Option A: Route-based modal
// app/export-modal.tsx with presentation: 'formSheet' in Stack.Screen options

// Option B: RN Primitives Dialog
import * as DialogPrimitive from '@rn-primitives/dialog';
```

### Phase 6: Performance Optimization

Apply Vercel's React Native performance rules:

1. **Lists** — Use `FlashList` instead of `FlatList` for large lists. Memoize item components.
2. **Images** — Use `expo-image` everywhere. Set explicit dimensions.
3. **Callbacks** — Stabilize with `useCallback`. Extract functions outside render.
4. **State** — Minimize subscriptions. Use dispatcher pattern for stable callbacks.
5. **Scrolling** — Use `contentInsetAdjustmentBehavior="automatic"` on ScrollViews.
6. **Text** — Always wrap text in `<Text>` components. Never bare strings.
7. **Conditionals** — Use ternary, not `&&`, for conditional rendering (avoids `0` rendering).

## Conversion Checklist

For each web file being converted:

- [ ] Identified screen purpose and mapped to Expo Router route
- [ ] Extracted design tokens to `global.css` `@theme` block
- [ ] Replaced HTML elements with RN equivalents (View, Text, Pressable, Image)
- [ ] Converted inline style objects to CVA variants
- [ ] Converted Tailwind classes to Nativewind (mostly 1:1)
- [ ] Replaced inline SVGs with `expo-symbols` or icon component
- [ ] Replaced mouse events with Pressable/GestureHandler
- [ ] Replaced CSS animations with Reanimated
- [ ] Added TextClassContext for text style inheritance
- [ ] Used `cn()` for all className merging
- [ ] Added `role` props for accessibility
- [ ] Used `expo-image` for all images
- [ ] Added safe area handling (ScrollView + contentInsetAdjustmentBehavior)
- [ ] Tested that no web-only APIs remain (document, window, DOM)

## Guidelines

- **Do not use `StyleSheet.create`** — Prefer Nativewind classes. Use inline styles only when dynamic.
- **Do not create `tailwind.config.js`** — Tailwind v4 is CSS-first. Use `global.css` `@theme` block.
- **Do not add `nativewind/babel`** to babel.config.js — Not needed in Nativewind v5.
- **Do not use `TouchableOpacity`** — Use `Pressable` with `active:opacity-90`.
- **Do not use `@expo/vector-icons`** — Use `expo-symbols` for SF Symbols.
- **Do not use `Platform.OS`** — Use `process.env.EXPO_OS`.
- **Do not use `SafeAreaView`** — Use `ScrollView contentInsetAdjustmentBehavior="automatic"`.
- **Do not use `Dimensions.get()`** — Use `useWindowDimensions`.
- **Gradients** — Use `expo-linear-gradient` or `experimental_backgroundImage` (New Architecture).
- **Blur** — Use `expo-blur` or `expo-glass-effect`, not CSS backdrop-filter.
- **Shadows** — Use `boxShadow` style prop, not legacy elevation/shadow props.

## Reference Files

For detailed conversion patterns, see:

- [./references/element-mapping.md](references/element-mapping.md) — Complete HTML-to-RN element mapping
- [./references/style-conversion.md](references/style-conversion.md) — CSS/Tailwind to Nativewind conversion patterns
- [./references/animation-conversion.md](references/animation-conversion.md) — CSS animations to Reanimated patterns
