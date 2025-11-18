"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { SectionProps } from "./types";

export function ImageSection({ styles, onChange }: SectionProps) {
  return (
    <AccordionItem value="image">
      <AccordionTrigger>Image Settings</AccordionTrigger>
      <AccordionContent className="space-y-4">
        <div className="space-y-2">
          <Label>Width</Label>
          <Input
            type="number"
            value={styles.width || ""}
            onChange={(e) =>
              onChange(
                "width",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            placeholder="Auto"
          />
        </div>

        <div className="space-y-2">
          <Label>Height</Label>
          <Select
            value={
              typeof styles.height === "number"
                ? styles.height.toString()
                : "auto"
            }
            onValueChange={(val) =>
              onChange("height", val === "auto" ? "auto" : parseInt(val))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
