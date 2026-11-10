import { NextResponse } from "next/server";
import { GitHubError } from "./github";

/** Turn a thrown error into a sanitized JSON response. */
export function errorResponse(e: unknown) {
  const status = e instanceof GitHubError ? e.status : 500;
  const message = e instanceof Error ? e.message : "Unknown error";
  return NextResponse.json({ error: message }, { status });
}
