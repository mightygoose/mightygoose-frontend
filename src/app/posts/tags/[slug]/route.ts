import { redirect } from "next/navigation";

interface RouteProps {
  params: { slug: string };
}

export async function GET(_: any, { params: { slug } }: RouteProps) {
  redirect(`/releases?tag=${slug}`);
}
