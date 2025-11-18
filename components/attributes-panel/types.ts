import type { BlockStyles } from "@/types/block-styles";

export interface SectionProps {
  styles: BlockStyles;
  onChange: (key: keyof BlockStyles, value: any) => void;
}

export interface LayoutSectionProps extends SectionProps {
  blockType: string | null;
}
