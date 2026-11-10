import { NextResponse } from "next/server";
import { fetchRepoMeta, GitHubError } from "@/lib/github";

export async function GET() {
  try {
    return NextResponse.json(await fetchRepoMeta());
  } catch (e) {
    return errorResponse(e);
  }
}

export function errorResponse(e: unknown) {
  const status = e instanceof GitHubError ? e.status : 500;
  const message = e instanceof Error ? e.message : "Unknown error";
  return NextResponse.json({ error: message }, { status });
}
