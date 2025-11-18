"use client";

import { useActiveBlock } from "@/hooks/use-active-block";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

/**
 * Dev-only panel to visualize the currently active block
 * Shows uid, type, pos, and domRect information in real-time
 */
export function ActiveBlockTestPanel() {
  const activeBlock = useActiveBlock();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Active Block (Dev Test Panel)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!activeBlock ? (
          <div className="text-sm text-muted-foreground">
            No active block (cursor outside editor or no block with uid)
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1">UID</div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {activeBlock.uid}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Type</div>
                <Badge variant="outline">{activeBlock.type}</Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Position
                </div>
                <code className="text-xs">{activeBlock.pos}</code>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  DOM Rect
                </div>
                <code className="text-xs">
                  {activeBlock.domRect ? "✓ Available" : "✗ Not found"}
                </code>
              </div>
            </div>

            {activeBlock.domRect && (
              <div className="pt-3 border-t">
                <div className="text-xs text-muted-foreground mb-2">
                  Bounding Box
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground">top:</span>{" "}
                    {Math.round(activeBlock.domRect.top)}px
                  </div>
                  <div>
                    <span className="text-muted-foreground">left:</span>{" "}
                    {Math.round(activeBlock.domRect.left)}px
                  </div>
                  <div>
                    <span className="text-muted-foreground">width:</span>{" "}
                    {Math.round(activeBlock.domRect.width)}px
                  </div>
                  <div>
                    <span className="text-muted-foreground">height:</span>{" "}
                    {Math.round(activeBlock.domRect.height)}px
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t">
              <div className="text-xs text-muted-foreground mb-1">
                Console Test
              </div>
              <code className="text-xs block p-2 bg-muted rounded">
                window.__emailEditor.activeBlock
              </code>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
