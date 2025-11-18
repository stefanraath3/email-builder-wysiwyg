"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { PaddingControl } from "./padding-control";
import { AlignmentControl } from "./alignment-control";
import type { LayoutSectionProps } from "./types";

export function LayoutSection({
  styles,
  onChange,
  blockType,
}: LayoutSectionProps) {
  return (
    <AccordionItem value="layout">
      <AccordionTrigger>Layout</AccordionTrigger>
      <AccordionContent className="space-y-4">
        <PaddingControl
          value={styles.padding}
          onChange={(val) => onChange("padding", val)}
        />

        <AlignmentControl
          value={styles.textAlign}
          onChange={(val) => onChange("textAlign", val)}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
