import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teamMembers, savedSignatures, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const teamId = Number(id);

  // Check membership
  const membership = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, user.id)))
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  }

  const sigs = await db
    .select({
      id: savedSignatures.id,
      userId: savedSignatures.userId,
      name: savedSignatures.name,
      template: savedSignatures.template,
      fields: savedSignatures.fields,
      createdAt: savedSignatures.createdAt,
      updatedAt: savedSignatures.updatedAt,
      email: users.email,
    })
    .from(savedSignatures)
    .innerJoin(users, eq(users.id, savedSignatures.userId))
    .where(eq(savedSignatures.teamId, teamId))
    .orderBy(desc(savedSignatures.updatedAt));

  return NextResponse.json({ signatures: sigs, userRole: membership[0].role });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const teamId = Number(id);

  // Check membership
  const membership = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, user.id)))
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  }

  const { name, template, fields } = await req.json();
  if (!name || !template || !fields) {
    return NextResponse.json({ error: "Name, template, and fields required" }, { status: 400 });
  }

  const [sig] = await db
    .insert(savedSignatures)
    .values({ userId: user.id, teamId, name, template, fields })
    .returning();

  return NextResponse.json({ signature: sig });
}
