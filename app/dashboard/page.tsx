"use client";

import { useState, useEffect } from "react";
import { templates } from "../components/templates";
import { proTemplates } from "../components/pro-templates";

const allTemplates = [...templates, ...proTemplates];

interface User {
  id: number;
  email: string;
  isPro: boolean;
}

interface SavedSignature {
  id: number;
  name: string;
  template: string;
  fields: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface TeamMembership {
  teamId: number;
  role: string;
  teamName: string;
  ownerId: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [signatures, setSignatures] = useState<SavedSignature[]>([]);
  const [teams, setTeams] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [createTeamMsg, setCreateTeamMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/signatures").then((r) => r.json()).catch(() => ({ signatures: [] })),
      fetch("/api/teams").then((r) => r.json()).catch(() => ({ teams: [] })),
    ]).then(([meData, sigData, teamData]) => {
      if (meData.user) setUser(meData.user);
      if (sigData.signatures) setSignatures(sigData.signatures);
      if (teamData.teams) setTeams(teamData.teams);
      setLoading(false);
    });
  }, []);

  const handleUpgrade = async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const handleManageSubscription = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/signatures/${id}`, { method: "DELETE" });
    setSignatures((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setCreateTeamMsg("");
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTeamName.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setNewTeamName("");
      setShowCreateTeam(false);
      // Refresh teams
      const teamRes = await fetch("/api/teams");
      const teamData = await teamRes.json();
      if (teamData.teams) setTeams(teamData.teams);
    } else {
      setCreateTeamMsg(data.error || "Failed to create team");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view your dashboard.</p>
          <a
            href="/"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Go to Editor
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
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {user.isPro && (
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                PRO
              </span>
            )}
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Editor
            </a>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Subscription Section */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
          {user.isPro ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  You&apos;re on the <span className="font-bold text-indigo-600">Pro</span> plan.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  30+ templates, saved signatures, no branding, and more.
                </p>
              </div>
              <button
                onClick={handleManageSubscription}
                className="px-4 py-2 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Manage Subscription
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  You&apos;re on the <span className="font-medium">Free</span> plan.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Upgrade to unlock 30+ templates, save signatures, remove branding, and more.
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                Upgrade to Pro — $39/year
              </button>
            </div>
          )}
        </section>

        {/* Teams Section */}
        {user.isPro && (
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Teams</h2>
              <button
                onClick={() => setShowCreateTeam(!showCreateTeam)}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + Create Team
              </button>
            </div>

            {showCreateTeam && (
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Team name"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
                />
                <button
                  onClick={handleCreateTeam}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                >
                  Create
                </button>
                {createTeamMsg && (
                  <span className="text-xs text-red-500">{createTeamMsg}</span>
                )}
              </div>
            )}

            {teams.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No teams yet. Create one to manage shared signatures.
              </p>
            ) : (
              <div className="space-y-2">
                {teams.map((t) => (
                  <a
                    key={t.teamId}
                    href={`/dashboard/team/${t.teamId}`}
                    className="flex items-center justify-between border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{t.teamName}</span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        t.role === "owner"
                          ? "text-amber-600 bg-amber-50"
                          : "text-gray-500 bg-gray-100"
                      }`}>
                        {t.role}
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Saved Signatures */}
        {user.isPro && (
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Saved Signatures</h2>
              <a
                href="/"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + Create New
              </a>
            </div>
            {signatures.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No saved signatures yet. Create one in the editor and click Save.
              </p>
            ) : (
              <div className="space-y-3">
                {signatures.map((sig) => {
                  const tmpl = allTemplates.find((t) => t.id === sig.template);
                  return (
                    <div
                      key={sig.id}
                      className="flex items-center justify-between border border-gray-100 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sig.name}</p>
                        <p className="text-xs text-gray-500">
                          Template: {tmpl?.name || sig.template} &middot; Updated{" "}
                          {new Date(sig.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(sig.id)}
                          className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
