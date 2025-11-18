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

export function AppearanceSection({ styles, onChange }: SectionProps) {
  return (
    <AccordionItem value="appearance">
      <AccordionTrigger>Appearance</AccordionTrigger>
      <AccordionContent className="space-y-4">
        <ColorPicker
          label="Background Color"
          value={styles.backgroundColor}
          onChange={(val) => onChange("backgroundColor", val)}
        />

        <SliderNumberInput
          label="Border Radius"
          value={styles.borderRadius}
          onChange={(val) => onChange("borderRadius", val)}
          min={0}
          max={50}
        />

        {/* Border Width - auto-enables border */}
        <SliderNumberInput
          label="Border Width"
          value={styles.borderWidth}
          onChange={(val) => onChange("borderWidth", val)}
          min={0}
          max={10}
        />

        {/* Show style and color only when width > 0 */}
        {styles.borderWidth && styles.borderWidth > 0 && (
          <>
            <div className="space-y-2">
              <Label>Border Style</Label>
              <Select
                value={styles.borderStyle || "solid"}
                onValueChange={(val) =>
                  onChange("borderStyle", val as BlockStyles["borderStyle"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ColorPicker
              label="Border Color"
              value={styles.borderColor}
              onChange={(val) => onChange("borderColor", val)}
            />
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
