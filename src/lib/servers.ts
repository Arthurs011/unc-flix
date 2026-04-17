export type MediaType = "movie" | "tv";

export interface StreamServer {
  id: string;
  label: string;
  /** Emoji flag shown in the picker tile. */
  flag: string;
  /** Optional badge tag (e.g. "4K", "HD", "Premium"). */
  tag?: string;
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
    id: "premium",
    label: "Premium",
    flag: "🇺🇸",
    tag: "4K",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://vidsrc.cc/v2/embed/movie/${id}`
        : `https://vidsrc.cc/v2/embed/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "vsembed",
    label: "Vidfast",
    flag: "🇬🇧",
    tag: "HD",
    supportsLang: true,
    build: ({ type, id, season, episode, lang }) => {
      const l = lang ? `?lang=${lang}` : "";
      return type === "movie"
        ? `https://vsembed.ru/embed/movie/${id}${l}`
        : `https://vsembed.ru/embed/tv/${id}/${season ?? 1}/${episode ?? 1}${l}`;
    },
  },
  {
    id: "v2",
    label: "V2",
    flag: "🇬🇧",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://vsembed.su/embed/movie/${id}`
        : `https://vsembed.su/embed/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "vidpro",
    label: "Vidpro",
    flag: "🇬🇧",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://player.vidsrc.co/embed/movie/${id}`
        : `https://player.vidsrc.co/embed/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "vidsrc-to",
    label: "Vidsrc",
    flag: "🇺🇸",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "vidsrc-xyz",
    label: "Atlas",
    flag: "🇺🇸",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://vidsrc.xyz/embed/movie?tmdb=${id}`
        : `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${season ?? 1}&episode=${episode ?? 1}`,
  },
  {
    id: "2embed",
    label: "2Embed",
    flag: "🇦🇺",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${season ?? 1}&e=${episode ?? 1}`,
  },
  {
    id: "superembed",
    label: "Cinemaos",
    flag: "🇺🇸",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season ?? 1}&e=${episode ?? 1}`,
  },
  {
    id: "moviesapi",
    label: "Moviesapi",
    flag: "🇺🇸",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://moviesapi.club/movie/${id}`
        : `https://moviesapi.club/tv/${id}-${season ?? 1}-${episode ?? 1}`,
  },
  {
    id: "vidnest",
    label: "Vidnest",
    flag: "🇬🇧",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://vidnest.fun/movie/${id}`
        : `https://vidnest.fun/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "tongo",
    label: "Tongo",
    flag: "🇺🇸",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://tom.autoembed.cc/embed/movie/${id}`
        : `https://tom.autoembed.cc/embed/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "echo",
    label: "Echo",
    flag: "🇺🇸",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://embed.echovideo.to/movie/${id}`
        : `https://embed.echovideo.to/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "drive",
    label: "Drive",
    flag: "🇬🇧",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://embed.drivenow.fun/movie/${id}`
        : `https://embed.drivenow.fun/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "hdmovies",
    label: "Hdmovies",
    flag: "🇮🇳",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://hdmovie.fun/movie/${id}`
        : `https://hdmovie.fun/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "asia",
    label: "Asia",
    flag: "🇮🇳",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://asia.embed.su/movie/${id}`
        : `https://asia.embed.su/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "bravo",
    label: "Bravo",
    flag: "🇬🇧",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://bravo.flixhq.click/movie/${id}`
        : `https://bravo.flixhq.click/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "vidora",
    label: "Vidora",
    flag: "🇺🇸",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://vidora.su/movie/${id}`
        : `https://vidora.su/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "rip",
    label: "Rip",
    flag: "🇬🇧",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://rip.embed.su/movie/${id}`
        : `https://rip.embed.su/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "spencer",
    label: "Spencer",
    flag: "🇺🇸",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://spencer.embed.su/movie/${id}`
        : `https://spencer.embed.su/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "lima",
    label: "Lima",
    flag: "🇺🇸",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://lima.embed.su/movie/${id}`
        : `https://lima.embed.su/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "111",
    label: "111",
    flag: "🇬🇧",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://111movies.com/movie/${id}`
        : `https://111movies.com/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "jade",
    label: "Jade",
    flag: "🇵🇹",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://jade.embed.su/movie/${id}`
        : `https://jade.embed.su/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "french",
    label: "French",
    flag: "🇫🇷",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://frembed.icu/api/film.php?id=${id}`
        : `https://frembed.icu/api/serie.php?id=${id}&sa=${season ?? 1}&epi=${episode ?? 1}`,
  },
  {
    id: "spanish",
    label: "Spanish",
    flag: "🇪🇸",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://spanish.embed.su/movie/${id}`
        : `https://spanish.embed.su/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "viet",
    label: "Viet",
    flag: "🇻🇳",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://viet.embed.su/movie/${id}`
        : `https://viet.embed.su/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "rive",
    label: "Rive",
    flag: "🇬🇧",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://rivestream.org/embed?type=movie&id=${id}`
        : `https://rivestream.org/embed?type=tv&id=${id}&season=${season ?? 1}&episode=${episode ?? 1}`,
  },
  {
    id: "mono",
    label: "Mono",
    flag: "🇬🇧",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://mono.embed.su/movie/${id}`
        : `https://mono.embed.su/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "mapple",
    label: "Mapple",
    flag: "🇺🇸",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://mapple.embed.su/movie/${id}`
        : `https://mapple.embed.su/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "lika",
    label: "Lika",
    flag: "🇺🇸",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://lika.embed.su/movie/${id}`
        : `https://lika.embed.su/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: "flicky",
    label: "Flicky",
    flag: "🇮🇳",
    build: ({ type, id, season, episode }) =>
      type === "movie"
        ? `https://flicky.host/embed/movie/?id=${id}`
        : `https://flicky.host/embed/tv/?id=${id}/${season ?? 1}/${episode ?? 1}`,
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
