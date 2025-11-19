"use client";

import { useState, useEffect } from "react";
import {
  EmailTemplateProvider,
  useEmailTemplateContext,
} from "@/lib/email-template-context";
import { EmailTemplateEditor } from "@/components/email-template-editor";
import { GlobalStylesPanel } from "@/components/global-styles-panel";
import { EmailTransformTestModal } from "@/components/email-transform-test-modal";
import { SendTestEmailModal } from "@/components/send-test-email-modal";
import { Button } from "@/components/ui/button";
import { Sliders, Monitor, Moon, Sun } from "lucide-react";
import { transformToReactEmail } from "@/lib/email-transform";
import { render } from "@react-email/render";
import { useTheme } from "next-themes";

function TestTransformButton() {
  const { template } = useEmailTemplateContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState("");

  const handleTestTransform = async () => {
    try {
      console.log("🔄 Starting transformation...");
      const reactEmail = transformToReactEmail(template);
      const html = await render(reactEmail, {
        pretty: true, // Enable pretty printing with proper indentation
      });
      console.log("✅ Transform successful!");
      console.log("HTML length:", html.length);
      setRenderedHtml(html);
      setIsModalOpen(true);
    } catch (error) {
      console.error("❌ Transform failed:", error);
    }
  };

  return (
    <>
      <button
        className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
        onClick={handleTestTransform}
        title="Test email transformation"
      >
        Test Transform
      </button>
      <EmailTransformTestModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        html={renderedHtml}
      />
    </>
  );
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getIcon = () => {
    if (!mounted) return <Monitor className="h-4 w-4" />;
    if (theme === "light") return <Sun className="h-4 w-4" />;
    if (theme === "dark") return <Moon className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      title={mounted ? `Current theme: ${theme}` : "Theme"}
    >
      {getIcon()}
    </Button>
  );
}

export default function EmailEditorPage() {
  const [isStylesOpen, setIsStylesOpen] = useState(false);
  const [isSendTestEmailOpen, setIsSendTestEmailOpen] = useState(false);

  const handleSendTestEmail = (
    emails: string[],
    variables: Record<string, any>
  ) => {
    console.log("Sending test email to:", emails);
    console.log("With variables:", variables);
    // TODO: Implement actual email sending logic
  };

  return (
    <EmailTemplateProvider>
      <div className="min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  onClick={() => setIsStylesOpen(true)}
                  title="Global Styles"
                >
                  <Sliders className="h-4 w-4" />
                  Styles
                </button>
                <div className="h-4 w-px bg-border" />
                <h1 className="text-lg font-medium">Email Template Editor</h1>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  Draft
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TestTransformButton />
                <button
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  onClick={() => setIsSendTestEmailOpen(true)}
                >
                  Send Test Email
                </button>
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </div>

        {/* Email Editor Content - EmailTemplateEditor now manages its own layout */}
        <EmailTemplateEditor />
        <GlobalStylesPanel open={isStylesOpen} onOpenChange={setIsStylesOpen} />
        <SendTestEmailModal
          open={isSendTestEmailOpen}
          onOpenChange={setIsSendTestEmailOpen}
          onSend={handleSendTestEmail}
        />
      </div>
    </EmailTemplateProvider>
  );
}
