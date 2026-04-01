import { NextRequest, NextResponse } from "next/server";
import { checkProAccess } from "@/app/lib/pro";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ tier: "free" });
  }

  const pro = await checkProAccess(email);
  return NextResponse.json({ tier: pro ? "pro" : "free" });
}
