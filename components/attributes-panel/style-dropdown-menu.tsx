"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export type StyleOption =
  | "backgroundColor"
  | "borderRadius"
  | "borderWidth"
  | "borderStyle"
  | "borderColor"
  | "textColor"
  | "fontSize"
  | "fontWeight"
  | "lineHeight"
  | "textDecoration"
  | "padding";

interface StyleDropdownMenuProps {
  activeStyles: Set<StyleOption>;
  onAddStyle: (style: StyleOption) => void;
  blockType: string | null;
}

const TEXT_BLOCKS = ["paragraph", "heading", "blockquote"];

export function StyleDropdownMenu({
  activeStyles,
  onAddStyle,
  blockType,
}: StyleDropdownMenuProps) {
  const isTextBlock = blockType && TEXT_BLOCKS.includes(blockType);

  const appearanceOptions: { value: StyleOption; label: string }[] = [
    { value: "backgroundColor", label: "Background" },
    { value: "borderRadius", label: "Border Radius" },
    { value: "borderWidth", label: "Border Width" },
    { value: "borderStyle", label: "Border Style" },
    { value: "borderColor", label: "Border Color" },
  ];

  const typographyOptions: { value: StyleOption; label: string }[] = [
    { value: "textColor", label: "Text Color" },
    { value: "fontSize", label: "Font Size" },
    { value: "fontWeight", label: "Font Weight" },
    { value: "lineHeight", label: "Line Height" },
    { value: "textDecoration", label: "Text Decoration" },
  ];

  const layoutOptions: { value: StyleOption; label: string }[] = [
    { value: "padding", label: "Padding" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        {appearanceOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onAddStyle(option.value)}
            disabled={activeStyles.has(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}

        {isTextBlock && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Typography</DropdownMenuLabel>
            {typographyOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onAddStyle(option.value)}
                disabled={activeStyles.has(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Layout</DropdownMenuLabel>
        {layoutOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onAddStyle(option.value)}
            disabled={activeStyles.has(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
