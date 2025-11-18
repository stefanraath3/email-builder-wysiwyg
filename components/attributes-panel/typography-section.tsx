"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ColorPicker } from "./color-picker";
import { SliderNumberInput } from "./slider-number-input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { SectionProps } from "./types";
import type { BlockStyles } from "@/types/block-styles";

export function TypographySection({ styles, onChange }: SectionProps) {
  return (
    <AccordionItem value="typography">
      <AccordionTrigger>Typography</AccordionTrigger>
      <AccordionContent className="space-y-4">
        <ColorPicker
          label="Text Color"
          value={styles.textColor}
          onChange={(val) => onChange("textColor", val)}
        />

        <SliderNumberInput
          label="Font Size"
          value={styles.fontSize}
          onChange={(val) => onChange("fontSize", val)}
          min={8}
          max={72}
        />

        <div className="space-y-2">
          <Label>Font Weight</Label>
          <Select
            value={styles.fontWeight?.toString() || "400"}
            onValueChange={(val) => onChange("fontWeight", parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="400">Regular (400)</SelectItem>
              <SelectItem value="500">Medium (500)</SelectItem>
              <SelectItem value="600">Semibold (600)</SelectItem>
              <SelectItem value="700">Bold (700)</SelectItem>
              <SelectItem value="800">Extra Bold (800)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <SliderNumberInput
          label="Line Height"
          value={styles.lineHeight}
          onChange={(val) => onChange("lineHeight", val)}
          min={1}
          max={3}
          unit=""
        />

        <div className="space-y-2">
          <Label>Text Decoration</Label>
          <Select
            value={styles.textDecoration || "none"}
            onValueChange={(val) =>
              onChange("textDecoration", val as BlockStyles["textDecoration"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="underline">Underline</SelectItem>
              <SelectItem value="line-through">Strikethrough</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
