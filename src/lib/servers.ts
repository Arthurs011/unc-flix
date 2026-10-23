export type MediaType = "movie" | "tv";

export interface StreamSource {
  id: string;
  name: string;
  baseUrl: string;
  build: (type: MediaType, id: string | number, season?: number, episode?: number) => string;
}

// Hindi (nxsha.space) servers scraped from vidbox.wtf.
export * from "./hindiServers";

/**
 * EXCLUSIVE SOURCE LIST
 * CineSrc embed with brand accent + auto-next.
 * Events: cinesrc:timeupdate / cinesrc:nextepisode via postMessage (origin https://cinesrc.st)
 */
export const SOURCES: StreamSource[] = [
  {
    id: "hindi",
    name: "Hindi",
    baseUrl: "https://nxsha.space",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://nxsha.space/embed/movie/${id}?lang=hindi&autoplay=true`
        : `https://nxsha.space/embed/tv/${id}/${s ?? 1}/${e ?? 1}?lang=hindi&autoplay=true`
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
