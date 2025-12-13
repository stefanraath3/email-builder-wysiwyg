"use client";

import { useEmailTemplate } from "@/hooks/use-email-template";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Template header component with editable fields
 * Allows editing email header information: from, replyTo, subject, preview
 * Styled as a vertical column matching the editor width, with bottom borders
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
    <div className="space-y-0">
      {/* From Field */}
      <div className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <label
            htmlFor="header-from"
            className="text-sm font-medium text-muted-foreground"
          >
            From
          </label>
          <div className="flex-1 ml-4">
            <Input
              id="header-from"
              type="email"
              value={header.from}
              onChange={handleFromChange}
              placeholder="sender@example.com"
              className={cn(
                "border-0 px-0 h-auto py-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
                header.from && !emailRegex.test(header.from)
                  ? "text-destructive"
                  : ""
              )}
            />
            {header.from && !emailRegex.test(header.from) && (
              <p className="text-xs text-destructive mt-1">
                Please enter a valid email address
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reply-To Field */}
      <div className="py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <label
            htmlFor="header-reply-to"
            className="text-sm font-medium text-muted-foreground"
          >
            Reply-To
          </label>
          <div className="flex-1 ml-4">
            <Input
              id="header-reply-to"
              type="email"
              value={header.replyTo}
              onChange={handleReplyToChange}
              placeholder="reply@example.com"
              className={cn(
                "border-0 px-0 h-auto py-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
                header.replyTo && !emailRegex.test(header.replyTo)
                  ? "text-destructive"
                  : ""
              )}
            />
            {header.replyTo && !emailRegex.test(header.replyTo) && (
              <p className="text-xs text-destructive mt-1">
                Please enter a valid email address
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Preview Text Field */}
      <div className="py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <label
            htmlFor="header-preview"
            className="text-sm font-medium text-muted-foreground"
          >
            Preview
          </label>
          <div className="flex-1 ml-4 flex items-center gap-2">
            <Input
              id="header-preview"
              type="text"
              value={header.preview}
              onChange={handlePreviewChange}
              placeholder="Preview text shown in inbox"
              maxLength={150}
              className="border-0 px-0 h-auto py-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {header.preview.length}/150
            </span>
          </div>
        </div>
      </div>

      {/* Subject Field */}
      <div className="py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <label
            htmlFor="header-subject"
            className="text-sm font-medium text-muted-foreground"
          >
            Subject
          </label>
          <div className="flex-1 ml-4 flex items-center gap-2">
            <Input
              id="header-subject"
              type="text"
              value={header.subject}
              onChange={handleSubjectChange}
              placeholder="Your email subject"
              maxLength={100}
              className="border-0 px-0 h-auto py-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {header.subject.length}/100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
