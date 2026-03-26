import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teams, teamMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

  const members = await db
    .select({
      id: teamMembers.id,
      userId: teamMembers.userId,
      role: teamMembers.role,
      email: users.email,
      createdAt: teamMembers.createdAt,
    })
    .from(teamMembers)
    .innerJoin(users, eq(users.id, teamMembers.userId))
    .where(eq(teamMembers.teamId, teamId));

  return NextResponse.json({ members });
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

  // Only owner can add members
  const ownerCheck = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, user.id), eq(teamMembers.role, "owner")))
    .limit(1);

  if (ownerCheck.length === 0) {
    return NextResponse.json({ error: "Only team owner can add members" }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Find user by email
  const [targetUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);

  if (!targetUser) {
    return NextResponse.json({ error: "No user found with that email. They must sign up first." }, { status: 404 });
  }

  // Check if already a member
  const existing = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, targetUser.id)))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "User is already a team member" }, { status: 409 });
  }

  const [member] = await db
    .insert(teamMembers)
    .values({ teamId, userId: targetUser.id, role: "member" })
    .returning();

  return NextResponse.json({ member });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const teamId = Number(id);

  // Only owner can remove members
  const ownerCheck = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, user.id), eq(teamMembers.role, "owner")))
    .limit(1);

  if (ownerCheck.length === 0) {
    return NextResponse.json({ error: "Only team owner can remove members" }, { status: 403 });
  }

  const { memberId } = await req.json();
  if (!memberId) {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  }

  // Can't remove self (owner)
  const [target] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.id, Number(memberId)))
    .limit(1);

  if (target && target.userId === user.id) {
    return NextResponse.json({ error: "Cannot remove yourself. Delete the team instead." }, { status: 400 });
  }

  await db.delete(teamMembers).where(
    and(eq(teamMembers.id, Number(memberId)), eq(teamMembers.teamId, teamId))
  );

  return NextResponse.json({ ok: true });
}
