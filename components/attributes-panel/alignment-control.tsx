"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { Label } from "@/components/ui/label";

type TextAlign = "left" | "center" | "right" | "justify";

interface AlignmentControlProps {
  value?: TextAlign;
  onChange: (value: TextAlign) => void;
}

export function AlignmentControl({ value, onChange }: AlignmentControlProps) {
  return (
    <div className="space-y-2">
      <Label>Alignment</Label>
      <ToggleGroup
        type="single"
        value={value || "left"}
        onValueChange={(val) => {
          if (val) {
            onChange(val as TextAlign);
          }
        }}
        className="justify-start"
      >
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="justify" aria-label="Justify">
          <AlignJustify className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
