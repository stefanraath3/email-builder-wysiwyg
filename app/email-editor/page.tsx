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
import { toast } from "sonner";

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
        className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
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
      className="text-gray-300 hover:bg-gray-800 hover:text-white"
    >
      {getIcon()}
    </Button>
  );
}

export default function EmailEditorPage() {
  const [isStylesOpen, setIsStylesOpen] = useState(false);
  const [isSendTestEmailOpen, setIsSendTestEmailOpen] = useState(false);

  return (
    <EmailTemplateProvider>
      <EmailEditorContent
        isStylesOpen={isStylesOpen}
        setIsStylesOpen={setIsStylesOpen}
        isSendTestEmailOpen={isSendTestEmailOpen}
        setIsSendTestEmailOpen={setIsSendTestEmailOpen}
      />
    </EmailTemplateProvider>
  );
}

function EmailEditorContent({
  isStylesOpen,
  setIsStylesOpen,
  isSendTestEmailOpen,
  setIsSendTestEmailOpen,
}: {
  isStylesOpen: boolean;
  setIsStylesOpen: (open: boolean) => void;
  isSendTestEmailOpen: boolean;
  setIsSendTestEmailOpen: (open: boolean) => void;
}) {
  const { template } = useEmailTemplateContext();

  const handleSendTestEmail = async (
    emails: string[],
    variables: Record<string, any>,
    subject: string
  ) => {
    try {
      const response = await fetch("/api/send-test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails,
          template,
          variables,
          subject,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send test email");
      }

      toast.success(data.message || "Test email sent successfully!");
    } catch (error) {
      console.error("Error sending test email:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send test email";
      toast.error(errorMessage);
      throw error; // Re-throw to let the modal handle it
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-black border-b border-border">
        <div className="w-full px-6 py-4">
          <div className="flex items-center relative">
            {/* Left: Styles button */}
            <div className="flex items-center">
              <button
                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
                onClick={() => setIsStylesOpen(true)}
                title="Global Styles"
              >
                <Sliders className="h-4 w-4" />
                Styles
              </button>
            </div>

            {/* Center: Template name and Draft badge */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <span className="text-gray-400 text-sm">Templates</span>
              <span className="text-gray-400 text-sm">/</span>
              <h1 className="text-lg font-semibold text-white">
                Email Template Editor
              </h1>
              <span className="rounded-md bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300">
                Draft
              </span>
            </div>

            {/* Right: Action buttons */}
            <div className="ml-auto flex items-center gap-2">
              <TestTransformButton />
              <button
                className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-100 transition-colors"
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
  );
}
