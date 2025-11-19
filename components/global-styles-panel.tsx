"use client";

import { useEmailTemplate } from "@/hooks/use-email-template";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ColorPickerInput } from "@/components/attributes-panel/color-picker-input";
import { PaddingControl } from "@/components/attributes-panel/padding-control";
import { SliderNumberInput } from "@/components/attributes-panel/slider-number-input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { GlobalStyles } from "@/types/email-template";
import {
  DEFAULT_PADDING,
  createDefaultGlobalStyles,
} from "@/lib/email-template-defaults";
import { RotateCcw } from "lucide-react";

interface GlobalStylesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Global styles panel for email template
 * Allows editing template-wide styling defaults
 */
export function GlobalStylesPanel({
  open,
  onOpenChange,
}: GlobalStylesPanelProps) {
  const { template, updateGlobalStyles } = useEmailTemplate();
  const { globalStyles } = template;

  const updateContainer = (updates: Partial<GlobalStyles["container"]>) => {
    const currentPadding = globalStyles.container?.padding ?? DEFAULT_PADDING;
    updateGlobalStyles({
      container: {
        ...globalStyles.container,
        ...updates,
        padding: updates.padding
          ? { ...currentPadding, ...updates.padding }
          : currentPadding,
      },
    });
  };

  const updateTypography = (updates: Partial<GlobalStyles["typography"]>) => {
    updateGlobalStyles({
      typography: { ...globalStyles.typography, ...updates },
    });
  };

  const updateLink = (updates: Partial<GlobalStyles["link"]>) => {
    updateGlobalStyles({
      link: { ...globalStyles.link, ...updates },
    });
  };

  const updateImage = (updates: Partial<GlobalStyles["image"]>) => {
    updateGlobalStyles({
      image: { ...globalStyles.image, ...updates },
    });
  };

  const updateButton = (updates: Partial<GlobalStyles["button"]>) => {
    const currentPadding = globalStyles.button?.padding ?? DEFAULT_PADDING;
    updateGlobalStyles({
      button: {
        ...globalStyles.button,
        ...updates,
        padding: updates.padding
          ? { ...currentPadding, ...updates.padding }
          : currentPadding,
      },
    });
  };

  const updateCodeBlock = (updates: Partial<GlobalStyles["codeBlock"]>) => {
    const currentPadding = globalStyles.codeBlock?.padding ?? DEFAULT_PADDING;
    updateGlobalStyles({
      codeBlock: {
        ...globalStyles.codeBlock,
        ...updates,
        padding: updates.padding
          ? { ...currentPadding, ...updates.padding }
          : currentPadding,
      },
    });
  };

  const updateInlineCode = (updates: Partial<GlobalStyles["inlineCode"]>) => {
    updateGlobalStyles({
      inlineCode: { ...globalStyles.inlineCode, ...updates },
    });
  };

  const updateCustomCSS = (css: string) => {
    updateGlobalStyles({ customCSS: css });
  };

  const handleResetToDefaults = () => {
    const defaults = createDefaultGlobalStyles();
    updateGlobalStyles(defaults);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[400px] bg-[hsl(var(--background))] overflow-y-auto"
      >
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Global Styles</SheetTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefaults}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Accordion type="single" collapsible className="w-full">
            {/* Container Section */}
            <AccordionItem value="container">
              <AccordionTrigger>Container</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Width</Label>
                  <SliderNumberInput
                    label=""
                    value={globalStyles.container.width}
                    onChange={(val) => updateContainer({ width: val })}
                    min={400}
                    max={800}
                    unit="px"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Alignment</Label>
                  <Select
                    value={globalStyles.container.align}
                    onValueChange={(val: "left" | "center" | "right") =>
                      updateContainer({ align: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <PaddingControl
                  value={globalStyles.container.padding}
                  onChange={(padding) => updateContainer({ padding })}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Typography Section */}
            <AccordionItem value="typography">
              <AccordionTrigger>Typography</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Input
                    type="text"
                    value={globalStyles.typography.fontFamily}
                    onChange={(e) =>
                      updateTypography({ fontFamily: e.target.value })
                    }
                    placeholder="system-ui, sans-serif"
                  />
                </div>

                <SliderNumberInput
                  label="Font Size"
                  value={globalStyles.typography.fontSize}
                  onChange={(val) => updateTypography({ fontSize: val })}
                  min={10}
                  max={24}
                  unit="px"
                />

                <SliderNumberInput
                  label="Line Height"
                  value={globalStyles.typography.lineHeight}
                  onChange={(val) => updateTypography({ lineHeight: val })}
                  min={1}
                  max={2.5}
                  unit=""
                />

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <ColorPickerInput
                    value={globalStyles.typography.color}
                    onChange={(color) => updateTypography({ color })}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Link Section */}
            <AccordionItem value="link">
              <AccordionTrigger>Link</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Color</Label>
                  <ColorPickerInput
                    value={globalStyles.link.color}
                    onChange={(color) => updateLink({ color })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Text Decoration</Label>
                  <Select
                    value={globalStyles.link.textDecoration}
                    onValueChange={(val: "none" | "underline") =>
                      updateLink({ textDecoration: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="underline">Underline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Image Section */}
            <AccordionItem value="image">
              <AccordionTrigger>Image</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <SliderNumberInput
                  label="Border Radius"
                  value={globalStyles.image.borderRadius}
                  onChange={(val) => updateImage({ borderRadius: val })}
                  min={0}
                  max={50}
                  unit="px"
                />
              </AccordionContent>
            </AccordionItem>

            {/* Button Section */}
            <AccordionItem value="button">
              <AccordionTrigger>Button</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <ColorPickerInput
                    value={globalStyles.button.backgroundColor}
                    onChange={(color) =>
                      updateButton({ backgroundColor: color })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <ColorPickerInput
                    value={globalStyles.button.textColor}
                    onChange={(color) => updateButton({ textColor: color })}
                  />
                </div>

                <SliderNumberInput
                  label="Border Radius"
                  value={globalStyles.button.borderRadius}
                  onChange={(val) => updateButton({ borderRadius: val })}
                  min={0}
                  max={50}
                  unit="px"
                />

                <PaddingControl
                  value={globalStyles.button.padding}
                  onChange={(padding) => updateButton({ padding })}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Code Block Section */}
            <AccordionItem value="codeBlock">
              <AccordionTrigger>Code Block</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <ColorPickerInput
                    value={globalStyles.codeBlock.backgroundColor}
                    onChange={(color) =>
                      updateCodeBlock({ backgroundColor: color })
                    }
                  />
                </div>

                <SliderNumberInput
                  label="Border Radius"
                  value={globalStyles.codeBlock.borderRadius}
                  onChange={(val) => updateCodeBlock({ borderRadius: val })}
                  min={0}
                  max={50}
                  unit="px"
                />

                <PaddingControl
                  value={globalStyles.codeBlock.padding}
                  onChange={(padding) => updateCodeBlock({ padding })}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Inline Code Section */}
            <AccordionItem value="inlineCode">
              <AccordionTrigger>Inline Code</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <ColorPickerInput
                    value={globalStyles.inlineCode.backgroundColor}
                    onChange={(color) =>
                      updateInlineCode({ backgroundColor: color })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <ColorPickerInput
                    value={globalStyles.inlineCode.textColor}
                    onChange={(color) => updateInlineCode({ textColor: color })}
                  />
                </div>

                <SliderNumberInput
                  label="Border Radius"
                  value={globalStyles.inlineCode.borderRadius}
                  onChange={(val) => updateInlineCode({ borderRadius: val })}
                  min={0}
                  max={50}
                  unit="px"
                />
              </AccordionContent>
            </AccordionItem>

            {/* Custom CSS Section */}
            <AccordionItem value="customCSS">
              <AccordionTrigger>Custom CSS</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Custom CSS (Advanced)</Label>
                  <Textarea
                    value={globalStyles.customCSS || ""}
                    onChange={(e) => updateCustomCSS(e.target.value)}
                    placeholder="/* Add custom CSS here */"
                    className="font-mono text-sm min-h-[200px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Custom CSS will be injected into the email template. Use
                    with caution.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
