"use client";

import { useEmailTemplate } from "@/hooks/use-email-template";
import { Mail, Reply, FileText, Eye } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Template header component with editable fields
 * Allows editing email header information: from, replyTo, subject, preview
 */
export default function TemplateHeader() {
  const { template, updateHeader } = useEmailTemplate();
  const { header } = template;

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateHeader({ from: e.target.value });
  };

  const handleReplyToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateHeader({ replyTo: e.target.value });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateHeader({ subject: e.target.value });
  };

  const handlePreviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateHeader({ preview: e.target.value });
  };

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
            <label
              htmlFor="header-from"
              className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
            >
              <Mail className="h-3 w-3" />
              From
            </label>
            <Input
              id="header-from"
              type="email"
              value={header.from}
              onChange={handleFromChange}
              placeholder="sender@example.com"
              className={
                header.from && !emailRegex.test(header.from)
                  ? "border-destructive"
                  : ""
              }
            />
            {header.from && !emailRegex.test(header.from) && (
              <p className="text-xs text-destructive">
                Please enter a valid email address
              </p>
            )}
          </div>

          {/* Reply-To Field */}
          <div className="space-y-1">
            <label
              htmlFor="header-reply-to"
              className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
            >
              <Reply className="h-3 w-3" />
              Reply-To
            </label>
            <Input
              id="header-reply-to"
              type="email"
              value={header.replyTo}
              onChange={handleReplyToChange}
              placeholder="reply@example.com"
              className={
                header.replyTo && !emailRegex.test(header.replyTo)
                  ? "border-destructive"
                  : ""
              }
            />
            {header.replyTo && !emailRegex.test(header.replyTo) && (
              <p className="text-xs text-destructive">
                Please enter a valid email address
              </p>
            )}
          </div>
        </div>

        {/* Subject Field */}
        <div className="space-y-1">
          <label
            htmlFor="header-subject"
            className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
          >
            <FileText className="h-3 w-3" />
            Subject
          </label>
          <Input
            id="header-subject"
            type="text"
            value={header.subject}
            onChange={handleSubjectChange}
            placeholder="Your email subject"
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            {header.subject.length}/100 characters
          </p>
        </div>

        {/* Preview Text Field */}
        <div className="space-y-1">
          <label
            htmlFor="header-preview"
            className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
          >
            <Eye className="h-3 w-3" />
            Preview Text
          </label>
          <Input
            id="header-preview"
            type="text"
            value={header.preview}
            onChange={handlePreviewChange}
            placeholder="Preview text shown in inbox"
            maxLength={150}
          />
          <p className="text-xs text-muted-foreground">
            {header.preview.length}/150 characters
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
