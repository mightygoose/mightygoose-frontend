import fetch from "../../lib/fetch";
import { Releases as TReleases } from "../types";

export const LIMIT = 9;

interface ReleasesSearchParams {
  tags?: Array<string>;
  limit?: number;
  offset?: number;
}

const getReleases = (params?: ReleasesSearchParams) => {
  return fetch<TReleases>("/api/search/posts", {
    method: "POST",
    body: JSON.stringify({
      tags: [],
      limit: LIMIT,
      offset: 0,
      ...params,
    }),
    cache: "no-store",
  });
};

export default getReleases;
