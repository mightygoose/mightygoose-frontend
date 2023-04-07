import { redirect } from "next/navigation";
import fetch from "../../../lib/fetch";
import { RandomReleaseResponse } from "../../types";

export async function GET() {
  const randomRelease = await fetch<RandomReleaseResponse>(
    "/api/release/random",
    {
      cache: "no-store",
    }
  );
  redirect(`/release/${randomRelease.id}`);
}
