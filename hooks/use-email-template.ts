import { useEmailTemplateContext } from "@/lib/email-template-context";
import type { EmailTemplate } from "@/types/email-template";

/**
 * Hook for consuming email template state
 * 
 * @returns Tuple of [template, setTemplate, updateTemplate, updateHeader, updateGlobalStyles, updateContent, resetTemplate]
 * 
 * @example
 * ```tsx
 * const { template, updateContent } = useEmailTemplate();
 * 
 * // Update content
 * updateContent(newContent);
 * 
 * // Update header
 * updateHeader({ subject: "New Subject" });
 * ```
 */
export function useEmailTemplate() {
  const context = useEmailTemplateContext();
  return context;
}

/**
 * Type-safe helper to get template
 */
export function useTemplate(): EmailTemplate {
  const { template } = useEmailTemplate();
  return template;
}

/**
 * Type-safe helper to get update functions
 */
export function useTemplateUpdates() {
  const { updateTemplate, updateHeader, updateGlobalStyles, updateContent, resetTemplate } =
    useEmailTemplate();
  return {
    updateTemplate,
    updateHeader,
    updateGlobalStyles,
    updateContent,
    resetTemplate,
  };
}

