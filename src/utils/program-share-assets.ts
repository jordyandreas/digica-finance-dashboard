export const DIGICA_OG_LOGO_PATH = "/logo/logo-digica.webp";

export const DIGICA_OG_LOGO = {
  url: DIGICA_OG_LOGO_PATH,
  width: 640,
  height: 160,
  alt: "Digica Academy",
  type: "image/webp",
} as const;

export interface ShareOgImage {
  url: string;
  width: number;
  height: number;
  alt: string;
  type: string;
}

export function resolveShareOgImagePath(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed;
}

export function buildAbsoluteShareAssetUrl(
  origin: string,
  assetPath: string,
): string {
  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  const normalizedOrigin = origin.replace(/\/$/, "");
  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;

  return `${normalizedOrigin}${normalizedPath}`;
}

export function buildShareOgImage(
  origin: string,
  programName: string,
  ogImageUrl: string | null | undefined,
): ShareOgImage {
  const configuredPath = resolveShareOgImagePath(ogImageUrl);

  if (configuredPath) {
    const isPng = configuredPath.toLowerCase().includes(".png");

    return {
      url: buildAbsoluteShareAssetUrl(origin, configuredPath),
      width: isPng ? 1024 : DIGICA_OG_LOGO.width,
      height: isPng ? 537 : DIGICA_OG_LOGO.height,
      alt: programName,
      type: isPng ? "image/png" : DIGICA_OG_LOGO.type,
    };
  }

  return {
    url: buildAbsoluteShareAssetUrl(origin, DIGICA_OG_LOGO.url),
    width: DIGICA_OG_LOGO.width,
    height: DIGICA_OG_LOGO.height,
    alt: DIGICA_OG_LOGO.alt,
    type: DIGICA_OG_LOGO.type,
  };
}

export function buildShareOgLogoUrl(origin: string): string {
  return buildAbsoluteShareAssetUrl(origin, DIGICA_OG_LOGO_PATH);
}
