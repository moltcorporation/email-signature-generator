"use client";

import { useState, useEffect, use } from "react";
import { templates } from "../../../components/templates";
import { proTemplates } from "../../../components/pro-templates";

const allTemplates = [...templates, ...proTemplates];

interface User {
  id: number;
  email: string;
  isPro: boolean;
}

interface TeamMember {
  id: number;
  userId: number;
  role: string;
  email: string;
  createdAt: string;
}

interface TeamBranding {
  id: number;
  teamId: number;
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

interface TeamSignature {
  id: number;
  userId: number;
  name: string;
  template: string;
  fields: Record<string, string>;
  email: string;
  updatedAt: string;
}

interface Team {
  id: number;
  name: string;
  ownerId: number;
}

export default function TeamDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const teamId = id;

  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [branding, setBranding] = useState<TeamBranding | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [signatures, setSignatures] = useState<TeamSignature[]>([]);
  const [userRole, setUserRole] = useState<string>("member");
  const [loading, setLoading] = useState(true);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [brandingDirty, setBrandingDirty] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);

  const isOwner = userRole === "owner";

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/teams/${teamId}`).then((r) => r.json()),
      fetch(`/api/teams/${teamId}/members`).then((r) => r.json()),
      fetch(`/api/teams/${teamId}/signatures`).then((r) => r.json()),
    ]).then(([meData, teamData, memberData, sigData]) => {
      if (meData.user) setUser(meData.user);
      if (teamData.team) setTeam(teamData.team);
      if (teamData.branding) setBranding(teamData.branding);
      if (teamData.userRole) setUserRole(teamData.userRole);
      if (memberData.members) setMembers(memberData.members);
      if (sigData.signatures) setSignatures(sigData.signatures);
      setLoading(false);
    });
  }, [teamId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteMsg("");
    const res = await fetch(`/api/teams/${teamId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setInviteEmail("");
      setInviteMsg("Member added!");
      // Refresh members
      const memberRes = await fetch(`/api/teams/${teamId}/members`);
      const memberData = await memberRes.json();
      if (memberData.members) setMembers(memberData.members);
    } else {
      setInviteMsg(data.error || "Failed to add member");
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    const res = await fetch(`/api/teams/${teamId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
  };

  const handleBrandingChange = (field: string, value: string) => {
    if (!branding) return;
    setBranding({ ...branding, [field]: value });
    setBrandingDirty(true);
  };

  const handleSaveBranding = async () => {
    if (!branding) return;
    setSavingBranding(true);
    const res = await fetch(`/api/teams/${teamId}/branding`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: branding.companyName,
        logoUrl: branding.logoUrl,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        fontFamily: branding.fontFamily,
      }),
    });
    if (res.ok) {
      setBrandingDirty(false);
      // Refresh signatures since branding update triggers bulk update
      const sigRes = await fetch(`/api/teams/${teamId}/signatures`);
      const sigData = await sigRes.json();
      if (sigData.signatures) setSignatures(sigData.signatures);
    }
    setSavingBranding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load team.</p>
          <a href="/dashboard" className="text-teal-600 hover:text-teal-800 text-sm font-medium">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{team.name}</h1>
              {isOwner && (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Owner
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">Team Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              Dashboard
            </a>
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Editor
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Shared Branding — Owner only */}
        {isOwner && branding && (
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Shared Branding</h2>
              {brandingDirty && (
                <button
                  onClick={handleSaveBranding}
                  disabled={savingBranding}
                  className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {savingBranding ? "Saving..." : "Save & Apply to All"}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Changes to shared branding will update all team member signatures automatically.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
                <input
                  type="text"
                  value={branding.companyName}
                  onChange={(e) => handleBrandingChange("companyName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Logo URL</label>
                <input
                  type="url"
                  value={branding.logoUrl}
                  onChange={(e) => handleBrandingChange("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => handleBrandingChange("primaryColor", e.target.value)}
                    className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => handleBrandingChange("primaryColor", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => handleBrandingChange("secondaryColor", e.target.value)}
                    className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.secondaryColor}
                    onChange={(e) => handleBrandingChange("secondaryColor", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Font Family</label>
                <select
                  value={branding.fontFamily}
                  onChange={(e) => handleBrandingChange("fontFamily", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                  <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                  <option value="Tahoma, sans-serif">Tahoma</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {/* Members */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Team Members ({members.length})
          </h2>

          {isOwner && (
            <div className="flex items-center gap-2 mb-4">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email to invite"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
              <button
                onClick={handleInvite}
                className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
              >
                Add Member
              </button>
              {inviteMsg && (
                <span className={`text-xs ${inviteMsg.includes("added") ? "text-green-600" : "text-red-500"}`}>
                  {inviteMsg}
                </span>
              )}
            </div>
          )}

          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between border border-gray-100 rounded-lg p-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">{m.email}</span>
                  {m.role === "owner" && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      Owner
                    </span>
                  )}
                </div>
                {isOwner && m.role !== "owner" && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Team Signatures */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Team Signatures ({signatures.length})
            </h2>
          </div>

          {signatures.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No team signatures yet. Members can create team signatures from the editor.
            </p>
          ) : (
            <div className="space-y-3">
              {signatures.map((sig) => {
                const tmpl = allTemplates.find((t) => t.id === sig.template);
                const canEdit = sig.userId === user?.id || isOwner;
                return (
                  <div
                    key={sig.id}
                    className="flex items-center justify-between border border-gray-100 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sig.name}</p>
                      <p className="text-xs text-gray-500">
                        {sig.email} &middot; Template: {tmpl?.name || sig.template} &middot; Updated{" "}
                        {new Date(sig.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!canEdit && (
                      <span className="text-xs text-gray-400">View only</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
