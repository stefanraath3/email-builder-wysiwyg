"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SendTestEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (
    emails: string[],
    variables: Record<string, any>,
    subject: string
  ) => Promise<void>;
}

export function SendTestEmailModal({
  open,
  onOpenChange,
  onSend,
}: SendTestEmailModalProps) {
  const [emailAddresses, setEmailAddresses] = useState("");
  const [testVariables, setTestVariables] = useState("{\n  \n}");
  const [subject, setSubject] = useState("[TEST] Email Template Preview");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setError(null);

    // Parse email addresses (split by commas or newlines)
    const emails = emailAddresses
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (emails.length === 0) {
      setError("Please enter at least one email address");
      return;
    }

    // Parse test variables JSON
    let variables = {};
    try {
      variables = JSON.parse(testVariables);
    } catch (error) {
      console.error("Invalid JSON in test variables:", error);
      setError("Invalid JSON in test variables");
      return;
    }

    setIsLoading(true);
    try {
      await onSend(emails, variables, subject);
      onOpenChange(false);
      // Reset form
      setEmailAddresses("");
      setTestVariables("{\n  \n}");
      setSubject("[TEST] Email Template Preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject line</Label>
            <Textarea
              id="subject"
              placeholder="[TEST] Email Template Preview"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-addresses">Email addresses</Label>
            <Textarea
              id="email-addresses"
              placeholder="Enter email addresses..."
              value={emailAddresses}
              onChange={(e) => setEmailAddresses(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Use commas or line breaks to separate multiple email addresses.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-variables">Test variables</Label>
            <Textarea
              id="test-variables"
              placeholder='{"name": "John"}'
              value={testVariables}
              onChange={(e) => setTestVariables(e.target.value)}
              className="min-h-[120px] resize-none font-mono text-sm"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Add variables to replace placeholders like{" "}
              <code>{"{{name}}"}</code>
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Sending..." : "Send Test Email"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
