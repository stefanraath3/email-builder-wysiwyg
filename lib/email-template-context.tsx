"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { EmailTemplate } from "@/types/email-template";
import {
  createDefaultEmailTemplate,
  validateEmailTemplate,
} from "@/lib/email-template-defaults";

const STORAGE_KEY = "email-template";

interface EmailTemplateContextValue {
  template: EmailTemplate;
  setTemplate: React.Dispatch<React.SetStateAction<EmailTemplate>>;
  updateTemplate: (updates: Partial<EmailTemplate>) => void;
  updateHeader: (updates: Partial<EmailTemplate["header"]>) => void;
  updateGlobalStyles: (updates: Partial<EmailTemplate["globalStyles"]>) => void;
  updateContent: (content: EmailTemplate["content"]) => void;
  resetTemplate: () => void;
}

const EmailTemplateContext = createContext<EmailTemplateContextValue | null>(
  null
);

/**
 * Deep merge utility for nested objects
 */
function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const output = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      const targetValue = target[key];
      if (
        targetValue &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        output[key] = deepMerge(
          targetValue,
          source[key] as Partial<typeof targetValue>
        );
      } else {
        output[key] = source[key] as T[Extract<keyof T, string>];
      }
    } else {
      output[key] = source[key] as T[Extract<keyof T, string>];
    }
  }

  return output;
}

/**
 * Provider component that manages email template state and persistence
 */
export function EmailTemplateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [template, setTemplate] = useState<EmailTemplate>(() => {
    // Initialize from localStorage or defaults
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (validateEmailTemplate(parsed)) {
            // Migration: ensure body property exists (for backwards compatibility)
            if (!parsed.globalStyles?.body) {
              const defaults = createDefaultEmailTemplate();
              parsed.globalStyles = {
                ...defaults.globalStyles,
                ...parsed.globalStyles,
                body: defaults.globalStyles.body,
              };
            }
            return parsed;
          }
        }
      } catch (error) {
        console.warn("Failed to load template from localStorage:", error);
      }
    }
    return createDefaultEmailTemplate();
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced save to localStorage
  const saveToStorage = useCallback((templateToSave: EmailTemplate) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templateToSave));
      } catch (error) {
        console.error("Failed to save template to localStorage:", error);
      }
    }, 300);
  }, []);

  // Update template and trigger save
  useEffect(() => {
    const updatedTemplate = {
      ...template,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(updatedTemplate);
  }, [template, saveToStorage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Update template with partial updates
  const updateTemplate = useCallback((updates: Partial<EmailTemplate>) => {
    setTemplate((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Update header specifically
  const updateHeader = useCallback(
    (updates: Partial<EmailTemplate["header"]>) => {
      setTemplate((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          ...updates,
        },
        updatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  // Update global styles specifically (deep merge)
  const updateGlobalStyles = useCallback(
    (updates: Partial<EmailTemplate["globalStyles"]>) => {
      setTemplate((prev) => ({
        ...prev,
        globalStyles: deepMerge(prev.globalStyles, updates),
        updatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  // Update content specifically
  const updateContent = useCallback((content: EmailTemplate["content"]) => {
    setTemplate((prev) => ({
      ...prev,
      content,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Reset to defaults
  const resetTemplate = useCallback(() => {
    setTemplate(createDefaultEmailTemplate());
  }, []);

  const value: EmailTemplateContextValue = {
    template,
    setTemplate,
    updateTemplate,
    updateHeader,
    updateGlobalStyles,
    updateContent,
    resetTemplate,
  };

  return (
    <EmailTemplateContext.Provider value={value}>
      {children}
    </EmailTemplateContext.Provider>
  );
}

/**
 * Hook to access email template context
 * @throws Error if used outside EmailTemplateProvider
 */
export function useEmailTemplateContext(): EmailTemplateContextValue {
  const context = useContext(EmailTemplateContext);
  if (!context) {
    throw new Error(
      "useEmailTemplateContext must be used within EmailTemplateProvider"
    );
  }
  return context;
}
