// Skeleton: Motion-driven 2D component (TS-TW)
// Modeled on: src/ts-tailwind/TextAnimations/BlurText/BlurText.tsx
// Pattern: IntersectionObserver gates `inView`, then per-letter staggered Motion spans.
//
// Drop into:  src/ts-tailwind/<Category>/<Name>/<Name>.tsx
// Then mirror: src/ts-default/, src/tailwind/, src/content/ (see references/four-variants.md).

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export interface MotionTextProps {
  text?: string;
  /** Per-letter stagger in milliseconds. */
  delay?: number;
  /** Per-letter duration in seconds. */
  duration?: number;
  /** IntersectionObserver threshold (0-1). */
  threshold?: number;
  /** IntersectionObserver rootMargin. */
  rootMargin?: string;
  /** Cubic-bezier easing as `[x1, y1, x2, y2]`. */
  ease?: [number, number, number, number];
  /** Initial state (Motion variant). */
  from?: { opacity?: number; y?: number; filter?: string };
  /** Final state (Motion variant). */
  to?: { opacity?: number; y?: number; filter?: string };
  className?: string;
  onAnimationComplete?: () => void;
}

const MotionText: React.FC<MotionTextProps> = ({
  text = '',
  delay = 50,
  duration = 0.6,
  threshold = 0.1,
  rootMargin = '0px',
  ease = [0.16, 1, 0.3, 1],
  from = { opacity: 0, y: 20, filter: 'blur(8px)' },
  to = { opacity: 1, y: 0, filter: 'blur(0px)' },
  className = '',
  onAnimationComplete,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  // Reduced-motion fallback: render the final state immediately, no animation.
  if (reduce) {
    return (
      <span ref={ref} className={`inline-block ${className}`} style={{ ...to as React.CSSProperties }}>
        {text}
      </span>
    );
  }

  const chars = text.split('');

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {chars.map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          initial={from}
          animate={inView ? to : from}
          transition={{
            duration,
            delay: (i * delay) / 1000,
            ease,
          }}
          onAnimationComplete={i === chars.length - 1 ? onAnimationComplete : undefined}
          style={{ display: 'inline-block', willChange: 'transform, opacity, filter' }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </span>
  );
};

export default MotionText;
