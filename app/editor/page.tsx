import { EmailEditor } from "@/components/email-editor";

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-medium">Email Template</h1>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                Draft
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted">
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="mx-auto" style={{ width: "600px" }}>
          <EmailEditor />
        </div>
      </div>
    </div>
  );
}

