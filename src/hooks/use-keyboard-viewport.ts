"use client";

import { useSyncExternalStore } from "react";

// Smaller shrinks are browser chrome (URL bar) collapsing, not a keyboard.
const KEYBOARD_MIN_HEIGHT = 150;

function subscribe(onChange: () => void) {
  const vv = window.visualViewport;
  if (!vv) return () => {};
  vv.addEventListener("resize", onChange);
  vv.addEventListener("scroll", onChange);
  return () => {
    vv.removeEventListener("resize", onChange);
    vv.removeEventListener("scroll", onChange);
  };
}

// Snapshots must be stable between calls, so encode as a string.
function getSnapshot() {
  const vv = window.visualViewport;
  if (!vv) return "";
  // Pinch-zoom also shrinks the visual viewport; only count it as a keyboard at normal scale.
  const keyboardOpen = vv.scale <= 1.01 && window.innerHeight - vv.height > KEYBOARD_MIN_HEIGHT;
  return keyboardOpen ? `${vv.offsetTop}:${vv.height}` : "";
}

/**
 * The part of the screen left visible above the on-screen keyboard, or null
 * when no keyboard is open. Fixed-position UI can use it to stay in view.
 */
export function useKeyboardViewport(): { top: number; height: number } | null {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "");
  if (!snapshot) return null;
  const [top, height] = snapshot.split(":").map(Number);
  return { top, height };
}

/**
 * Inline styles for a centered fixed dialog (top-1/2 + -translate-y-1/2):
 * while the keyboard is open, re-center it in the space above the keyboard,
 * sliding up and back down as the keyboard shows and hides.
 */
export function useKeyboardAwareDialogStyle(): React.CSSProperties {
  const keyboard = useKeyboardViewport();
  return {
    top: keyboard ? keyboard.top + keyboard.height / 2 : "50%",
    maxHeight: keyboard ? keyboard.height - 32 : undefined,
    transition: "top 250ms ease-out, max-height 250ms ease-out",
  };
}
