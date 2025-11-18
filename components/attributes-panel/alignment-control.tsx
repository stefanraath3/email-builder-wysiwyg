"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type TextAlign = "left" | "center" | "right";

interface AlignmentControlProps {
  value?: TextAlign;
  onChange: (value: TextAlign) => void;
}

export function AlignmentControl({ value, onChange }: AlignmentControlProps) {
  return (
    <Select
      value={value || "left"}
      onValueChange={(val) => onChange(val as TextAlign)}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="left">Left</SelectItem>
        <SelectItem value="center">Center</SelectItem>
        <SelectItem value="right">Right</SelectItem>
      </SelectContent>
    </Select>
  );
}
