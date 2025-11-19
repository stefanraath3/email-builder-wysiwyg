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

interface SendTestEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (emails: string[], variables: Record<string, any>) => void;
}

export function SendTestEmailModal({
  open,
  onOpenChange,
  onSend,
}: SendTestEmailModalProps) {
  const [emailAddresses, setEmailAddresses] = useState("");
  const [testVariables, setTestVariables] = useState("{\n  \n}");

  const handleSend = () => {
    // Parse email addresses (split by commas or newlines)
    const emails = emailAddresses
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    // Parse test variables JSON
    let variables = {};
    try {
      variables = JSON.parse(testVariables);
    } catch (error) {
      console.error("Invalid JSON in test variables:", error);
      // You might want to show an error message here
      return;
    }

    onSend(emails, variables);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email-addresses">Email addresses</Label>
            <Textarea
              id="email-addresses"
              placeholder="Enter email addresses..."
              value={emailAddresses}
              onChange={(e) => setEmailAddresses(e.target.value)}
              className="min-h-[120px] resize-none"
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
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend}>Send Test Email</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

