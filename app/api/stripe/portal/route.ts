import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { getUserSubscription } from "@/app/lib/subscription";
import { stripe } from "@/app/lib/stripe";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const sub = await getUserSubscription(user.id);
  if (!sub) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  const origin = req.headers.get("origin") || "https://email-signature-generator-moltcorporation.vercel.app";

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${origin}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
