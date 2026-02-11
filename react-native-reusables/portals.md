# React Native Reusables Portals

## Why Portals?

React Native doesn't support DOM portals like web. Components that render outside their parent hierarchy (modals, dropdown menus, popovers, tooltips) need a portal system.

RN Primitives provides `@rn-primitives/portal` to solve this.

---

## Components Requiring Portals

These components MUST have a PortalHost configured:

| Component | Package | Notes |
|-----------|---------|-------|
| Dialog | `@rn-primitives/dialog` | Modal dialogs |
| Alert Dialog | `@rn-primitives/alert-dialog` | Confirmation dialogs |
| Dropdown Menu | `@rn-primitives/dropdown-menu` | Use refs for control |
| Context Menu | `@rn-primitives/context-menu` | Right-click menus |
| Popover | `@rn-primitives/popover` | Floating content |
| Tooltip | `@rn-primitives/tooltip` | Hover tips |
| Select | `@rn-primitives/select` | Dropdown selects |
| Hover Card | `@rn-primitives/hover-card` | Hover cards |
| Menubar | `@rn-primitives/menubar` | Menu bars |

---

## PortalHost Setup

Add PortalHost to your root layout as the LAST child:

```typescript
// app/_layout.tsx
import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NAV_THEME } from '@/lib/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack />
      <PortalHost />  {/* MUST be last child */}
    </ThemeProvider>
  );
}
```

**Why last child?** Portal content renders at the PortalHost location. Being last ensures it appears above all other content.

---

## Ref-Based Control

Some components (DropdownMenu, ContextMenu) can't use `open`/`onOpenChange` props due to layout calculation requirements. Use refs instead:

### DropdownMenu Example

```typescript
import { useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  type DropdownMenuRef,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

function MyComponent() {
  const menuRef = useRef<DropdownMenuRef>(null);

  const handleOpenMenu = () => {
    menuRef.current?.open();
  };

  const handleCloseMenu = () => {
    menuRef.current?.close();
  };

  return (
    <DropdownMenu ref={menuRef}>
      <DropdownMenuTrigger asChild>
        <Button>
          <Text>Open Menu</Text>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onPress={handleCloseMenu}>
          <Text>Option 1</Text>
        </DropdownMenuItem>
        <DropdownMenuItem onPress={handleCloseMenu}>
          <Text>Option 2</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Available Ref Methods

Most portal components expose:

```typescript
interface PortalComponentRef {
  open: () => void;
  close: () => void;
}
```

---

## Dialog (Controlled)

Dialog supports both controlled and uncontrolled modes:

### Uncontrolled (Simple)

```typescript
<Dialog>
  <DialogTrigger asChild>
    <Button>
      <Text>Open Dialog</Text>
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description here.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button>
          <Text>Close</Text>
        </Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Controlled

```typescript
function ControlledDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Text>Open Dialog</Text>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Controlled Dialog</DialogTitle>
        </DialogHeader>
        <Button onPress={() => setOpen(false)}>
          <Text>Close Programmatically</Text>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Troubleshooting

### Portal Content Not Visible

1. **Check PortalHost exists** in root layout
2. **Verify PortalHost is last child** of provider hierarchy
3. **Check z-index conflicts** — Portal content should be above other elements

### DropdownMenu Won't Open

1. **Use ref-based control** — `open`/`onOpenChange` may not work
2. **Check trigger is pressable** — Use `asChild` with Button or Pressable
3. **Verify layout calculation** — Menu needs to calculate position before opening

### Content Appears Behind Other Elements

Ensure PortalHost is truly the last child:

```typescript
// Correct
<ThemeProvider>
  <Stack />
  <PortalHost />
</ThemeProvider>

// Incorrect - PortalHost is not last
<ThemeProvider>
  <PortalHost />
  <Stack />
</ThemeProvider>
```

---

## Multiple Portals

If you have multiple portal destinations, use named hosts:

```typescript
// Root layout
<PortalHost name="modal" />
<PortalHost name="dropdown" />

// Component usage
<Portal name="modal">
  <MyModalContent />
</Portal>
```

For most apps, a single unnamed PortalHost is sufficient.
