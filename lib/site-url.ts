const DEVELOPMENT_SITE_URL = "http://localhost:3000";

export function resolveSiteUrl(value?: string): URL {
  if (!value?.trim()) return new URL(DEVELOPMENT_SITE_URL);

  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
      return new URL(DEVELOPMENT_SITE_URL);
    }

    return new URL(url.origin);
  } catch {
    return new URL(DEVELOPMENT_SITE_URL);
  }
}

export function getSiteUrl(): URL {
  return resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}
