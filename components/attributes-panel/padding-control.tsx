"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";
import type { Padding } from "@/types/email-template";

interface PaddingControlProps {
  value?: Padding;
  onChange: (value: Padding) => void;
}

export function PaddingControl({ value, onChange }: PaddingControlProps) {
  const [locked, setLocked] = useState(true);
  const padding = value || { top: 0, right: 0, bottom: 0, left: 0 };

  const updateUnified = (val: number) => {
    onChange({ top: val, right: val, bottom: val, left: val });
  };

  const updateSide = (side: keyof Padding, val: number) => {
    onChange({ ...padding, [side]: val });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Padding</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocked(!locked)}
          type="button"
        >
          {locked ? (
            <Lock className="h-4 w-4" />
          ) : (
            <Unlock className="h-4 w-4" />
          )}
        </Button>
      </div>

      {locked ? (
        <Input
          type="number"
          value={padding.top}
          onChange={(e) => updateUnified(parseInt(e.target.value) || 0)}
          placeholder="All sides"
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Top</Label>
            <Input
              type="number"
              value={padding.top}
              onChange={(e) => updateSide("top", parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label className="text-xs">Right</Label>
            <Input
              type="number"
              value={padding.right}
              onChange={(e) =>
                updateSide("right", parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div>
            <Label className="text-xs">Bottom</Label>
            <Input
              type="number"
              value={padding.bottom}
              onChange={(e) =>
                updateSide("bottom", parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div>
            <Label className="text-xs">Left</Label>
            <Input
              type="number"
              value={padding.left}
              onChange={(e) =>
                updateSide("left", parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
