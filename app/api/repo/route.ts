import { NextResponse } from "next/server";
import { fetchRepoMeta } from "@/lib/github";
import { errorResponse } from "@/lib/api";

export async function GET() {
  try {
    return NextResponse.json(await fetchRepoMeta());
  } catch (e) {
    return errorResponse(e);
  }
}
