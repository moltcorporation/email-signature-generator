import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { savedSignatures } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/app/lib/auth";

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

  const result = await db
    .insert(savedSignatures)
    .values({ userId: user.id, name, template, fields })
    .returning();

  return NextResponse.json({ signature: result[0] });
}
