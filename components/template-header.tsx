"use client";

import { useEmailTemplate } from "@/hooks/use-email-template";
import { Mail, Reply, FileText, Eye } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

/**
 * Template header display component (read-only for Phase 1)
 * Shows email header information: from, replyTo, subject, preview
 */
export default function TemplateHeader() {
  const { template } = useEmailTemplate();
  const { header } = template;

  return (
    <Collapsible defaultOpen={true} className="border-b border-border pb-4">
      <CollapsibleTrigger className="flex items-center justify-between w-full text-left hover:bg-muted/50 rounded-md px-3 py-2 transition-colors">
        <h2 className="text-sm font-semibold text-foreground">Email Header</h2>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* From Field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              From
            </label>
            <div className="text-sm text-foreground bg-muted/50 rounded-md px-3 py-2 border border-border">
              {header.from || <span className="text-muted-foreground italic">Not set</span>}
            </div>
          </div>

          {/* Reply-To Field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Reply className="h-3 w-3" />
              Reply-To
            </label>
            <div className="text-sm text-foreground bg-muted/50 rounded-md px-3 py-2 border border-border">
              {header.replyTo || <span className="text-muted-foreground italic">Not set</span>}
            </div>
          </div>
        </div>

        {/* Subject Field */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            Subject
          </label>
          <div className="text-sm text-foreground bg-muted/50 rounded-md px-3 py-2 border border-border">
            {header.subject || <span className="text-muted-foreground italic">Not set</span>}
          </div>
        </div>

        {/* Preview Text Field */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Eye className="h-3 w-3" />
            Preview Text
          </label>
          <div className="text-sm text-foreground bg-muted/50 rounded-md px-3 py-2 border border-border">
            {header.preview || <span className="text-muted-foreground italic">Not set</span>}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

