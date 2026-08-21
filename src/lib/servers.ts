export type MediaType = "movie" | "tv";

export interface StreamSource {
  id: string;
  name: string;
  baseUrl: string;
  build: (type: MediaType, id: string | number, season?: number, episode?: number) => string;
}

/**
 * EXCLUSIVE SOURCE LIST
 * CineSrc embed with brand accent + auto-next.
 * Events: cinesrc:timeupdate / cinesrc:nextepisode via postMessage (origin https://cinesrc.st)
 */
export const SOURCES: StreamSource[] = [
  {
    id: "cinesrc",
    name: "CineSrc",
    baseUrl: "https://cinesrc.st",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://cinesrc.st/embed/movie/${id}?color=%230ea5e9&autoplay=true`
        : `https://cinesrc.st/embed/tv/${id}?s=${s ?? 1}&e=${e ?? 1}&color=%230ea5e9&autoplay=true&autonext=true&nextepisode=true`
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
  return "#"; 
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
  if (SOURCES.length <= 1) return 0;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  // Probe the top sources
  const probes = SOURCES.slice(0, 3).map(async (_, index) => {
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
