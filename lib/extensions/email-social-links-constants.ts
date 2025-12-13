/**
 * Social link configuration
 */
export type SocialLink = {
  platform: "linkedin" | "facebook" | "x" | "youtube";
  url: string;
};

/**
 * Platform order for consistent rendering
 */
export const PLATFORM_ORDER = ["linkedin", "facebook", "x", "youtube"] as const;

/**
 * Platform display labels
 */
export const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  x: "X",
  youtube: "YouTube",
};

/**
 * Relative icon paths (for editor/UI use)
 */
export const PLATFORM_ICONS_RELATIVE: Record<string, string> = {
  linkedin: "/social-links/social-linkedin.png",
  facebook: "/social-links/social-facebook.png",
  x: "/social-links/social-x.png",
  youtube: "/social-links/social-youtube.png",
};

/**
 * Get absolute icon URL for email rendering
 * Uses NEXT_PUBLIC_BASE_URL if available, otherwise falls back to relative path
 * (which won't work in emails but prevents errors)
 */
export function getPlatformIconUrl(platform: string): string {
  const relativePath = PLATFORM_ICONS_RELATIVE[platform];
  if (!relativePath) return "";

  // For emails, we need absolute URLs
  // Check if we have a base URL configured
  const baseUrl =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_URL?.trim();

  if (baseUrl) {
    // Remove trailing slash from baseUrl and leading slash from relativePath
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const cleanPath = relativePath.replace(/^\//, "");
    return `${cleanBaseUrl}/${cleanPath}`;
  }

  // Fallback: return relative path (won't work in emails, but prevents errors)
  // In production, you should set NEXT_PUBLIC_BASE_URL
  return relativePath;
}
