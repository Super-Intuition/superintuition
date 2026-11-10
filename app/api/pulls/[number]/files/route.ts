import { NextResponse } from "next/server";
import { fetchPullFiles } from "@/lib/github";
import { errorResponse } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ number: string }> },
) {
  try {
    const { number } = await params;
    const n = Number(number);
    if (!Number.isInteger(n) || n <= 0) {
      return NextResponse.json({ error: "Invalid PR number" }, { status: 400 });
    }
    return NextResponse.json(await fetchPullFiles(n));
  } catch (e) {
    return errorResponse(e);
  }
}
