import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teams, teamMembers, teamBranding, savedSignatures } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/app/lib/auth";

async function isTeamOwner(teamId: number, userId: number): Promise<boolean> {
  const result = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId), eq(teamMembers.role, "owner")))
    .limit(1);
  return result.length > 0;
}

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

  const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
  const [branding] = await db.select().from(teamBranding).where(eq(teamBranding.teamId, teamId)).limit(1);
  const members = await db
    .select({
      id: teamMembers.id,
      userId: teamMembers.userId,
      role: teamMembers.role,
      createdAt: teamMembers.createdAt,
    })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));

  return NextResponse.json({ team, branding, members, userRole: membership[0].role });
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
  const teamId = Number(id);

  if (!(await isTeamOwner(teamId, user.id))) {
    return NextResponse.json({ error: "Only team owner can update" }, { status: 403 });
  }

  const { name } = await req.json();
  if (name) {
    await db.update(teams).set({ name }).where(eq(teams.id, teamId));
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const teamId = Number(id);

  if (!(await isTeamOwner(teamId, user.id))) {
    return NextResponse.json({ error: "Only team owner can delete" }, { status: 403 });
  }

  // Delete in order: signatures, branding, members, team
  await db.delete(savedSignatures).where(eq(savedSignatures.teamId, teamId));
  await db.delete(teamBranding).where(eq(teamBranding.teamId, teamId));
  await db.delete(teamMembers).where(eq(teamMembers.teamId, teamId));
  await db.delete(teams).where(eq(teams.id, teamId));

  return NextResponse.json({ ok: true });
}
