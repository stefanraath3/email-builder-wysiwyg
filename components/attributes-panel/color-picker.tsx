"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const PRESET_COLORS = [
  "#000000",
  "#FFFFFF",
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <div
              className="mr-2 h-5 w-5 rounded border"
              style={{
                backgroundColor: value || "transparent",
              }}
            />
            {value || "Default"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <Input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
            />
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className="h-8 w-8 rounded border hover:ring-2"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange(color);
                    setOpen(false);
                  }}
                  type="button"
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
