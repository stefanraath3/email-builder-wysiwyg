"use client";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SliderNumberInputProps {
  label: string;
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}

export function SliderNumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  unit = "px",
}: SliderNumberInputProps) {
  const currentValue = value ?? min;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) {
                const clamped = Math.max(min, Math.min(max, val));
                onChange(clamped);
              }
            }}
            className="h-8 w-16"
            min={min}
            max={max}
          />
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <Slider
        value={[currentValue]}
        onValueChange={([val]) => onChange(val)}
        min={min}
        max={max}
      />
    </div>
  );
}
