import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teamMembers, teamBranding, savedSignatures } from "@/db/schema";
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

  const [branding] = await db
    .select()
    .from(teamBranding)
    .where(eq(teamBranding.teamId, teamId))
    .limit(1);

  return NextResponse.json({ branding: branding || null });
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

  // Only owner can update branding
  const ownerCheck = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, user.id), eq(teamMembers.role, "owner")))
    .limit(1);

  if (ownerCheck.length === 0) {
    return NextResponse.json({ error: "Only team owner can update branding" }, { status: 403 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.companyName !== undefined) updates.companyName = body.companyName;
  if (body.logoUrl !== undefined) updates.logoUrl = body.logoUrl;
  if (body.primaryColor !== undefined) updates.primaryColor = body.primaryColor;
  if (body.secondaryColor !== undefined) updates.secondaryColor = body.secondaryColor;
  if (body.fontFamily !== undefined) updates.fontFamily = body.fontFamily;

  const [branding] = await db
    .update(teamBranding)
    .set(updates)
    .where(eq(teamBranding.teamId, teamId))
    .returning();

  // Bulk update: apply new branding to all team signatures' fields
  if (branding) {
    const teamSigs = await db
      .select()
      .from(savedSignatures)
      .where(eq(savedSignatures.teamId, teamId));

    for (const sig of teamSigs) {
      const fields = sig.fields as Record<string, string>;
      const updatedFields = { ...fields };
      if (body.companyName !== undefined) updatedFields.company = body.companyName;
      if (body.logoUrl !== undefined) updatedFields.photoUrl = body.logoUrl;

      await db
        .update(savedSignatures)
        .set({ fields: updatedFields, updatedAt: new Date() })
        .where(eq(savedSignatures.id, sig.id));
    }
  }

  return NextResponse.json({ branding });
}
