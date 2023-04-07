import { redirect } from "next/navigation";

export async function GET(request: any) {
  redirect(`/releases${request.nextUrl.search}`);
}
