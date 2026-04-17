export type MediaType = "movie" | "tv";

export interface StreamServer {
  id: string;
  label: string;
  /** Build the embed URL for a given media. For TV, season/episode are 1-based. */
  build: (params: {
    type: MediaType;
    id: string | number;
    season?: number;
    episode?: number;
    lang?: string;
  }) => string;
  /** Whether this server respects the language query param. */
  supportsLang?: boolean;
}

/**
 * Ordered by general reliability. The first server is the default and
 * we auto-fallback to the next one if loading takes too long.
 */
export const STREAM_SERVERS: StreamServer[] = [
  {
    id: "vsembed",
    label: "VSEmbed",
    supportsLang: true,
    build: ({ type, id, season, episode, lang }) => {
      const l = lang ? `?lang=${lang}` : "";
      return type === "movie"
        ? `https://vsembed.ru/embed/movie/${id}${l}`
        : `https://vsembed.ru/embed/tv/${id}/${season ?? 1}/${episode ?? 1}${l}`;
    },
  },
  {
    id: "vidsrc-to",
    label: "VidSrc",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "vidsrc-xyz",
    label: "VidSrc XYZ",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://vidsrc.xyz/embed/movie?tmdb=${id}`
        : `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${season ?? 1}&episode=${episode ?? 1}`,
  },
  {
    id: "2embed",
    label: "2Embed",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${season ?? 1}&e=${episode ?? 1}`,
  },
  {
    id: "superembed",
    label: "SuperEmbed",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season ?? 1}&e=${episode ?? 1}`,
  },
  {
    id: "moviesapi",
    label: "MoviesAPI",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://moviesapi.club/movie/${id}`
        : `https://moviesapi.club/tv/${id}-${season ?? 1}-${episode ?? 1}`,
  },
];

export const DEFAULT_SERVER_ID = STREAM_SERVERS[0].id;

export function getServer(id: string): StreamServer {
  return STREAM_SERVERS.find((s) => s.id === id) ?? STREAM_SERVERS[0];
}

export function getNextServerId(currentId: string): string | null {
  const idx = STREAM_SERVERS.findIndex((s) => s.id === currentId);
  if (idx === -1 || idx === STREAM_SERVERS.length - 1) return null;
  return STREAM_SERVERS[idx + 1].id;
}