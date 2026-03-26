import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { savedSignatures } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/app/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  await db
    .delete(savedSignatures)
    .where(
      and(eq(savedSignatures.id, Number(id)), eq(savedSignatures.userId, user.id))
    );

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const { name, template, fields } = await req.json();

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (name) updates.name = name;
  if (template) updates.template = template;
  if (fields) updates.fields = fields;

  const result = await db
    .update(savedSignatures)
    .set(updates)
    .where(
      and(eq(savedSignatures.id, Number(id)), eq(savedSignatures.userId, user.id))
    )
    .returning();

  return NextResponse.json({ signature: result[0] });
}
