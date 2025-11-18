"use client";

import { Input } from "@/components/ui/input";

interface ColorPickerInputProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ColorPickerInput({ value, onChange }: ColorPickerInputProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-14 cursor-pointer p-1"
      />
      <Input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 font-mono text-sm"
      />
    </div>
  );
}
