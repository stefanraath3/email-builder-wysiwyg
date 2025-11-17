"use client";

import { useState } from "react";
import { useEmailTemplate } from "@/hooks/use-email-template";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, ChevronUp, Code } from "lucide-react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Enhanced JSON debug panel for EmailTemplate
 * Shows full template structure with collapsible sections
 */
export default function EmailTemplateDebugPanel() {
  const { template } = useEmailTemplate();
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(template, null, 2));
      toast.success("Template JSON copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
      console.error("Copy error:", error);
    }
  };

  return (
    <div className="mt-8 border-t border-border pt-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between mb-3">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Code className="h-4 w-4" />
              <span>JSON Output (Debug)</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </CollapsibleTrigger>
          {isOpen && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="gap-2"
            >
              <Copy className="h-3 w-3" />
              Copy JSON
            </Button>
          )}
        </div>

        <CollapsibleContent>
          <div className="bg-muted rounded-lg border border-border overflow-hidden">
            <Accordion type="multiple" defaultValue={["header", "content"]} className="w-full">
              {/* Header Section */}
              <AccordionItem value="header" className="border-b border-border">
                <AccordionTrigger className="px-4 py-2 text-xs font-medium">
                  Header
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-2">
                  <pre className="text-xs overflow-auto bg-background rounded p-3 border border-border">
                    {JSON.stringify(template.header, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>

              {/* Global Styles Section */}
              <AccordionItem value="globalStyles" className="border-b border-border">
                <AccordionTrigger className="px-4 py-2 text-xs font-medium">
                  Global Styles
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-2">
                  <pre className="text-xs overflow-auto bg-background rounded p-3 border border-border max-h-[300px] overflow-y-auto">
                    {JSON.stringify(template.globalStyles, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>

              {/* Content Section */}
              <AccordionItem value="content" className="border-b border-border">
                <AccordionTrigger className="px-4 py-2 text-xs font-medium">
                  Content (TipTap JSON)
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-2">
                  <pre className="text-xs overflow-auto bg-background rounded p-3 border border-border max-h-[400px] overflow-y-auto">
                    {JSON.stringify(template.content, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>

              {/* Variables Section */}
              <AccordionItem value="variables" className="border-b border-border">
                <AccordionTrigger className="px-4 py-2 text-xs font-medium">
                  Variables ({template.variables.length})
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-2">
                  <pre className="text-xs overflow-auto bg-background rounded p-3 border border-border">
                    {JSON.stringify(template.variables, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>

              {/* Metadata Section */}
              <AccordionItem value="metadata">
                <AccordionTrigger className="px-4 py-2 text-xs font-medium">
                  Metadata
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-2">
                  <pre className="text-xs overflow-auto bg-background rounded p-3 border border-border">
                    {JSON.stringify(
                      {
                        id: template.id,
                        createdAt: template.createdAt,
                        updatedAt: template.updatedAt,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Full JSON (collapsed by default) */}
            <div className="border-t border-border p-4">
              <details className="group">
                <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
                  Full Template JSON
                </summary>
                <pre className="text-xs overflow-auto bg-background rounded p-3 border border-border mt-2 max-h-[400px] overflow-y-auto">
                  {JSON.stringify(template, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

