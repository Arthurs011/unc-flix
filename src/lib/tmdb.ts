const API_KEY = "06b3db8d25d0fc3c7fe63120d58c4594";
const BASE = "https://api.themoviedb.org/3";
export const IMG = "https://image.tmdb.org/t/p";

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("api_key", API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  media_type?: string;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  seasons?: { season_number: number; episode_count: number; name: string }[];
  credits?: { cast: CastMember[] };
  tagline?: string;
  status?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface ListResponse {
  results: Movie[];
  total_pages: number;
}

export const tmdb = {
  trending: () => get<ListResponse>("/trending/movie/week"),
  popular: () => get<ListResponse>("/movie/popular"),
  topRated: () => get<ListResponse>("/movie/top_rated"),
  upcoming: () => get<ListResponse>("/movie/upcoming"),
  tvPopular: () => get<ListResponse>("/tv/popular"),
  search: (query: string) => get<ListResponse>("/search/multi", { query }),
  movieDetails: (id: number) =>
    get<MovieDetails>(`/movie/${id}`, { append_to_response: "credits" }),
  tvDetails: (id: number) =>
    get<MovieDetails>(`/tv/${id}`, { append_to_response: "credits" }),
};

export function imgUrl(path: string | null, size = "w500") {
  return path ? `${IMG}/${size}${path}` : "/placeholder.svg";
}

export function getTitle(item: Movie) {
  return item.title || item.name || "Untitled";
}

export function getYear(item: Movie) {
  const d = item.release_date || item.first_air_date;
  return d ? d.substring(0, 4) : "";
}
