export type MediaType = "movie" | "tv";

export interface StreamSource {
  id: string;
  name: string;
  baseUrl: string;
  build: (type: MediaType, id: string | number, season?: number, episode?: number) => string;
}

/**
 * EXCLUSIVE SOURCE LIST
 * Only using domains explicitly provided by the user.
 */
export const SOURCES: StreamSource[] = [
  {
    id: "vsembed-su",
    name: "VsEmbed (.su)",
    baseUrl: "https://vsembed.su",
    build: (type, id, s, e) => 
      type === "movie"
        ? `https://vsembed.su/embed/movie/${id}`
        : `https://vsembed.su/embed/tv/${id}/${s ?? 1}/${e ?? 1}`
  },
  {
    id: "vidsrcme-ru",
    name: "VidsrcME (.ru)",
    baseUrl: "https://vidsrcme.ru",
    build: (type, id, s, e) => 
      type === "movie"
        ? `https://vidsrcme.ru/embed/movie/${id}`
        : `https://vidsrcme.ru/embed/tv/${id}/${s ?? 1}/${e ?? 1}`
  },
  {
    id: "vidsrcme-su",
    name: "VidsrcME (.su)",
    baseUrl: "https://vidsrcme.su",
    build: (type, id, s, e) => 
      type === "movie"
        ? `https://vidsrcme.su/embed/movie/${id}`
        : `https://vidsrcme.su/embed/tv/${id}/${s ?? 1}/${e ?? 1}`
  },
  {
    id: "vidsrc-me-ru",
    name: "Vidsrc-ME (.ru)",
    baseUrl: "https://vidsrc-me.ru",
    build: (type, id, s, e) => 
      type === "movie"
        ? `https://vidsrc-me.ru/embed/movie/${id}`
        : `https://vidsrc-me.ru/embed/tv/${id}/${s ?? 1}/${e ?? 1}`
  },
  {
    id: "vidsrc-me-su",
    name: "Vidsrc-ME (.su)",
    baseUrl: "https://vidsrc-me.su",
    build: (type, id, s, e) => 
      type === "movie"
        ? `https://vidsrc-me.su/embed/movie/${id}`
        : `https://vidsrc-me.su/embed/tv/${id}/${s ?? 1}/${e ?? 1}`
  },
  {
    id: "vidsrc-embed-ru",
    name: "Vidsrc-Embed (.ru)",
    baseUrl: "https://vidsrc-embed.ru",
    build: (type, id, s, e) => 
      type === "movie"
        ? `https://vidsrc-embed.ru/embed/movie/${id}`
        : `https://vidsrc-embed.ru/embed/tv/${id}/${s ?? 1}/${e ?? 1}`
  },
  {
    id: "vidsrc-embed-su",
    name: "Vidsrc-Embed (.su)",
    baseUrl: "https://vidsrc-embed.su",
    build: (type, id, s, e) => 
      type === "movie"
        ? `https://vidsrc-embed.su/embed/movie/${id}`
        : `https://vidsrc-embed.su/embed/tv/${id}/${s ?? 1}/${e ?? 1}`
  },
  {
    id: "vsrc-su",
    name: "Vsrc (.su)",
    baseUrl: "https://vsrc.su",
    build: (type, id, s, e) => 
      type === "movie"
        ? `https://vsrc.su/embed/movie/${id}`
        : `https://vsrc.su/embed/tv/${id}/${s ?? 1}/${e ?? 1}`
  }
];

export function getEmbedUrl(sourceIndex: number, type: MediaType, id: string | number, season?: number, episode?: number) {
  const source = SOURCES[sourceIndex] || SOURCES[0];
  return source.build(type, id, season, episode);
}

/**
 * Builds a high-speed download link for the given title.
 */
export function getDownloadUrl(type: MediaType, id: string | number, season?: number, episode?: number) {
  if (type === "movie") {
    return `https://vidsrc.me/download/movie?tmdb=${id}`;
  }
  return `https://vidsrc.me/download/tv?tmdb=${id}&season=${season ?? 1}&episode=${episode ?? 1}`;
}

const SOURCE_KEY = "uncflix_preferred_source_index";

export function getPreferredSourceIndex(): number {
  const saved = localStorage.getItem(SOURCE_KEY);
  if (saved !== null) {
    const idx = parseInt(saved, 10);
    return isNaN(idx) || idx >= SOURCES.length ? 0 : idx;
  }
  return 0;
}

export function setPreferredSourceIndex(index: number) {
  localStorage.setItem(SOURCE_KEY, index.toString());
}

export async function discoverBestSource(): Promise<number> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  // Probe the top sources from the new list
  const probes = [0, 1, 2].map(async (index) => {
    try {
      await fetch(SOURCES[index].baseUrl, { mode: 'no-cors', signal: controller.signal });
      return { index, success: true };
    } catch (e) {
      return { index, success: false };
    }
  });

  try {
    const results = await Promise.all(probes);
    clearTimeout(timeoutId);
    const firstSuccess = results.find(r => r.success);
    return firstSuccess ? firstSuccess.index : 0;
  } catch (e) {
    return 0;
  }
}
