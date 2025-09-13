import axios from "axios";

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const ROOT = "https://api.themoviedb.org/3";

const client = axios.create({
  baseURL: ROOT,
  params: { api_key: API_KEY, language: "en-US" },
});

export async function searchMovies(query, page = 1) {
  if (!API_KEY) throw new Error("Missing REACT_APP_TMDB_API_KEY");
  if (!query?.trim()) return { results: [], page: 1, total_pages: 0 };
  const { data } = await client.get("/search/movie", {
    params: { query, page, include_adult: false },
  });
  return data;
}

// Search people (actors, directors, etc.) by name
export async function searchPeople(query, page = 1) {
  if (!API_KEY) throw new Error("Missing REACT_APP_TMDB_API_KEY");
  if (!query?.trim()) return { results: [], page: 1, total_pages: 0 };
  const { data } = await client.get("/search/person", {
    params: { query, page, include_adult: false },
  });
  return data;
}

// Discover movies with flexible filters (genre, cast, dates, sorting)
export async function discoverMovies(params = {}) {
  if (!API_KEY) throw new Error("Missing REACT_APP_TMDB_API_KEY");
  const { data } = await client.get("/discover/movie", {
    params: {
      include_adult: false,
      sort_by: "popularity.desc",
      ...params,
    },
  });
  return data;
}

export async function getMovie(id) {
  if (!API_KEY) throw new Error("Missing REACT_APP_TMDB_API_KEY");
  const { data } = await client.get(`/movie/${id}`, {
    // include extra metadata we can surface (IMDb id, ratings, etc.)
    params: { append_to_response: "credits,videos,external_ids,release_dates" },
  });
  return data;
}

export function posterUrl(path, size = "w342") {
  return path
    ? `https://image.tmdb.org/t/p/${size}${path}`
    : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
}

// Common TMDB genre IDs → names (static map sufficient for UI)
export const GENRE_NAMES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

// Reverse map: name → id (case-sensitive to our names)
export const GENRE_IDS_BY_NAME = Object.fromEntries(
  Object.entries(GENRE_NAMES).map(([id, name]) => [name, Number(id)])
);
