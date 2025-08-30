// src/utils/tmdb.js
import axios from "axios";

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const ROOT = "https://api.themoviedb.org/3";

const client = axios.create({
  baseURL: ROOT,
  params: { api_key: API_KEY, language: "en-US" },
});

export async function searchMovies(query, page = 1) {
  if (!API_KEY) {
    throw new Error("Missing REACT_APP_TMDB_API_KEY");
  }
  if (!query?.trim()) return { results: [], page: 1, total_pages: 0 };
  const { data } = await client.get("/search/movie", {
    params: { query, page, include_adult: false },
  });
  return data;
}

export function posterUrl(path, size = "w342") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
}
