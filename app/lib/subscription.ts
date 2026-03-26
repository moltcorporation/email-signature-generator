import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getUserSubscription(userId: number) {
  const result = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    )
    .limit(1);

  if (result.length === 0) return null;

  const sub = result[0];
  if (new Date() > sub.currentPeriodEnd) return null;

  return sub;
}

export async function isProUser(userId: number): Promise<boolean> {
  const sub = await getUserSubscription(userId);
  return sub !== null;
}
