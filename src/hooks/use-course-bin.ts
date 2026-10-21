"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hellective:course-bin";
const INTRO_SEEN_KEY = "hellective:bin-intro-seen";
export const BIN_FIRST_ADD_EVENT = "hellective:bin-first-add";

function readBin(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeBin(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("hellective:bin-changed"));
}

// The first add on this browser fires BIN_FIRST_ADD_EVENT so <BinIntroDialog>
// can explain where the bin lives. Marked seen up front so it only ever shows once.
function noteAdded() {
  try {
    if (window.localStorage.getItem(INTRO_SEEN_KEY)) return;
    window.localStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    return;
  }
  window.dispatchEvent(new CustomEvent(BIN_FIRST_ADD_EVENT));
}

export function useCourseBin() {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(readBin());
    setHydrated(true);
    const onChange = () => setIds(readBin());
    window.addEventListener("hellective:bin-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("hellective:bin-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  // Write to storage outside of setState: writeBin fires bin-changed, and the
  // listener above updates every instance (this one included) from storage.
  const add = useCallback((courseId: string) => {
    const prev = readBin();
    if (prev.includes(courseId)) return;
    writeBin([...prev, courseId]);
    noteAdded();
  }, []);

  const remove = useCallback((courseId: string) => {
    writeBin(readBin().filter((id) => id !== courseId));
  }, []);

  const toggle = useCallback((courseId: string) => {
    const prev = readBin();
    if (prev.includes(courseId)) {
      writeBin(prev.filter((id) => id !== courseId));
    } else {
      writeBin([...prev, courseId]);
      noteAdded();
    }
  }, []);

  const has = useCallback((courseId: string) => ids.includes(courseId), [ids]);

  return { ids, hydrated, add, remove, toggle, has };
}
