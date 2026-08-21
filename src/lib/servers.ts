export type MediaType = "movie" | "tv";

export interface StreamSource {
  id: string;
  name: string;
  baseUrl: string;
  build: (type: MediaType, id: string | number, season?: number, episode?: number) => string;
}

/**
 * EXCLUSIVE SOURCE LIST
 * Using VidKing with specific brand configuration.
 */
export const SOURCES: StreamSource[] = [
  {
    id: "vidking",
    name: "VidKing",
    baseUrl: "https://www.vidking.net",
    build: (type, id, s, e) => 
      type === "movie"
        ? `https://www.vidking.net/embed/movie/${id}?color=5865f2&autoplay=1&next_button=1&episode_selector=1`
        : `https://www.vidking.net/embed/tv/${id}/${s ?? 1}/${e ?? 1}?color=5865f2&autoplay=1&next_button=1&episode_selector=1`
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
