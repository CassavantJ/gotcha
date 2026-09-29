import type { ReactNode } from 'react';

interface HitProps {
  label: string;
  onPress: () => void;
  children: ReactNode;
}

/**
 * A clickable part of an SVG picture. It's a real button to keyboards and screen readers:
 * focusable, labeled, and pressed with Enter or Space.
 */
export function Hit({ label, onPress, children }: HitProps) {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      className="hit"
      onClick={onPress}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onPress();
        }
      }}
    >
      {children}
    </g>
  );
}
