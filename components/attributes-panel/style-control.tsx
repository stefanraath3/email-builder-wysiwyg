"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Minus } from "lucide-react";
import type { BlockStyles } from "@/types/block-styles";
import type { StyleOption } from "./style-dropdown-menu";
import { ColorPickerInput } from "./color-picker-input";
import { PaddingControl } from "./padding-control";
import { SliderNumberInput } from "./slider-number-input";

interface StyleControlProps {
  styleKey: StyleOption;
  styles: BlockStyles;
  onChange: (key: keyof BlockStyles, value: any) => void;
  onRemove: () => void;
}

const STYLE_LABELS: Record<StyleOption, string> = {
  backgroundColor: "Background",
  borderRadius: "Border Radius",
  borderWidth: "Border Width",
  borderStyle: "Border Style",
  borderColor: "Border Color",
  textColor: "Text Color",
  fontSize: "Font Size",
  fontWeight: "Font Weight",
  lineHeight: "Line Height",
  textDecoration: "Text Decoration",
  padding: "Padding",
};

export function StyleControl({
  styleKey,
  styles,
  onChange,
  onRemove,
}: StyleControlProps) {
  const label = STYLE_LABELS[styleKey];

  const renderControl = () => {
    switch (styleKey) {
      case "backgroundColor":
      case "borderColor":
      case "textColor":
        return (
          <ColorPickerInput
            value={styles[styleKey]}
            onChange={(val) => onChange(styleKey, val)}
          />
        );

      case "borderRadius":
        return (
          <SliderNumberInput
            label=""
            value={styles.borderRadius}
            onChange={(val) => onChange("borderRadius", val)}
            min={0}
            max={50}
          />
        );

      case "borderWidth":
        return (
          <SliderNumberInput
            label=""
            value={styles.borderWidth}
            onChange={(val) => onChange("borderWidth", val)}
            min={0}
            max={10}
          />
        );

      case "fontSize":
        return (
          <SliderNumberInput
            label=""
            value={styles.fontSize}
            onChange={(val) => onChange("fontSize", val)}
            min={8}
            max={72}
          />
        );

      case "lineHeight":
        return (
          <SliderNumberInput
            label=""
            value={styles.lineHeight}
            onChange={(val) => onChange("lineHeight", val)}
            min={1}
            max={3}
            unit=""
          />
        );

      case "borderStyle":
        return (
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
              <SelectItem
                value="solid"
                className="cursor-pointer hover:bg-[var(--novel-stone-200)] focus:bg-[var(--novel-stone-200)]"
              >
                Solid
              </SelectItem>
              <SelectItem
                value="dashed"
                className="cursor-pointer hover:bg-[var(--novel-stone-200)] focus:bg-[var(--novel-stone-200)]"
              >
                Dashed
              </SelectItem>
              <SelectItem
                value="dotted"
                className="cursor-pointer hover:bg-[var(--novel-stone-200)] focus:bg-[var(--novel-stone-200)]"
              >
                Dotted
              </SelectItem>
              <SelectItem
                value="none"
                className="cursor-pointer hover:bg-[var(--novel-stone-200)] focus:bg-[var(--novel-stone-200)]"
              >
                None
              </SelectItem>
            </SelectContent>
          </Select>
        );

      case "fontWeight":
        return (
          <Select
            value={styles.fontWeight?.toString() || "400"}
            onValueChange={(val) => onChange("fontWeight", parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="400"
                className="cursor-pointer hover:bg-[var(--novel-stone-200)] focus:bg-[var(--novel-stone-200)]"
              >
                Regular
              </SelectItem>
              <SelectItem
                value="500"
                className="cursor-pointer hover:bg-[var(--novel-stone-200)] focus:bg-[var(--novel-stone-200)]"
              >
                Medium
              </SelectItem>
              <SelectItem
                value="600"
                className="cursor-pointer hover:bg-[var(--novel-stone-200)] focus:bg-[var(--novel-stone-200)]"
              >
                Semibold
              </SelectItem>
              <SelectItem
                value="700"
                className="cursor-pointer hover:bg-[var(--novel-stone-200)] focus:bg-[var(--novel-stone-200)]"
              >
                Bold
              </SelectItem>
              <SelectItem
                value="800"
                className="cursor-pointer hover:bg-[var(--novel-stone-200)] focus:bg-[var(--novel-stone-200)]"
              >
                Extra Bold
              </SelectItem>
            </SelectContent>
          </Select>
        );

      case "textDecoration":
        return (
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
              <SelectItem
                value="none"
                className="cursor-pointer hover:bg-[var(--novel-stone-200)] focus:bg-[var(--novel-stone-200)]"
              >
                None
              </SelectItem>
              <SelectItem
                value="underline"
                className="cursor-pointer hover:bg-[var(--novel-stone-200)] focus:bg-[var(--novel-stone-200)]"
              >
                Underline
              </SelectItem>
              <SelectItem
                value="line-through"
                className="cursor-pointer hover:bg-[var(--novel-stone-200)] focus:bg-[var(--novel-stone-200)]"
              >
                Strikethrough
              </SelectItem>
            </SelectContent>
          </Select>
        );

      case "padding":
        return (
          <PaddingControl
            value={styles.padding}
            onChange={(val) => onChange("padding", val)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2 border-b border-border pb-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onRemove}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>
      {renderControl()}
    </div>
  );
}
