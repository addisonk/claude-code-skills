# React Native Reusables Patterns

## The cn() Utility

Every component uses cn() for class merging:

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Usage:**
```typescript
// Always pass className through cn()
<View className={cn("base-classes", conditionalClass && "optional", className)} />
```

---

## CVA Pattern with Platform.select()

Use Platform.select() to split web and native styles:

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform } from 'react-native';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles - shared across platforms
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-md shadow-none',
    // Web-only base styles
    Platform.select({
      web: "focus-visible:ring-ring/50 outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-primary active:bg-primary/90 shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-primary/90' })
        ),
        destructive: cn(
          'bg-destructive active:bg-destructive/90',
          Platform.select({ web: 'hover:bg-destructive/90' })
        ),
        outline: cn(
          'border-border bg-background active:bg-accent border shadow-sm',
          Platform.select({ web: 'hover:bg-accent' })
        ),
        secondary: cn(
          'bg-secondary active:bg-secondary/80 shadow-sm',
          Platform.select({ web: 'hover:bg-secondary/80' })
        ),
        ghost: cn(
          'active:bg-accent',
          Platform.select({ web: 'hover:bg-accent' })
        ),
        link: '',
      },
      size: {
        default: cn('h-10 px-4 py-2 sm:h-9', Platform.select({ web: 'has-[>svg]:px-3' })),
        sm: cn('h-9 gap-1.5 rounded-md px-3 sm:h-8', Platform.select({ web: 'has-[>svg]:px-2.5' })),
        lg: cn('h-11 rounded-md px-6 sm:h-10', Platform.select({ web: 'has-[>svg]:px-4' })),
        icon: 'h-10 w-10 sm:h-9 sm:w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

**Key points:**
- Use `active:` for native press states
- Use `web:hover:` for web hover states only
- Use `sm:` for responsive sizing (works on web)
- Wrap platform-specific styles in `Platform.select()`

---

## TextClassContext Pattern

React Native doesn't cascade styles. Use TextClassContext to pass text styles from parent to child Text components.

### Define Text Component with Context

```typescript
// components/ui/text.tsx
import * as React from 'react';
import { Text as RNText } from 'react-native';
import * as Slot from '@rn-primitives/slot';
import { cn } from '@/lib/utils';

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<typeof RNText> & { asChild?: boolean }) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;

  return (
    <Component
      className={cn('text-base text-foreground', textClass, className)}
      {...props}
    />
  );
}

export { Text, TextClassContext };
```

### Use Provider in Parent Components

```typescript
// components/ui/button.tsx
import { TextClassContext } from '@/components/ui/text';

const buttonTextVariants = cva(
  cn('text-sm font-medium', Platform.select({ web: 'pointer-events-none transition-colors' })),
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        destructive: 'text-white',
        outline: cn('group-active:text-accent-foreground', Platform.select({ web: 'group-hover:text-accent-foreground' })),
        secondary: 'text-secondary-foreground',
        ghost: 'group-active:text-accent-foreground',
        link: cn('text-primary group-active:underline', Platform.select({ web: 'underline-offset-4 group-hover:underline' })),
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Button({ variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant })}>
      <Pressable
        className={cn(buttonVariants({ variant, size }))}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}
```

### Usage

```tsx
<Button variant="destructive">
  <Text>Delete</Text>  {/* Automatically gets text-white */}
</Button>
```

---

## Component Interface Pattern

Standard TypeScript pattern for all components:

```typescript
import { Pressable } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(/* ... */);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <Pressable
      className={cn(props.disabled && 'opacity-50', buttonVariants({ variant, size }), className)}
      role="button"
      {...props}
    />
  );
}

export { Button, buttonVariants, buttonTextVariants };
export type { ButtonProps };
```

**Key patterns:**
- Extend native component props for full prop passthrough
- Include `VariantProps<typeof variants>` for CVA types
- Add ref forwarding with `React.RefAttributes`
- Export both component AND variants
- Export text variants if using TextClassContext

---

## asChild Pattern with Slot

Use Slot from RN Primitives for composition:

```typescript
import * as Slot from '@rn-primitives/slot';

function Button({ asChild = false, ...props }: ButtonProps & { asChild?: boolean }) {
  const Component = asChild ? Slot.Pressable : Pressable;

  return (
    <Component {...props} />
  );
}

// Usage - renders as Link but with Button styles
<Button asChild>
  <Link href="/login">
    <Text>Login</Text>
  </Link>
</Button>
```

---

## Icon Wrapper Pattern

Use the Icon wrapper component for Lucide icons:

```typescript
// components/ui/icon.tsx
import { cssInterop } from 'nativewind';
import type { LucideIcon } from 'lucide-react-native';

function Icon({ as: IconComponent, className, ...props }: { as: LucideIcon; className?: string }) {
  const StyledIcon = cssInterop(IconComponent, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
        width: true,
        height: true,
      },
    },
  });

  return <StyledIcon className={className} {...props} />;
}

// Usage
import { ArrowLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

<Icon as={ArrowLeft} className="h-5 w-5 text-foreground" />
```

---

## Disabled State Pattern

Always handle disabled state explicitly:

```typescript
<Pressable
  className={cn(
    props.disabled && 'opacity-50',
    buttonVariants({ variant, size }),
    className
  )}
  disabled={props.disabled}
  {...props}
/>
```

On web, add `pointer-events-none` via Platform.select:

```typescript
Platform.select({ web: 'disabled:pointer-events-none' })
```
