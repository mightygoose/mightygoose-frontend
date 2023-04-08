import fetch from "../lib/fetch";
import { Releases as TReleases } from "../app/types";

export const LIMIT = 9;

interface ReleasesSearchParams {
  tags?: Array<string>;
  limit?: number;
  offset?: number;
}

const getReleases = (params?: ReleasesSearchParams) => {
  return fetch<TReleases>("/api/releases/best", {
    method: "POST",
    body: JSON.stringify({
      tags: [],
      limit: LIMIT,
      offset: 0,
      ...params,
    }),
  });
};

export default getReleases;
