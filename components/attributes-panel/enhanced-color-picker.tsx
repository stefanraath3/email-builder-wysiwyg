"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EnhancedColorPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export function EnhancedColorPicker({
  value,
  onChange,
}: EnhancedColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [hexValue, setHexValue] = useState(value || "#000000");

  const handleHexChange = (newHex: string) => {
    setHexValue(newHex);
    onChange(newHex);
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setHexValue(newColor);
    onChange(newColor);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-8 justify-start gap-2 px-2"
          style={{ width: "100%" }}
        >
          <div
            className="h-5 w-5 rounded border"
            style={{
              backgroundColor: value || "#000000",
            }}
          />
          <span className="text-xs font-mono">{value || "#000000"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-3">
          {/* Native color picker */}
          <div className="relative h-32 w-full overflow-hidden rounded">
            <input
              type="color"
              value={hexValue}
              onChange={handleNativePickerChange}
              className="absolute inset-0 h-full w-full cursor-pointer border-0"
              style={{
                width: "120%",
                height: "120%",
                margin: "-10%",
              }}
            />
          </div>

          {/* Hex input */}
          <Input
            type="text"
            value={hexValue}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="#000000"
            className="font-mono text-xs"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

