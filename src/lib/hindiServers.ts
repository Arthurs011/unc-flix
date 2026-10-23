export type HindiWatchingServer = {
  name: string;
  type: "movie" | "tv";
  urlTemplate: string;
  countryUrl: string;
  idType: string;
  urlFormat: string;
  host: string;
};

export type HindiHomepageMovie = {
  title: string;
  year: string;
  tmdbId: string;
  hindiServerEmbedUrl: string;
};

export type VidboxHindiData = {
  site: string;
  scrapedFrom: string;
  note: string;
  hindiWatchingServers: HindiWatchingServer[];
  hindiMoviesOnHomepage: HindiHomepageMovie[];
  hostingProvider: string;
  language: string;
  totalHindiServers: number;
  totalHindiMoviesScraped: number;
};

export const HINDI_WATCHING_SERVERS: HindiWatchingServer[] = [
  {
    name: "Hindi",
    type: "movie",
    urlTemplate: "https://nxsha.space/embed/movie/{id}?lang=hindi&autoplay=true",
    countryUrl: "https://flagsapi.com/IN/flat/24.png",
    idType: "tmdb",
    urlFormat: "id",
    host: "nxsha.space"
  },
  {
    name: "Hindi",
    type: "tv",
    urlTemplate: "https://nxsha.space/embed/tv/{id}/{season}/{episode}?lang=hindi&autoplay=true",
    countryUrl: "https://flagsapi.com/IN/flat/24.png",
    idType: "tmdb",
    urlFormat: "id/{season}/{episode}?lang=hindi&autoplay=true",
    host: "nxsha.space"
  }
];

export const HINDI_MOVIES_ON_HOMEPAGE: HindiHomepageMovie[] = [
  { title: "Reporting Live", year: "2026", tmdbId: "1389172", hindiServerEmbedUrl: "https://nxsha.space/embed/movie/1389172?lang=hindi&autoplay=true" },
  { title: "Ramayana: Rise of a Legend", year: "2026", tmdbId: "656908", hindiServerEmbedUrl: "https://nxsha.space/embed/movie/656908?lang=hindi&autoplay=true" },
  { title: "Ok Jaanu", year: "2017", tmdbId: "413882", hindiServerEmbedUrl: "https://nxsha.space/embed/movie/413882?lang=hindi&autoplay=true" },
  { title: "Drishyam: The Conclusion", year: "2026", tmdbId: "1269325", hindiServerEmbedUrl: "https://nxsha.space/embed/movie/1269325?lang=hindi&autoplay=true" },
  { title: "Ikka", year: "2026", tmdbId: "1484913", hindiServerEmbedUrl: "https://nxsha.space/embed/movie/1484913?lang=hindi&autoplay=true" },
  { title: "Dilwale Dulhania Le Jayenge", year: "1995", tmdbId: "19404", hindiServerEmbedUrl: "https://nxsha.space/embed/movie/19404?lang=hindi&autoplay=true" }
];

export const VIDBOX_HINDI_DATA: VidboxHindiData = {
  site: "https://vidbox.wtf",
  scrapedFrom: "https://vidbox.wtf/home (Indian Movies section) and https://vidbox.wtf/watch/movie (server grid)",
  note: "Only the servers explicitly labeled 'Hindi' are included. Other India-flagged servers (Hdmovies, NHD, Mplay) are general-purpose and not Hindi-specific.",
  hindiWatchingServers: HINDI_WATCHING_SERVERS,
  hindiMoviesOnHomepage: HINDI_MOVIES_ON_HOMEPAGE,
  hostingProvider: "nxsha.space",
  language: "Hindi (hi)",
  totalHindiServers: 2,
  totalHindiMoviesScraped: 6
};

// Convenience aliases used by various callers.
export const HINDI_SERVERS = HINDI_WATCHING_SERVERS;
export const HINDI_MOVIES = HINDI_MOVIES_ON_HOMEPAGE;
export const HINDI_DATA = VIDBOX_HINDI_DATA;

// Lower-case / raw-key aliases matching the scraped JSON field names.
export const hindiWatchingServers = HINDI_WATCHING_SERVERS;
export const hindiMoviesOnHomepage = HINDI_MOVIES_ON_HOMEPAGE;
export const hindiServers = HINDI_WATCHING_SERVERS;
export const hindiMovies = HINDI_MOVIES_ON_HOMEPAGE;
export const data = VIDBOX_HINDI_DATA;

/**
 * Build an embed URL from a scraped Hindi server template.
 */
export function buildHindiEmbedUrl(
  server: HindiWatchingServer | string,
  id: string | number,
  season?: number,
  episode?: number
): string {
  const template = typeof server === "string" ? server : server.urlTemplate;
  return template
    .replace("{id}", String(id))
    .replace("{season}", String(season ?? 1))
    .replace("{episode}", String(episode ?? 1));
}

export function getHindiMovieEmbedUrl(tmdbId: string | number): string {
  const movie = HINDI_MOVIES_ON_HOMEPAGE.find((m) => m.tmdbId === String(tmdbId));
  return movie?.hindiServerEmbedUrl ?? `https://nxsha.space/embed/movie/${tmdbId}?lang=hindi&autoplay=true`;
}

export default VIDBOX_HINDI_DATA;