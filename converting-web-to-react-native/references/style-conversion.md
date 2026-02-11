# Style Conversion: CSS/Tailwind to Nativewind

## Tailwind Classes (Mostly 1:1)

Most Tailwind classes work identically in Nativewind. These are the exceptions:

### Classes That Don't Exist in Nativewind

| Web Tailwind | Nativewind Replacement |
|-------------|----------------------|
| `hover:` | `active:` (native) or `web:hover:` (web only) |
| `focus:` | Not supported on most RN elements |
| `focus-visible:` | `web:focus-visible:` (web only) |
| `cursor-pointer` | Not needed (all Pressables are tappable) |
| `transition-*` | Use `react-native-reanimated` |
| `animate-*` | Use `react-native-reanimated` |
| `grid` | Supported in New Architecture only |
| `backdrop-blur-*` | Use `expo-blur` BlurView |
| `bg-gradient-*` | Use `expo-linear-gradient` |
| `overflow-auto` | Use `<ScrollView>` |
| `overflow-scroll` | Use `<ScrollView>` |
| `position: fixed` | `absolute` (no fixed in RN) |
| `inset-0` | Works as `position: absolute` + all edges 0 |
| `z-*` | Works but layering is per-sibling in RN |

### Classes That Need Platform Split

```tsx
import { Platform } from 'react-native';
import { cn } from '~/lib/utils';

// Use Platform.select() in CVA definitions
const cardVariants = cva(
  cn(
    'rounded-2xl bg-surface border border-line p-5',
    Platform.select({
      web: 'hover:bg-surface/80 transition-colors cursor-pointer',
    })
  )
);
```

## Inline Style Conversion

### Colors

```tsx
// Web: hex, rgba, CSS variables
style={{ color: '#9CA3AF', background: 'rgba(255,255,255,0.1)' }}

// Nativewind: use semantic tokens from global.css
className="text-ink-sub bg-white/10"

// Or if using inline styles in RN:
style={{ color: '#9CA3AF', backgroundColor: 'rgba(255,255,255,0.1)' }}
// Note: 'background' → 'backgroundColor' in React Native
```

### Gradients

```tsx
// Web
style={{ background: 'linear-gradient(180deg, #6487FF, #4E62FF)' }}

// React Native Option A: expo-linear-gradient
import { LinearGradient } from 'expo-linear-gradient';
<LinearGradient colors={['#6487FF', '#4E62FF']} style={{ ... }}>
  {children}
</LinearGradient>

// React Native Option B: experimental_backgroundImage (New Architecture)
style={{ experimental_backgroundImage: 'linear-gradient(180deg, #6487FF, #4E62FF)' }}
```

### Shadows

```tsx
// Web
style={{ boxShadow: '0 8px 18px rgba(84,112,255,0.3)' }}

// React Native (New Architecture): same syntax via style prop
style={{ boxShadow: '0 8px 18px rgba(84,112,255,0.3)' }}

// React Native (Old Architecture): platform-specific
style={{
  shadowColor: '#5470FF',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 18,
  elevation: 8, // Android
}}
```

### Blur Effects

```tsx
// Web
style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.4)' }}

// React Native
import { BlurView } from 'expo-blur';
<BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

// Or with expo-glass-effect for liquid glass
import { GlassView } from 'expo-glass-effect';
<GlassView style={{ ... }} />
```

### Border Radius

```tsx
// Web: 'border-radius: 24px 24px 0 0' (top only)
style={{ borderRadius: '24px 24px 0 0' }}

// React Native: individual corners
style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
// Or Nativewind:
className="rounded-t-3xl"

// Smooth corners (Apple HIG):
style={{ borderCurve: 'continuous', borderRadius: 24 }}
```

## Converting Inline Style Objects to CVA

### Before (Web Pattern)

```jsx
const customStyles = {
  btnPrimary: {
    background: 'linear-gradient(180deg, #6487FF, #4E62FF)',
    boxShadow: '0 8px 18px rgba(84,112,255,0.3)',
    color: 'white',
    fontWeight: 600,
    borderRadius: '999px',
    padding: '14px 24px',
  },
  btnSecondary: {
    background: '#1C1F26',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: '999px',
    padding: '14px 24px',
  },
};

// Usage with conditional
const style = variant === 'primary' ? customStyles.btnPrimary : customStyles.btnSecondary;
<button style={style}>{children}</button>
```

### After (React Native Reusables Pattern)

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '~/lib/utils';

const buttonVariants = cva(
  'w-full flex-row items-center justify-center rounded-full py-3.5 px-6 gap-2',
  {
    variants: {
      variant: {
        primary: 'active:opacity-90',
        secondary: 'bg-surface border border-line active:opacity-90',
      },
    },
    defaultVariants: { variant: 'primary' },
  }
);

// For gradient buttons, wrap in LinearGradient:
function Button({ variant = 'primary', className, children, ...props }) {
  const content = (
    <Pressable
      className={cn(buttonVariants({ variant }), className)}
      role="button"
      {...props}
    />
  );

  if (variant === 'primary') {
    return (
      <LinearGradient
        colors={['#6487FF', '#4E62FF']}
        className="rounded-full"
        style={{ boxShadow: '0 8px 18px rgba(84,112,255,0.3)' }}
      >
        {content}
      </LinearGradient>
    );
  }

  return content;
}
```

## Converting CSS Variables to Nativewind Theme

### Before (Web: injected via useEffect)

```jsx
useEffect(() => {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --color-canvas: #0F1115;
      --color-surface: #1C1F26;
      --color-ink: #FFFFFF;
      --color-ink-sub: #9CA3AF;
      --color-line: rgba(255,255,255,0.1);
      --color-accent: #5674FF;
    }
  `;
  document.head.appendChild(style);
}, []);
```

### After (global.css with @theme block)

```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";
@import "nativewind/theme";

@theme {
  --color-canvas: hsl(var(--canvas));
  --color-surface: hsl(var(--surface));
  --color-ink: hsl(var(--ink));
  --color-ink-sub: hsl(var(--ink-sub));
  --color-line: hsl(var(--line));
  --color-accent: hsl(var(--accent));
}

:root {
  --canvas: 225 15% 7%;
  --surface: 222 14% 13%;
  --ink: 0 0% 100%;
  --ink-sub: 218 11% 65%;
  --line: 0 0% 100% / 0.1;
  --accent: 229 100% 67%;
}
```

Usage in components: `className="bg-canvas text-ink"` or `className="bg-surface border-line"`
