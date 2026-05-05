# Components Catalog

Every shipped component, classified. Reference paths are repo-relative and always point to the canonical TS-TW variant. Append the same name `.tsx` for the source, swap `ts-tailwind` for `content` / `tailwind` / `ts-default` for the other variants. Non-Tailwind variants (`content`, `ts-default`) ship a sibling `.css`.

Columns: **Name** · **Family** · **Dim** (CSS / Motion-DOM / GSAP / OGL-shader / R3F-3D / matter-js-2D) · **Primary deps** · **Closest example to study**

## Text Animations

| Name | Family | Dim | Primary deps | Closest example to study |
| --- | --- | --- | --- | --- |
| ASCIIText | TextAnimations | R3F-3D + canvas filter | three | `src/ts-tailwind/TextAnimations/ASCIIText/ASCIIText.tsx` |
| BlurText | TextAnimations | Motion-DOM | motion | `src/ts-tailwind/TextAnimations/BlurText/BlurText.tsx` |
| CircularText | TextAnimations | Motion-DOM | motion | `src/ts-tailwind/TextAnimations/CircularText/CircularText.tsx` |
| CountUp | TextAnimations | Motion-DOM | motion (`useMotionValue`) | `src/ts-tailwind/TextAnimations/CountUp/CountUp.tsx` |
| CurvedLoop | TextAnimations | Motion-DOM + drag | motion | `src/ts-tailwind/TextAnimations/CurvedLoop/CurvedLoop.tsx` |
| DecryptedText | TextAnimations | Motion-DOM / CSS | motion | `src/ts-tailwind/TextAnimations/DecryptedText/DecryptedText.tsx` |
| FallingText | TextAnimations | matter-js-2D | matter-js | `src/ts-tailwind/TextAnimations/FallingText/FallingText.tsx` |
| FuzzyText | TextAnimations | Motion-DOM + canvas | motion / canvas | `src/ts-tailwind/TextAnimations/FuzzyText/FuzzyText.tsx` |
| GlitchText | TextAnimations | CSS | (CSS-only) | `src/ts-tailwind/TextAnimations/GlitchText/GlitchText.tsx` |
| GradientText | TextAnimations | CSS | (CSS-only) | `src/ts-tailwind/TextAnimations/GradientText/GradientText.tsx` |
| RotatingText | TextAnimations | Motion-DOM (AnimatePresence) | motion | `src/ts-tailwind/TextAnimations/RotatingText/RotatingText.tsx` |
| ScrambledText | TextAnimations | Motion-DOM / canvas | motion | `src/ts-tailwind/TextAnimations/ScrambledText/ScrambledText.tsx` |
| ScrollFloat | TextAnimations | GSAP | gsap + ScrollTrigger | `src/ts-tailwind/TextAnimations/ScrollFloat/ScrollFloat.tsx` |
| ScrollReveal | TextAnimations | GSAP | gsap + ScrollTrigger | `src/ts-tailwind/TextAnimations/ScrollReveal/ScrollReveal.tsx` |
| ScrollVelocity | TextAnimations | GSAP | gsap + ScrollTrigger | `src/ts-tailwind/TextAnimations/ScrollVelocity/ScrollVelocity.tsx` |
| ShinyText | TextAnimations | CSS | (CSS-only) | `src/ts-tailwind/TextAnimations/ShinyText/ShinyText.tsx` |
| Shuffle | TextAnimations | Motion-DOM | motion | `src/ts-tailwind/TextAnimations/Shuffle/Shuffle.tsx` |
| SplitText | TextAnimations | GSAP | gsap (SplitText, ScrollTrigger), `@gsap/react` | `src/ts-tailwind/TextAnimations/SplitText/SplitText.tsx` |
| TextCursor | TextAnimations | Motion-DOM | motion | `src/ts-tailwind/TextAnimations/TextCursor/TextCursor.tsx` |
| TextPressure | TextAnimations | Motion-DOM | motion | `src/ts-tailwind/TextAnimations/TextPressure/TextPressure.tsx` |
| TextType | TextAnimations | Motion-DOM | motion / setInterval | `src/ts-tailwind/TextAnimations/TextType/TextType.tsx` |
| TrueFocus | TextAnimations | Motion-DOM | motion | `src/ts-tailwind/TextAnimations/TrueFocus/TrueFocus.tsx` |
| VariableProximity | TextAnimations | Motion-DOM + variable fonts | motion | `src/ts-tailwind/TextAnimations/VariableProximity/VariableProximity.tsx` |

## Animations

| Name | Family | Dim | Primary deps | Closest example |
| --- | --- | --- | --- | --- |
| AnimatedContent | Animations | GSAP | gsap + ScrollTrigger | `src/ts-tailwind/Animations/AnimatedContent/AnimatedContent.tsx` |
| Antigravity | Animations | R3F-3D | three | `src/ts-tailwind/Animations/Antigravity/Antigravity.tsx` |
| BlobCursor | Animations | Motion-DOM / canvas | motion | `src/ts-tailwind/Animations/BlobCursor/BlobCursor.tsx` |
| ClickSpark | Animations | canvas / Motion-DOM | motion / canvas | `src/ts-tailwind/Animations/ClickSpark/ClickSpark.tsx` |
| Crosshair | Animations | Motion-DOM | motion | `src/ts-tailwind/Animations/Crosshair/Crosshair.tsx` |
| Cubes | Animations | R3F-3D | three / R3F | `src/ts-tailwind/Animations/Cubes/Cubes.tsx` |
| ElectricBorder | Animations | OGL-shader / CSS | ogl or css | `src/ts-tailwind/Animations/ElectricBorder/ElectricBorder.tsx` |
| FadeContent | Animations | Motion-DOM | motion | `src/ts-tailwind/Animations/FadeContent/FadeContent.tsx` |
| GhostCursor | Animations | Motion-DOM | motion | `src/ts-tailwind/Animations/GhostCursor/GhostCursor.tsx` |
| GlareHover | Animations | CSS | (CSS-only) | `src/ts-tailwind/Animations/GlareHover/GlareHover.tsx` |
| GradualBlur | Animations | GSAP / CSS | gsap or css | `src/ts-tailwind/Animations/GradualBlur/GradualBlur.tsx` |
| ImageTrail | Animations | Motion-DOM | motion | `src/ts-tailwind/Animations/ImageTrail/ImageTrail.tsx` |
| LaserFlow | Animations | OGL-shader | ogl | `src/ts-tailwind/Animations/LaserFlow/LaserFlow.tsx` |
| LogoLoop | Animations | Motion-DOM / lenis | motion | `src/ts-tailwind/Animations/LogoLoop/LogoLoop.tsx` |
| MagicRings | Animations | OGL-shader / canvas | ogl | `src/ts-tailwind/Animations/MagicRings/MagicRings.tsx` |
| Magnet | Animations | vanilla pointer | (none) | `src/ts-tailwind/Animations/Magnet/Magnet.tsx` |
| MagnetLines | Animations | canvas | (none) | `src/ts-tailwind/Animations/MagnetLines/MagnetLines.tsx` |
| MetaBalls | Animations | OGL-shader | ogl | `src/ts-tailwind/Animations/MetaBalls/MetaBalls.tsx` |
| MetallicPaint | Animations | OGL-shader | ogl | `src/ts-tailwind/Animations/MetallicPaint/MetallicPaint.tsx` |
| Noise | Animations | OGL-shader / CSS | ogl or css | `src/ts-tailwind/Animations/Noise/Noise.tsx` |
| OrbitImages | Animations | Motion-DOM (SVG) | motion | `src/ts-tailwind/Animations/OrbitImages/OrbitImages.tsx` |
| PixelTrail | Animations | canvas | (none) | `src/ts-tailwind/Animations/PixelTrail/PixelTrail.tsx` |
| PixelTransition | Animations | canvas | (none) | `src/ts-tailwind/Animations/PixelTransition/PixelTransition.tsx` |
| Ribbons | Animations | R3F-3D | three + meshline | `src/ts-tailwind/Animations/Ribbons/Ribbons.tsx` |
| ShapeBlur | Animations | OGL-shader | ogl | `src/ts-tailwind/Animations/ShapeBlur/ShapeBlur.tsx` |
| SplashCursor | Animations | OGL-shader (fluid sim) | ogl | `src/ts-tailwind/Animations/SplashCursor/SplashCursor.tsx` |
| StarBorder | Animations | CSS | (CSS-only) | `src/ts-tailwind/Animations/StarBorder/StarBorder.tsx` |
| StickerPeel | Animations | matter-js-2D / CSS 3D | matter-js | `src/ts-tailwind/Animations/StickerPeel/StickerPeel.tsx` |
| TargetCursor | Animations | Motion-DOM | motion | `src/ts-tailwind/Animations/TargetCursor/TargetCursor.tsx` |

## Components

| Name | Family | Dim | Primary deps | Closest example |
| --- | --- | --- | --- | --- |
| AnimatedList | Components | Motion-DOM | motion | `src/ts-tailwind/Components/AnimatedList/AnimatedList.tsx` |
| BorderGlow | Components | CSS / mouseMove | (none) | `src/ts-tailwind/Components/BorderGlow/BorderGlow.tsx` |
| BounceCards | Components | Motion-DOM / GSAP | motion / gsap | `src/ts-tailwind/Components/BounceCards/BounceCards.tsx` |
| BubbleMenu | Components | Motion-DOM | motion | `src/ts-tailwind/Components/BubbleMenu/BubbleMenu.tsx` |
| CardNav | Components | Motion-DOM | motion | `src/ts-tailwind/Components/CardNav/CardNav.tsx` |
| CardSwap | Components | GSAP (timeline + cloneElement) | gsap | `src/ts-tailwind/Components/CardSwap/CardSwap.tsx` |
| Carousel | Components | Motion-DOM + gestures | `@use-gesture/react` + motion | `src/ts-tailwind/Components/Carousel/Carousel.tsx` |
| ChromaGrid | Components | Motion-DOM / CSS | motion | `src/ts-tailwind/Components/ChromaGrid/ChromaGrid.tsx` |
| CircularGallery | Components | R3F-3D / OGL-shader | three or ogl | `src/ts-tailwind/Components/CircularGallery/CircularGallery.tsx` |
| Counter | Components | Motion-DOM | motion (`useMotionValue`) | `src/ts-tailwind/Components/Counter/Counter.tsx` |
| DecayCard | Components | OGL-shader / canvas | ogl | `src/ts-tailwind/Components/DecayCard/DecayCard.tsx` |
| Dock | Components | Motion-DOM | motion (`useTransform`, `useMotionValue`) | `src/ts-tailwind/Components/Dock/Dock.tsx` |
| DomeGallery | Components | R3F-3D | three + R3F | `src/ts-tailwind/Components/DomeGallery/DomeGallery.tsx` |
| ElasticSlider | Components | Motion-DOM + gestures | motion + `@use-gesture/react` | `src/ts-tailwind/Components/ElasticSlider/ElasticSlider.tsx` |
| FlowingMenu | Components | GSAP | gsap | `src/ts-tailwind/Components/FlowingMenu/FlowingMenu.tsx` |
| FluidGlass | Components | R3F-3D | three + R3F + postprocessing | `src/ts-tailwind/Components/FluidGlass/FluidGlass.tsx` |
| FlyingPosters | Components | GSAP + CSS 3D | gsap | `src/ts-tailwind/Components/FlyingPosters/FlyingPosters.tsx` |
| Folder | Components | Motion-DOM | motion | `src/ts-tailwind/Components/Folder/Folder.tsx` |
| GlassIcons | Components | CSS | (CSS-only) | `src/ts-tailwind/Components/GlassIcons/GlassIcons.tsx` |
| GlassSurface | Components | OGL-shader / postprocessing | ogl | `src/ts-tailwind/Components/GlassSurface/GlassSurface.tsx` |
| GooeyNav | Components | Motion-DOM (SVG goo filter) | motion | `src/ts-tailwind/Components/GooeyNav/GooeyNav.tsx` |
| InfiniteMenu | Components | GSAP / Motion-DOM | gsap or motion | `src/ts-tailwind/Components/InfiniteMenu/InfiniteMenu.tsx` |
| Lanyard | Components | R3F-3D + 3D physics | three + R3F + drei + rapier | `src/ts-tailwind/Components/Lanyard/Lanyard.tsx` (+ `card.glb`, `lanyard.png`) |
| MagicBento | Components | Motion-DOM / GSAP | motion / gsap | `src/ts-tailwind/Components/MagicBento/MagicBento.tsx` |
| Masonry | Components | Motion-DOM | motion | `src/ts-tailwind/Components/Masonry/Masonry.tsx` |
| ModelViewer | Components | R3F-3D | three + R3F + drei | `src/ts-tailwind/Components/ModelViewer/ModelViewer.tsx` |
| PillNav | Components | Motion-DOM / GSAP | motion or gsap | `src/ts-tailwind/Components/PillNav/PillNav.tsx` |
| PixelCard | Components | canvas | (none) | `src/ts-tailwind/Components/PixelCard/PixelCard.tsx` |
| ProfileCard | Components | Motion-DOM (mouseMove glare) | motion | `src/ts-tailwind/Components/ProfileCard/ProfileCard.tsx` |
| ReflectiveCard | Components | webcam + Motion-DOM | face-api.js | `src/ts-tailwind/Components/ReflectiveCard/ReflectiveCard.tsx` |
| ScrollStack | Components | lenis + manual rAF | lenis | `src/ts-tailwind/Components/ScrollStack/ScrollStack.tsx` |
| SpotlightCard | Components | CSS / mouseMove | (none) | `src/ts-tailwind/Components/SpotlightCard/SpotlightCard.tsx` |
| Stack | Components | Motion-DOM (drag, AnimatePresence) | motion | `src/ts-tailwind/Components/Stack/Stack.tsx` |
| StaggeredMenu | Components | Motion-DOM | motion | `src/ts-tailwind/Components/StaggeredMenu/StaggeredMenu.tsx` |
| Stepper | Components | Motion-DOM | motion | `src/ts-tailwind/Components/Stepper/Stepper.tsx` |
| TiltedCard | Components | Motion-DOM | motion (`useSpring`, `useMotionValue`) | `src/ts-tailwind/Components/TiltedCard/TiltedCard.tsx` |

## Backgrounds (selected — most are OGL-shader)

| Name | Family | Dim | Primary deps | Closest example |
| --- | --- | --- | --- | --- |
| Aurora | Backgrounds | OGL-shader | ogl | `src/ts-tailwind/Backgrounds/Aurora/Aurora.tsx` |
| Balatro | Backgrounds | OGL-shader | ogl | `src/ts-tailwind/Backgrounds/Balatro/Balatro.tsx` |
| Ballpit | Backgrounds | R3F-3D (raw three) | three (raw, InstancedMesh, custom physics) | `src/ts-tailwind/Backgrounds/Ballpit/Ballpit.tsx` |
| Beams | Backgrounds | OGL-shader / R3F-3D | ogl or three | `src/ts-tailwind/Backgrounds/Beams/Beams.tsx` |
| ColorBends | Backgrounds | OGL-shader | ogl | `src/ts-tailwind/Backgrounds/ColorBends/ColorBends.tsx` |
| DarkVeil | Backgrounds | R3F-3D | three + postprocessing | `src/ts-tailwind/Backgrounds/DarkVeil/DarkVeil.tsx` |
| Dither | Backgrounds | OGL-shader | ogl | `src/ts-tailwind/Backgrounds/Dither/Dither.tsx` |
| FloatingLines | Backgrounds | R3F-3D | three + R3F | `src/ts-tailwind/Backgrounds/FloatingLines/FloatingLines.tsx` |
| Galaxy | Backgrounds | R3F-3D / OGL-shader | three + R3F | `src/ts-tailwind/Backgrounds/Galaxy/Galaxy.tsx` |
| Hyperspeed | Backgrounds | R3F-3D (raw three) | three (raw + custom shader passes) | `src/ts-tailwind/Backgrounds/Hyperspeed/Hyperspeed.tsx` (+ `HyperSpeedPresets.ts`) |
| Iridescence | Backgrounds | OGL-shader | ogl | `src/ts-tailwind/Backgrounds/Iridescence/Iridescence.tsx` |
| LiquidChrome | Backgrounds | OGL-shader | ogl | `src/ts-tailwind/Backgrounds/LiquidChrome/LiquidChrome.tsx` |
| LiquidEther | Backgrounds | OGL-shader | ogl | `src/ts-tailwind/Backgrounds/LiquidEther/LiquidEther.tsx` |
| Particles | Backgrounds | OGL-shader (POINTS) | ogl | `src/ts-tailwind/Backgrounds/Particles/Particles.tsx` |
| PixelBlast | Backgrounds | R3F-3D | three + postprocessing | `src/ts-tailwind/Backgrounds/PixelBlast/PixelBlast.tsx` |
| Plasma | Backgrounds | OGL-shader | ogl | `src/ts-tailwind/Backgrounds/Plasma/Plasma.tsx` |
| Silk | Backgrounds | R3F-3D shader plane | three + R3F (`<shaderMaterial>`) | `src/ts-tailwind/Backgrounds/Silk/Silk.tsx` |
| SoftAurora | Backgrounds | OGL-shader (3D Perlin) | ogl | `src/ts-tailwind/Backgrounds/SoftAurora/SoftAurora.tsx` |
| Threads | Backgrounds | OGL-shader | ogl | `src/ts-tailwind/Backgrounds/Threads/Threads.tsx` |
| Waves | Backgrounds | OGL-shader | ogl | `src/ts-tailwind/Backgrounds/Waves/Waves.tsx` |

(See `src/ts-tailwind/Backgrounds/` in the cached repo for the full list of 41+ background components — most are OGL-shader. Other Backgrounds: Balatro, EvilEye, FaultyTerminal, GradientBlinds, Grainient, GridDistortion, GridMotion, GridScan, LetterGlitch, Lightning, LightPillar, LightRays, LineWaves, Orb, PixelSnow, PlasmaWave, Prism, PrismaticBurst, Radar, RippleGrid, ShapeGrid, SplashCursor.)

## Recommended study targets before authoring

Pick the closest existing analog, read it deeply, then diverge:

- **New OGL shader background** → `src/ts-tailwind/Backgrounds/Aurora/Aurora.tsx` (canonical pattern, ~209 LoC). Then `Iridescence.tsx` for mouse-driven UVs. Then `Silk.tsx` for the R3F variant.
- **New 3D scene with mesh / lights / model** → `src/ts-tailwind/Components/ModelViewer/ModelViewer.tsx` (~515 LoC, comprehensive — loaders, controls, parallax, screenshot, fadeIn, autoRotate).
- **New Motion text effect** → `src/ts-tailwind/TextAnimations/BlurText/BlurText.tsx`.
- **New GSAP scroll text effect** → `src/ts-tailwind/TextAnimations/SplitText/SplitText.tsx`.
- **New scroll-pinned card layout** → `src/ts-tailwind/Components/ScrollStack/ScrollStack.tsx`.
- **New cursor-driven micro-interaction** → `src/ts-tailwind/Animations/Magnet/Magnet.tsx` (vanilla, simplest) or `src/ts-tailwind/Components/TiltedCard/TiltedCard.tsx` (Motion springs).
- **New particle system** → `src/ts-tailwind/Backgrounds/Particles/Particles.tsx` (OGL POINTS) or `src/ts-tailwind/Backgrounds/Ballpit/Ballpit.tsx` (Three.js InstancedMesh).
- **New 2D physics** → `src/ts-tailwind/TextAnimations/FallingText/FallingText.tsx`.
