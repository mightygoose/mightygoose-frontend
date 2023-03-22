import { redirect } from "next/navigation";
import fetch from "../../../lib/fetch";
import { Releases } from "../../types";

export async function GET() {
  const randomRelease = await fetch<Releases>("/api/post/random", {
    cache: "no-store",
  });
  redirect(`/post/${randomRelease[0].id}`);
}
