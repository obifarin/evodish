"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";

export default function DishGuide({ advancedMode }: { advancedMode: boolean }) {
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top?: number; bottom?: number } | null>(null);
  const isOpen = position !== null;

  const open = () => {
    const bounds = container.current?.getBoundingClientRect();
    if (!bounds) return;
    const width = Math.min(300, window.innerWidth - 32);
    setPosition({
      left: Math.max(16, Math.min(bounds.right - width, window.innerWidth - width - 16)),
      ...(window.innerHeight - bounds.bottom >= 240
        ? { top: bounds.bottom }
        : { bottom: window.innerHeight - bounds.top }),
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setPosition(null);
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) close();
    };
    window.addEventListener("keydown", escape);
    window.addEventListener("pointerdown", outside);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("keydown", escape);
      window.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [isOpen]);

  return (
    <div ref={container} className="dish-guide" onMouseEnter={open}
      onMouseLeave={() => { if (!container.current?.contains(document.activeElement)) setPosition(null); }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPosition(null); }}>
      <button type="button" className="dish-guide-trigger" onFocus={open} onClick={open}
        aria-describedby={isOpen ? id : undefined}>
        <Info size={13} aria-hidden="true" /> Reading the dish
      </button>
      {position && <div className="dish-guide-popover" style={position}>
        <div id={id} role="tooltip" className="dish-guide-content">
          <p>Dashed: lethal boundary{advancedMode ? " · Dotted: stress halo · Violet filament: recent transfer" : ""}.</p>
          <p>{advancedMode
            ? "Subtle violet filaments mark recent resistance transfers between cells. Banded rust cells are resistant, whatever the source."
            : "Banded rust cells are resistant. Gene transfer and the stress halo are off in Basic mode; choose Advanced to enable them."}</p>
        </div>
      </div>}
    </div>
  );
}
