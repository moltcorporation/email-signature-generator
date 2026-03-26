import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = Number(session.metadata?.userId);
      if (!userId || !session.subscription) break;

      const subResponse = await stripe.subscriptions.retrieve(
        session.subscription as string,
        { expand: ["items.data"] }
      );
      // In Stripe SDK v21, retrieve returns an object with subscription data
      const sub = subResponse as unknown as {
        id: string;
        cancel_at_period_end: boolean;
        items: { data: Array<{ current_period_end: number }> };
      };
      const periodEnd = sub.items.data[0]?.current_period_end;

      await db.insert(subscriptions).values({
        userId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: sub.id,
        status: "active",
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const periodEnd = (sub as unknown as { items?: { data?: Array<{ current_period_end?: number }> } })
        ?.items?.data?.[0]?.current_period_end;
      await db
        .update(subscriptions)
        .set({
          status: sub.status === "active" ? "active" : "cancelled",
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : new Date(),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await db
        .update(subscriptions)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
