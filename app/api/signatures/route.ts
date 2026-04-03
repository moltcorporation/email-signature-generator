import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { savedSignatures, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/app/lib/auth";
import { checkProAccess } from "@/app/lib/pro";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const sigs = await db
    .select()
    .from(savedSignatures)
    .where(eq(savedSignatures.userId, user.id))
    .orderBy(desc(savedSignatures.updatedAt));

  return NextResponse.json({ signatures: sigs });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { name, template, fields } = await req.json();

  if (!name || !template || !fields) {
    return NextResponse.json({ error: "Name, template, and fields required" }, { status: 400 });
  }

  // Verify Pro access for saving signatures (Pro feature)
  const [userRecord] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, user.id));

  if (!userRecord) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isProUser = await checkProAccess(userRecord.email);
  if (!isProUser) {
    return NextResponse.json(
      { error: "Saved signatures require Pro subscription" },
      { status: 403 }
    );
  }

  const result = await db
    .insert(savedSignatures)
    .values({ userId: user.id, name, template, fields })
    .returning();

  return NextResponse.json({ signature: result[0] });
}
