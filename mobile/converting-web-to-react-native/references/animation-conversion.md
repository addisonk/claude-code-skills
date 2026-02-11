# Animation Conversion: CSS to Reanimated

## General Rules

1. **Only animate `transform` and `opacity`** for GPU-optimized performance.
2. Use `react-native-reanimated` for all animations. Never use `Animated` from react-native.
3. Use `entering` and `exiting` props for mount/unmount animations.
4. Use `layout` prop for layout changes.
5. Use `Gesture Handler` + Reanimated for gesture-driven animations.

## Common CSS Animation Patterns

### Pulse / Breathing Animation

```css
/* Web */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse { animation: pulse 2s ease-in-out infinite; }
```

```tsx
// React Native
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

function PulsingDot() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1, // infinite
      true // reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle} className="w-2 h-2 rounded-full bg-blue-400" />;
}
```

### Spin Animation

```css
/* Web */
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
```

```tsx
// React Native
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

function Spinner() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return <Animated.View style={animatedStyle}>...</Animated.View>;
}
```

### Scale on Press

```css
/* Web */
button { transition: transform 0.2s ease; }
button:active { transform: scale(0.98); }
```

```tsx
// React Native Option A: Nativewind (simple)
<Pressable className="active:scale-[0.98]">...</Pressable>

// React Native Option B: Reanimated (smoother)
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

function ScaleButton({ children, onPress }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withTiming(0.98, { duration: 100 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 200 }); }}
      onPress={onPress}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
}
```

### Shimmer / Skeleton Loading

```css
/* Web */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
```

```tsx
// React Native
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

function Shimmer({ width, height }) {
  const translateX = useSharedValue(-width);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(width, { duration: 2000 }),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={{ width, height, overflow: 'hidden', borderRadius: 8 }}>
      <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)' }} />
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}
```

### Progress Bar Animation

```css
/* Web */
.progress-fill {
  transition: width 1s ease;
  width: var(--progress);
}
```

```tsx
// React Native
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

function ProgressBar({ progress }: { progress: number }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress}%`, { duration: 1000 }),
  }));

  return (
    <View className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
      <Animated.View
        style={animatedStyle}
        className="h-full rounded-full bg-accent"
      />
    </View>
  );
}
```

### Mount/Unmount Animations (Entering/Exiting)

```css
/* Web: typically handled with CSS transitions or animation libraries */
.modal-enter { opacity: 0; transform: translateY(100%); }
.modal-enter-active { opacity: 1; transform: translateY(0); transition: all 0.3s; }
```

```tsx
// React Native: use entering/exiting props
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

// Fade in/out
<Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
  ...
</Animated.View>

// Slide up modal
<Animated.View entering={SlideInDown.duration(300)} exiting={SlideOutDown.duration(200)}>
  ...
</Animated.View>

// Combined
<Animated.View
  entering={FadeIn.duration(300).delay(100)}
  exiting={FadeOut.duration(200)}
>
  ...
</Animated.View>
```

### Gesture-Driven Slider (Compare Slider)

```jsx
// Web: mouse/touch drag with clipPath
const handleMove = (clientX) => {
  const rect = containerRef.current.getBoundingClientRect();
  const percentage = (clientX - rect.left) / rect.width * 100;
  setSliderPosition(percentage);
};
```

```tsx
// React Native: Gesture Handler + Reanimated
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  clamp,
} from 'react-native-reanimated';

function CompareSlider({ beforeImage, afterImage }) {
  const position = useSharedValue(0.5); // 0 to 1
  const containerWidth = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (containerWidth.value > 0) {
        position.value = clamp(e.absoluteX / containerWidth.value, 0, 1);
      }
    });

  const clipStyle = useAnimatedStyle(() => ({
    width: `${position.value * 100}%`,
    overflow: 'hidden',
  }));

  const dividerStyle = useAnimatedStyle(() => ({
    left: `${position.value * 100}%`,
  }));

  return (
    <GestureDetector gesture={pan}>
      <View
        className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden"
        onLayout={(e) => { containerWidth.value = e.nativeEvent.layout.width; }}
      >
        {/* After (full) */}
        <Image source={afterImage} className="absolute inset-0 w-full h-full" contentFit="cover" />

        {/* Before (clipped) */}
        <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0 }, clipStyle]}>
          <Image source={beforeImage} style={{ width: containerWidth.value, height: '100%' }} contentFit="cover" />
        </Animated.View>

        {/* Divider line */}
        <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: 'white' }, dividerStyle]} />
      </View>
    </GestureDetector>
  );
}
```
