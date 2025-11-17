import { EmailTemplateProvider } from "@/lib/email-template-context";
import { EmailTemplateEditor } from "@/components/email-template-editor";

export default function EmailEditorPage() {
  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <div className="border-b border-border">
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
                className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
                disabled
                title="Coming in Phase 6"
              >
                Styles
              </button>
              <button
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                disabled
                title="Coming soon"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="mx-auto" style={{ width: "600px" }}>
          <EmailTemplateProvider>
            <EmailTemplateEditor />
          </EmailTemplateProvider>
        </div>
      </div>
    </div>
  );
}
