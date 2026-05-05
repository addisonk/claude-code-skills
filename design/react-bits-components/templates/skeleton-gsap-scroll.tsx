// Skeleton: GSAP scroll-pinned component (TS-TW)
// Modeled on: src/ts-tailwind/Animations/AnimatedContent/AnimatedContent.tsx
// Pattern: useGSAP({ scope: ref }) for auto-cleanup; ScrollTrigger trigger-once entrance;
// power3.out default; force3D + willChange for GPU compositing.
//
// Drop into: src/ts-tailwind/<Category>/<Name>/<Name>.tsx

import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface ScrollAnimateProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Px of offset to animate from (along axis). */
  distance?: number;
  /** Vertical or horizontal entrance. */
  direction?: 'vertical' | 'horizontal';
  /** Reverse the direction of entrance. */
  reverse?: boolean;
  /** Duration in seconds. */
  duration?: number;
  /** GSAP ease string. */
  ease?: string;
  /** Initial opacity (0..1). */
  initialOpacity?: number;
  /** Whether to animate opacity. */
  animateOpacity?: boolean;
  /** Initial scale. */
  scale?: number;
  /** IntersectionObserver-equivalent trigger threshold (0..1). */
  threshold?: number;
  /** Pre-animation delay (s). */
  delay?: number;
  /** Optional scroll container override. */
  container?: Element | string | null;
  onComplete?: () => void;
}

const ScrollAnimate: React.FC<ScrollAnimateProps> = ({
  children,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  container,
  onComplete,
  className = '',
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      // Reduced-motion: render in final state, no tween.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1, visibility: 'visible' });
        onComplete?.();
        return;
      }

      const axis = direction === 'horizontal' ? 'x' : 'y';
      const offset = reverse ? -distance : distance;
      const startPct = (1 - threshold) * 100;

      let scroller: Element | string | null = container ?? null;
      if (typeof scroller === 'string') scroller = document.querySelector(scroller);

      gsap.set(el, {
        [axis]: offset,
        scale,
        opacity: animateOpacity ? initialOpacity : 1,
        visibility: 'visible',
        willChange: 'transform, opacity',
      });

      const tl = gsap.timeline({
        paused: true,
        delay,
        onComplete: () => onComplete?.(),
      });

      tl.to(el, {
        [axis]: 0,
        scale: 1,
        opacity: 1,
        duration,
        ease,
        force3D: true,
      });

      const st = ScrollTrigger.create({
        trigger: el,
        scroller: scroller || window,
        start: `top ${startPct}%`,
        once: true,
        onEnter: () => tl.play(),
        fastScrollEnd: true,
      });

      return () => {
        st.kill();
        tl.kill();
      };
    },
    {
      dependencies: [
        distance, direction, reverse, duration, ease, initialOpacity,
        animateOpacity, scale, threshold, delay, container,
      ],
      scope: ref,
    },
  );

  return (
    <div ref={ref} className={`invisible ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default ScrollAnimate;
