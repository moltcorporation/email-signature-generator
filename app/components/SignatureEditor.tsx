"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { templates, SignatureData, Template } from "./templates";
import { proTemplates } from "./pro-templates";
import AuthModal from "./AuthModal";

const allTemplates: Template[] = [...templates, ...proTemplates];

const defaultData: SignatureData = {
  name: "",
  title: "",
  company: "",
  phone: "",
  email: "",
  website: "",
  photoUrl: "",
  linkedin: "",
  twitter: "",
  github: "",
  instagram: "",
};

const fieldLabels: Record<string, string> = {
  name: "Full Name",
  title: "Job Title",
  company: "Company",
  phone: "Phone",
  email: "Email",
  website: "Website",
  photoUrl: "Photo URL",
  linkedin: "LinkedIn URL",
  twitter: "X / Twitter URL",
  github: "GitHub URL",
  instagram: "Instagram URL",
};

interface User {
  id: number;
  email: string;
  isPro: boolean;
}

export default function SignatureEditor() {
  const [data, setData] = useState<SignatureData>(defaultData);
  const [templateId, setTemplateId] = useState(allTemplates[0].id);
  const [copied, setCopied] = useState(false);
  const [showSocials, setShowSocials] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeEmail, setUpgradeEmail] = useState("");
  const [upgradePlan, setUpgradePlan] = useState<"monthly" | "yearly">("yearly");
  const [verifyError, setVerifyError] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});

    // Check for stored Pro email (payment link flow)
    const storedEmail = localStorage.getItem("proEmail");
    if (storedEmail) {
      setUpgradeEmail(storedEmail);
      fetch(`/api/license?email=${encodeURIComponent(storedEmail)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.tier === "pro") {
            setUser((prev) => prev ? { ...prev, isPro: true } : { id: 0, email: storedEmail, isPro: true });
          }
        })
        .catch(() => {});
    }
  }, []);

  const template = allTemplates.find((t) => t.id === templateId) || allTemplates[0];
  const signatureHtml = template.render(data);

  const handleChange = useCallback(
    (field: keyof SignatureData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setData((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(signatureHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = signatureHtml;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [signatureHtml]);

  const handleTemplateSelect = (t: Template) => {
    if (t.pro && !user?.isPro) {
      setShowAuth(true);
      return;
    }
    setTemplateId(t.id);
  };

  const handleSave = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!user.isPro) {
      handleUpgrade();
      return;
    }

    const name = data.name || "Untitled Signature";
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, template: templateId, fields: data }),
      });
      if (res.ok) {
        setSaveMsg("Saved!");
        setTimeout(() => setSaveMsg(""), 2000);
      } else {
        setSaveMsg("Failed to save");
      }
    } catch {
      setSaveMsg("Network error");
    }
    setSaving(false);
  };

  const PAYMENT_URLS = {
    monthly: "https://buy.stripe.com/00wbJ18FR0hP9LD4Ac3Nm0P",
    yearly: "https://buy.stripe.com/3cIcN58FR8OlaPH7Mo3Nm0Q",
  };

  const handleUpgrade = () => {
    if (user?.email) setUpgradeEmail(user.email);
    setShowUpgrade(true);
  };

  const handleCheckout = () => {
    if (!upgradeEmail.trim()) return;
    const email = upgradeEmail.toLowerCase().trim();
    localStorage.setItem("proEmail", email);
    const url = `${PAYMENT_URLS[upgradePlan]}?prefilled_email=${encodeURIComponent(email)}`;
    window.location.href = url;
  };

  const handleVerifyAccess = () => {
    if (!upgradeEmail.trim()) return;
    const email = upgradeEmail.toLowerCase().trim();
    localStorage.setItem("proEmail", email);
    setVerifyError("");
    fetch(`/api/license?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.tier === "pro") {
          setUser((prev) => prev ? { ...prev, isPro: true } : { id: 0, email, isPro: true });
          setShowUpgrade(false);
        } else {
          setVerifyError("No active Pro subscription found for this email. If you just purchased, it may take a moment to process.");
        }
      })
      .catch(() => setVerifyError("Failed to verify access. Please try again."));
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const mainFields: (keyof SignatureData)[] = [
    "name", "title", "company", "phone", "email", "website", "photoUrl",
  ];

  const socialFields: (keyof SignatureData)[] = [
    "linkedin", "twitter", "github", "instagram",
  ];

  const freeTemplates = allTemplates.filter((t) => !t.pro);
  const proOnly = allTemplates.filter((t) => t.pro);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Email Signature Generator
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Professional signatures in seconds
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.isPro && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                    ✨ PRO
                  </span>
                )}
                <a
                  href="/dashboard"
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Dashboard
                </a>
                <button
                  onClick={handleLogout}
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={handleUpgrade}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upgrade to Pro
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section with Example Signature */}
        <div className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Create a Professional Signature</h2>
              <p className="text-slate-300">Choose a template, fill in your details, copy the HTML. It's that simple.</p>
            </div>
            <svg className="w-12 h-12 text-blue-400 opacity-20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
              <path d="m18 8.118-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
          </div>
          <div className="bg-slate-800 bg-opacity-50 border border-slate-700 rounded-lg p-4 text-sm font-mono text-slate-300 overflow-x-auto">
            <div className="whitespace-nowrap">
              <span className="text-amber-400">From:</span> alex@company.com<br/>
              <span className="text-amber-400">Subject:</span> Project Update<br/><br/>
              <span className="text-slate-400">---</span><br/>
              <span className="font-semibold">Alex Johnson</span><br/>
              Product Designer | Acme Corp<br/>
              alex@company.com | 555-123-4567<br/>
              www.acmecorp.com
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Editor */}
          <div className="space-y-6">
            {/* Free Templates */}
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                Free Templates
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {freeTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className={`px-4 py-3 rounded-xl border-2 text-left transition-all font-medium ${
                      templateId === t.id
                        ? "border-blue-600 bg-blue-50 text-blue-900 shadow-md"
                        : "border-slate-200 bg-white text-slate-900 hover:border-blue-400 hover:shadow-sm"
                    }`}
                  >
                    <span className="text-sm">
                      {t.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Pro Templates */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-1 h-5 bg-amber-500 rounded-full"></span>
                  Pro Templates
                </h2>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  ✨ {proOnly.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {proOnly.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className={`px-4 py-3 rounded-xl border-2 text-left transition-all font-medium relative ${
                      templateId === t.id
                        ? "border-amber-500 bg-amber-50 text-amber-900 shadow-md"
                        : "border-slate-200 bg-white text-slate-900 hover:border-amber-400 hover:shadow-sm"
                    }`}
                  >
                    <span className="text-sm">
                      {t.name}
                    </span>
                    {!user?.isPro && (
                      <span className="absolute top-3 right-3 text-amber-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {!user?.isPro && (
                <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-amber-900 font-semibold mb-3">
                    🎁 Unlock Premium Features
                  </p>
                  <p className="text-xs text-amber-800 mb-3">
                    {proOnly.length} Pro templates, saved signatures, team collaboration, and more
                  </p>
                  <button
                    onClick={handleUpgrade}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Upgrade to Pro — $2.99/mo
                  </button>
                </div>
              )}
            </section>

            {/* Fields */}
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                Your Details
              </h2>
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
                {mainFields.map((field) => (
                  <div key={field}>
                    <label
                      htmlFor={field}
                      className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide"
                    >
                      {fieldLabels[field]}
                    </label>
                    <input
                      id={field}
                      type={field === "email" ? "email" : "text"}
                      value={data[field]}
                      onChange={handleChange(field)}
                      placeholder={
                        field === "photoUrl"
                          ? "https://example.com/photo.jpg"
                          : field === "website"
                          ? "https://example.com"
                          : ""
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Social Links */}
            <section>
              <button
                onClick={() => setShowSocials(!showSocials)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3 hover:text-slate-900 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showSocials ? "rotate-90" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                Social Links
              </button>
              {showSocials && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
                  {socialFields.map((field) => (
                    <div key={field}>
                      <label
                        htmlFor={field}
                        className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide"
                      >
                        {fieldLabels[field]}
                      </label>
                      <input
                        id={field}
                        type="url"
                        value={data[field]}
                        onChange={handleChange(field)}
                        placeholder={`https://${field === "twitter" ? "x.com" : field + ".com"}/username`}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right: Preview + Copy */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">
                Live Preview
              </h2>
              <div className="flex items-center gap-2">
                {user?.isPro && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50"
                  >
                    {saveMsg || (saving ? "Saving..." : "Save")}
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                    copied
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                  }`}
                >
                  {copied ? "✓ Copied!" : "📋 Copy HTML"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[240px] shadow-sm">
              <div className="text-slate-600 text-xs mb-3">Your signature preview:</div>
              <div
                ref={previewRef}
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: signatureHtml }}
              />
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-4 border border-blue-100">
              <h3 className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 7a1 1 0 000 2h6a1 1 0 000-2H8zm0 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>
                Quick Start
              </h3>
              <ol className="text-xs text-blue-800 space-y-1.5 list-decimal list-inside">
                <li>Fill in your details</li>
                <li>Click &quot;Copy HTML&quot;</li>
                <li>Paste into your email settings</li>
              </ol>
            </div>

            {/* Raw HTML Preview */}
            <details className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <summary className="px-4 py-3 text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
                View HTML Source
              </summary>
              <pre className="px-4 pb-4 text-xs text-slate-500 overflow-x-auto whitespace-pre-wrap break-all bg-slate-50 rounded-b-lg">
                {signatureHtml}
              </pre>
            </details>
          </div>
        </div>
      </main>

      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Upgrade to Pro</h2>
                <p className="text-sm text-slate-500 mt-1">Unlock premium features</p>
              </div>
              <button onClick={() => setShowUpgrade(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-4 border border-amber-200">
              <p className="text-sm text-amber-900 font-semibold">
                ✨ {allTemplates.filter((t) => t.pro).length} Pro templates + saved signatures + team collaboration
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
              <input
                type="email"
                value={upgradeEmail}
                onChange={(e) => setUpgradeEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="mt-6 space-y-2">
              <button
                onClick={() => setUpgradePlan("yearly")}
                className={`w-full rounded-lg border-2 p-3 text-left text-sm transition-all ${
                  upgradePlan === "yearly"
                    ? "border-amber-500 bg-amber-50 shadow-md"
                    : "border-slate-200 hover:border-amber-300"
                }`}
              >
                <div className="font-semibold text-slate-900">💰 $2.99/month (yearly)</div>
                <div className="text-xs text-slate-600">Save 37% vs monthly</div>
              </button>
              <button
                onClick={() => setUpgradePlan("monthly")}
                className={`w-full rounded-lg border-2 p-3 text-left text-sm transition-all ${
                  upgradePlan === "monthly"
                    ? "border-amber-500 bg-amber-50 shadow-md"
                    : "border-slate-200 hover:border-amber-300"
                }`}
              >
                <div className="font-semibold text-slate-900">$2.99/month</div>
                <div className="text-xs text-slate-600">Cancel anytime</div>
              </button>
            </div>
            {verifyError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{verifyError}</p>
            )}
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowUpgrade(false)}
                className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={!upgradeEmail.trim()}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 text-sm font-semibold text-white hover:shadow-lg transition-all disabled:opacity-50"
              >
                Continue to Payment
              </button>
            </div>
            <button
              onClick={handleVerifyAccess}
              disabled={!upgradeEmail.trim()}
              className="mt-3 w-full text-center text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 transition-colors"
            >
              Already purchased? Verify access
            </button>
          </div>
        </div>
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuth={(u) => {
            setUser(u);
            setShowAuth(false);
          }}
        />
      )}
    </div>
  );
}
