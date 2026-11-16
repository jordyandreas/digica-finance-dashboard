const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "www.youtu.be",
]);

const YOUTUBE_PATH_PREFIXES = ["embed", "shorts", "live", "v"] as const;

function isYouTubeId(value: string): boolean {
  return YOUTUBE_ID_PATTERN.test(value);
}

/**
 * Extract the 11-character YouTube video id from a bare id or any common
 * YouTube URL (watch, youtu.be, embed, shorts, live). Returns null otherwise.
 */
export function extractYouTubeVideoId(
  input: string | null | undefined,
): string | null {
  const trimmed = input?.trim();
  if (!trimmed) {
    return null;
  }

  if (isYouTubeId(trimmed)) {
    return trimmed;
  }

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) {
    return null;
  }

  if (host.endsWith("youtu.be")) {
    const candidate = url.pathname.split("/").filter(Boolean)[0];
    return candidate && isYouTubeId(candidate) ? candidate : null;
  }

  const watchId = url.searchParams.get("v");
  if (watchId && isYouTubeId(watchId)) {
    return watchId;
  }

  const [prefix, candidate] = url.pathname.split("/").filter(Boolean);
  if (
    prefix &&
    candidate &&
    (YOUTUBE_PATH_PREFIXES as readonly string[]).includes(prefix) &&
    isYouTubeId(candidate)
  ) {
    return candidate;
  }

  return null;
}

/**
 * Normalize a pasted video reference for storage in lms_lesson_media.video_url.
 * YouTube links/ids become the clean 11-char id; other values are trimmed and
 * kept as-is so non-YouTube hosts keep working.
 */
export function normalizeYouTubeVideoRef(
  input: string | null | undefined,
): string {
  const trimmed = input?.trim() ?? "";
  if (!trimmed) {
    return "";
  }

  return extractYouTubeVideoId(trimmed) ?? trimmed;
}

/** True when the value is empty or resolves to a YouTube video id. */
export function isValidYouTubeVideoRef(
  input: string | null | undefined,
): boolean {
  const trimmed = input?.trim() ?? "";
  return !trimmed || extractYouTubeVideoId(trimmed) !== null;
}

export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
