import { redirect } from "next/navigation";

interface RouteProps {
  params: { id: string };
}

export async function GET(_: any, { params: { id } }: RouteProps) {
  redirect(`/release/${id}`);
}
