import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teams, teamMembers, teamBranding } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/app/lib/auth";
import { isProUser } from "@/app/lib/subscription";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get all teams where user is a member
  const memberships = await db
    .select({
      teamId: teamMembers.teamId,
      role: teamMembers.role,
      teamName: teams.name,
      ownerId: teams.ownerId,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, user.id));

  return NextResponse.json({ teams: memberships });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const isPro = await isProUser(user.id);
  if (!isPro) {
    return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
  }

  const { name } = await req.json();
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  }

  const [team] = await db
    .insert(teams)
    .values({ name: name.trim(), ownerId: user.id })
    .returning();

  // Add owner as a member with owner role
  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: "owner",
  });

  // Create default branding
  await db.insert(teamBranding).values({ teamId: team.id });

  return NextResponse.json({ team });
}
