import { NextResponse } from "next/server";
import { fetchPulls } from "@/lib/github";
import { errorResponse } from "@/lib/api";

export async function GET() {
  try {
    return NextResponse.json(await fetchPulls());
  } catch (e) {
    return errorResponse(e);
  }
}
