import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { isProUser } from "@/app/lib/subscription";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const isPro = await isProUser(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      isPro,
    },
  });
}
