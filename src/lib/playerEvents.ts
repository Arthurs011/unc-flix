/**
 * Normalises playback events posted by the embedded players into one shape.
 *
 * FilmU (vidly.pro) posts:
 *   { type: "VIDLY_PLAYER_EVENT", data: { event, currentTime, duration, season, episode } }
 * while older CineSrc/nxsha players post flat messages such as:
 *   { type: "timeupdate", currentTime, duration }
 */
export interface PlayerProgress {
  event: string;
  currentTime: number;
  duration: number;
  season?: number;
  episode?: number;
}

/** Origins our embedded players are served from (FilmU redirects to vidly.pro). */
export const PLAYER_ORIGINS = ["https://embed.filmu.in", "https://vidly.pro"];

const LEGACY_TIMEUPDATE_TYPES = new Set([
  "cinesrc:timeupdate",
  "timeupdate",
  "player:timeupdate",
  "nxsha:timeupdate",
]);

export function parsePlayerMessage(data: unknown): PlayerProgress | null {
  if (!data || typeof data !== "object") return null;
  const message = data as Record<string, unknown>;

  const payload =
    message.type === "VIDLY_PLAYER_EVENT" && isRecord(message.data) ? message.data : message;

  const isFilmU = message.type === "VIDLY_PLAYER_EVENT";
  const isLegacyTimeUpdate =
    typeof message.type === "string" && LEGACY_TIMEUPDATE_TYPES.has(message.type);
  if (!isFilmU && !isLegacyTimeUpdate) return null;

  const currentTime = Number(payload.currentTime);
  const duration = Number(payload.duration);
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration)) return null;

  return {
    event: typeof payload.event === "string" ? payload.event : "timeupdate",
    currentTime,
    duration,
    season: toPositiveInt(payload.season),
    episode: toPositiveInt(payload.episode),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toPositiveInt(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}
