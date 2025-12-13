"use client";

import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { useState, useEffect, useRef } from "react";
import { Pencil } from "lucide-react";
import {
  type SocialLink,
  PLATFORM_ORDER,
  PLATFORM_ICONS_RELATIVE,
  PLATFORM_LABELS,
} from "@/lib/extensions/email-social-links";

export function SocialLinksView({ node, updateAttributes }: NodeViewProps) {
  const [showEditPopup, setShowEditPopup] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const links = (node.attrs.links as SocialLink[]) || [];
  const styles = (node.attrs.styles as Record<string, any>) || {};

  // Get alignment from styles
  const alignment = styles?.textAlign || "center";

  // Filter and order links based on platform order
  const orderedLinks = PLATFORM_ORDER.map((platform) =>
    links.find((link: SocialLink) => link.platform === platform)
  ).filter(Boolean) as SocialLink[];

  // Handle click outside to close popup
  useEffect(() => {
    if (!showEditPopup) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowEditPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEditPopup]);

  const handleBlockClick = () => {
    setShowEditPopup(true);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditPopup(false);

    // Emit custom event to open modal
    window.dispatchEvent(
      new CustomEvent("emailEditor:openSocialLinksModal", {
        detail: {
          currentLinks: links,
          callback: (newLinks: SocialLink[]) => {
            updateAttributes({ links: newLinks });
          },
        },
      })
    );
  };

  return (
    <NodeViewWrapper>
      <div
        ref={wrapperRef}
        className="social-links-block"
        style={{
          justifyContent:
            alignment === "left"
              ? "flex-start"
              : alignment === "right"
                ? "flex-end"
                : "center",
        }}
        onClick={handleBlockClick}
      >
        {orderedLinks.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No social links configured
          </div>
        ) : (
          orderedLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              onClick={(e) => e.preventDefault()}
              className="social-link-item"
            >
              <img
                src={PLATFORM_ICONS_RELATIVE[link.platform]}
                alt={PLATFORM_LABELS[link.platform]}
                width={48}
                height={48}
              />
            </a>
          ))
        )}

        {showEditPopup && (
          <div className="social-links-edit-popup">
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 text-sm hover:text-primary"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit Social Links</span>
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
