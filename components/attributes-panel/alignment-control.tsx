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
        <SelectItem
          value="left"
          className="cursor-pointer hover:bg-(--novel-stone-200) focus:bg-(--novel-stone-200)"
        >
          Left
        </SelectItem>
        <SelectItem
          value="center"
          className="cursor-pointer hover:bg-(--novel-stone-200) focus:bg-(--novel-stone-200)"
        >
          Center
        </SelectItem>
        <SelectItem
          value="right"
          className="cursor-pointer hover:bg-(--novel-stone-200) focus:bg-(--novel-stone-200)"
        >
          Right
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
