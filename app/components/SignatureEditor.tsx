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
    monthly: "https://buy.stripe.com/3cIeVd8FRe8F7Dv0jW3Nm0B",
    yearly: "https://buy.stripe.com/8x2bJ1cW75C92jbeaM3Nm0C",
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Email Signature Generator
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Create professional email signatures in seconds
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.isPro && (
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    PRO
                  </span>
                )}
                <a
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </a>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign in
                </button>
                <button
                  onClick={handleUpgrade}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Upgrade to Pro
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Editor */}
          <div className="space-y-6">
            {/* Free Templates */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Free Templates
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {freeTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className={`px-3 py-2.5 rounded-lg border text-left transition-all ${
                      templateId === t.id
                        ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {t.name}
                    </span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      {t.description}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Pro Templates */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-700">
                  Pro Templates
                </h2>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  {proOnly.length} templates
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {proOnly.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className={`px-3 py-2.5 rounded-lg border text-left transition-all relative ${
                      templateId === t.id
                        ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {t.name}
                    </span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      {t.description}
                    </span>
                    {!user?.isPro && (
                      <span className="absolute top-2 right-2 text-xs text-indigo-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {!user?.isPro && (
                <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center">
                  <p className="text-sm text-indigo-900 font-medium mb-2">
                    Unlock {proOnly.length} Pro templates, saved signatures, custom colors, and more
                  </p>
                  <button
                    onClick={handleUpgrade}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Upgrade to Pro — $29.99/year
                  </button>
                </div>
              )}
            </section>

            {/* Fields */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Your Details
              </h2>
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                {mainFields.map((field) => (
                  <div key={field}>
                    <label
                      htmlFor={field}
                      className="block text-xs font-medium text-gray-600 mb-1"
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Social Links */}
            <section>
              <button
                onClick={() => setShowSocials(!showSocials)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3 hover:text-gray-900"
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
                Social Links
              </button>
              {showSocials && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                  {socialFields.map((field) => (
                    <div key={field}>
                      <label
                        htmlFor={field}
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        {fieldLabels[field]}
                      </label>
                      <input
                        id={field}
                        type="url"
                        value={data[field]}
                        onChange={handleChange(field)}
                        placeholder={`https://${field === "twitter" ? "x.com" : field + ".com"}/username`}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              <h2 className="text-sm font-semibold text-gray-700">
                Live Preview
              </h2>
              <div className="flex items-center gap-2">
                {user?.isPro && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50"
                  >
                    {saveMsg || (saving ? "Saving..." : "Save")}
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    copied
                      ? "bg-green-600 text-white"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {copied ? "Copied!" : "Copy HTML"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[200px]">
              <div
                ref={previewRef}
                dangerouslySetInnerHTML={{ __html: signatureHtml }}
              />
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-gray-600 mb-2">
                How to use
              </h3>
              <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
                <li>Fill in your details and choose a template</li>
                <li>Click &quot;Copy HTML&quot; to copy your signature</li>
                <li>
                  Open your email settings (Gmail: Settings &rarr; Signature)
                </li>
                <li>Paste the signature into the signature editor</li>
              </ol>
            </div>

            {/* Raw HTML Preview */}
            <details className="bg-white rounded-lg border border-gray-200">
              <summary className="px-4 py-3 text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-50">
                View HTML Source
              </summary>
              <pre className="px-4 pb-4 text-xs text-gray-500 overflow-x-auto whitespace-pre-wrap break-all">
                {signatureHtml}
              </pre>
            </details>
          </div>
        </div>
      </main>

      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Upgrade to Pro</h2>
              <button onClick={() => setShowUpgrade(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Unlock {allTemplates.filter((t) => t.pro).length} Pro templates, saved signatures, team management, and more.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={upgradeEmail}
                onChange={(e) => setUpgradeEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setUpgradePlan("yearly")}
                className={`flex-1 rounded-lg border-2 p-3 text-left text-sm ${
                  upgradePlan === "yearly"
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200"
                }`}
              >
                <div className="font-semibold text-gray-900">$29.99/year</div>
                <div className="text-xs text-gray-500">Save 37%</div>
              </button>
              <button
                onClick={() => setUpgradePlan("monthly")}
                className={`flex-1 rounded-lg border-2 p-3 text-left text-sm ${
                  upgradePlan === "monthly"
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200"
                }`}
              >
                <div className="font-semibold text-gray-900">$3.99/month</div>
                <div className="text-xs text-gray-500">Flexible</div>
              </button>
            </div>
            {verifyError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{verifyError}</p>
            )}
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowUpgrade(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={!upgradeEmail.trim()}
                className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Continue to Payment
              </button>
            </div>
            <button
              onClick={handleVerifyAccess}
              disabled={!upgradeEmail.trim()}
              className="mt-3 w-full text-center text-sm text-indigo-600 hover:underline disabled:opacity-50"
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
