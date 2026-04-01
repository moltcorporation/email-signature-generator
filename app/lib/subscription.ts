import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { checkProAccess } from "./pro";

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
  // Check local DB first (legacy subscriptions)
  const sub = await getUserSubscription(userId);
  if (sub) return true;

  // Check platform payment links API by email
  const userResult = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userResult.length > 0) {
    return checkProAccess(userResult[0].email);
  }

  return false;
}
