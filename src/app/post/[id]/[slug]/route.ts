import { redirect } from "next/navigation";

interface RouteProps {
  params: { id: string; slug: string };
}

export async function GET(_: any, { params: { id, slug } }: RouteProps) {
  redirect(`/release/${id}-${slug}`);
}
