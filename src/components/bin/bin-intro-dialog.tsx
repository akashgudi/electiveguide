"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BIN_FIRST_ADD_EVENT } from "@/hooks/use-course-bin";

/**
 * Shown once per browser, the first time a course is added to the bin.
 * Mounted once in the root layout rather than inside BinButton: bin buttons
 * sit inside course links, and clicks in a portaled dialog would bubble to them.
 * Only the "I understand" button closes it: no X, outside click or Escape.
 */
export function BinIntroDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onFirstAdd = () => setOpen(true);
    window.addEventListener(BIN_FIRST_ADD_EVENT, onFirstAdd);
    return () => window.removeEventListener(BIN_FIRST_ADD_EVENT, onFirstAdd);
  }, []);

  return (
    <Dialog open={open} disablePointerDismissal>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Course added to bin</DialogTitle>
          <DialogDescription>You can find your courses in the My Bin section of the menu.</DialogDescription>
        </DialogHeader>
        <p className="flex gap-2 rounded-md border border-warning bg-warning/15 p-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0" />
          Your bin is local to this browser, and will not transfer between browsers and devices.
        </p>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>I understand</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
