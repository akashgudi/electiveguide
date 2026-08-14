"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hellective:course-bin";

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

  const add = useCallback((courseId: string) => {
    setIds((prev) => {
      if (prev.includes(courseId)) return prev;
      const next = [...prev, courseId];
      writeBin(next);
      return next;
    });
  }, []);

  const remove = useCallback((courseId: string) => {
    setIds((prev) => {
      const next = prev.filter((id) => id !== courseId);
      writeBin(next);
      return next;
    });
  }, []);

  const toggle = useCallback((courseId: string) => {
    setIds((prev) => {
      const next = prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId];
      writeBin(next);
      return next;
    });
  }, []);

  const has = useCallback((courseId: string) => ids.includes(courseId), [ids]);

  return { ids, hydrated, add, remove, toggle, has };
}
