"use client";

import { useState } from "react";
import {
  EmailTemplateProvider,
  useEmailTemplateContext,
} from "@/lib/email-template-context";
import { EmailTemplateEditor } from "@/components/email-template-editor";
import { GlobalStylesPanel } from "@/components/global-styles-panel";
import { EmailTransformTestModal } from "@/components/email-transform-test-modal";
import Menu from "@/components/ui/menu";
import { Sliders } from "lucide-react";
import { transformToReactEmail } from "@/lib/email-transform";
import { render } from "@react-email/render";

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

export default function EmailEditorPage() {
  const [isStylesOpen, setIsStylesOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-medium">Email Template Editor</h1>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                Draft
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Placeholder buttons for future phases */}
              <EmailTemplateProvider>
                <TestTransformButton />
              </EmailTemplateProvider>
              <button
                className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
                disabled
                title="Coming in Phase 7"
              >
                Preview
              </button>
              <button
                className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
                disabled
                title="Coming in Phase 7"
              >
                Export
              </button>
              <button
                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                onClick={() => setIsStylesOpen(true)}
                title="Global Styles"
              >
                <Sliders className="h-4 w-4" />
                Styles
              </button>
              <button
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                disabled
                title="Coming soon"
              >
                Publish
              </button>
              <Menu />
            </div>
          </div>
        </div>
      </div>

      {/* Email Editor Content - EmailTemplateEditor now manages its own layout */}
      <EmailTemplateProvider>
        <EmailTemplateEditor />
        <GlobalStylesPanel open={isStylesOpen} onOpenChange={setIsStylesOpen} />
      </EmailTemplateProvider>
    </div>
  );
}
