# Element Mapping: Web to React Native

## HTML Elements

| Web Element | React Native | Notes |
|------------|-------------|-------|
| `<div>` | `<View>` | Default flex container |
| `<span>` | `<Text>` | Must use Text component for all text |
| `<p>` | `<Text>` | Style with `className` for margin/size |
| `<h1>` - `<h6>` | `<Text>` | Use `accessibilityRole="header"` |
| `<button>` | `<Pressable role="button">` | Never use TouchableOpacity |
| `<a>` | `<Link>` from expo-router | Use `asChild` to wrap custom components |
| `<img>` | `<Image>` from expo-image | Always set width/height |
| `<input type="text">` | `<TextInput>` | |
| `<input type="range">` | `<Slider>` from @react-native-community/slider | |
| `<input type="file">` | `expo-image-picker` or `expo-document-picker` | |
| `<textarea>` | `<TextInput multiline>` | |
| `<select>` | `@rn-primitives/select` | Use RN Primitives |
| `<ul>`, `<ol>` | `<View>` with mapped children, or `<FlashList>` for long lists | |
| `<li>` | `<View>` | |
| `<header>`, `<footer>`, `<main>`, `<section>` | `<View>` | Use `accessibilityRole` if semantic |
| `<nav>` | Tab bar via Expo Router or `<View>` | |
| `<form>` | `<View>` | No native form element |
| `<label>` | `<Text>` with `nativeID` linked to input | |
| `<svg>` | `expo-symbols` or `react-native-svg` | Prefer SF Symbols |
| `<video>` | `expo-video` | Not `expo-av` |
| `<audio>` | `expo-audio` | Not `expo-av` |

## Event Mapping

| Web Event | React Native Event | Notes |
|-----------|-------------------|-------|
| `onClick` | `onPress` | On Pressable/Link |
| `onMouseDown` | `onPressIn` | |
| `onMouseUp` | `onPressOut` | |
| `onMouseEnter/Leave` | No direct equivalent | Use `web:hover:` for web only |
| `onTouchStart` | `Gesture.Pan().onStart()` | Use Gesture Handler |
| `onTouchMove` | `Gesture.Pan().onUpdate()` | Use Gesture Handler |
| `onTouchEnd` | `Gesture.Pan().onEnd()` | Use Gesture Handler |
| `onChange` (input) | `onChangeText` | Returns string, not event |
| `onSubmit` (form) | Custom handler on button press | |
| `onScroll` | `onScroll` on ScrollView/FlashList | |
| `onKeyDown` | Not available on mobile | |
| `onFocus` / `onBlur` | `onFocus` / `onBlur` on TextInput | |

## DOM APIs to Replace

| Web API | React Native Replacement |
|---------|------------------------|
| `document.createElement('style')` | `global.css` + Nativewind |
| `document.addEventListener` | Gesture Handler or AppState |
| `window.innerWidth/Height` | `useWindowDimensions()` |
| `window.location` | `useRouter()` from expo-router |
| `navigator.clipboard` | `expo-clipboard` |
| `navigator.share` | `expo-sharing` |
| `navigator.mediaDevices` | `expo-camera` |
| `localStorage` | `@react-native-async-storage/async-storage` |
| `sessionStorage` | React state (lost on background) |
| `fetch` | `fetch` (same API) |
| `URL.createObjectURL` | `expo-file-system` |
| `alert()` | `Alert.alert()` from react-native |
| `confirm()` | `@rn-primitives/alert-dialog` |
| `console.log` | `console.log` (same, shows in Metro) |

## Common Web Component Patterns

### Toggle/Switch

```tsx
// Web
<button onClick={() => setState(!state)}
  className={`w-10 h-6 rounded-full ${state ? 'bg-blue-500' : 'bg-white/10'}`}>
  <div className={`w-4 h-4 bg-white rounded-full ${state ? 'right-1' : 'left-1'}`} />
</button>

// React Native: Use native Switch
import { Switch } from 'react-native';
<Switch value={state} onValueChange={setState} />
```

### Bottom Sheet / Modal

```tsx
// Web: position fixed overlay
<div style={{ position: 'fixed', inset: 0 }}>
  <div style={{ borderRadius: '24px 24px 0 0' }}>...</div>
</div>

// React Native Option A: Expo Router modal route
// app/modal.tsx
export default function Modal() { ... }
// In _layout.tsx: <Stack.Screen name="modal" options={{ presentation: 'formSheet' }} />

// React Native Option B: RN Primitives Dialog
import * as Dialog from '@rn-primitives/dialog';
<Dialog.Root><Dialog.Trigger /><Dialog.Content>...</Dialog.Content></Dialog.Root>
```

### Scrollable Content

```tsx
// Web
<div style={{ overflow: 'auto', height: '100vh' }}>...</div>

// React Native
<ScrollView contentInsetAdjustmentBehavior="automatic"
  contentContainerStyle={{ padding: 20, gap: 16 }}>
  ...
</ScrollView>
```

### Tab Bar

```tsx
// Web: custom div-based tabs
<nav style={{ position: 'fixed', bottom: 0 }}>
  <div onClick={() => setTab('home')}>Home</div>
  <div onClick={() => setTab('gallery')}>Gallery</div>
</nav>

// React Native: Expo Router tab layout
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ... }} />
      <Tabs.Screen name="gallery" options={{ title: 'Gallery', tabBarIcon: ... }} />
    </Tabs>
  );
}
```

### File Upload / Image Picker

```tsx
// Web
<input type="file" accept="image/*" onChange={handleFile} />

// React Native
import * as ImagePicker from 'expo-image-picker';
const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
  });
  if (!result.canceled) setImage(result.assets[0].uri);
};
```

### Camera

```tsx
// Web: placeholder/mock camera
<div className="camera-preview">...</div>

// React Native
import { CameraView, useCameraPermissions } from 'expo-camera';
const [permission, requestPermission] = useCameraPermissions();
<CameraView style={{ flex: 1 }} facing="front" />
```
