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
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
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
  const heroRef = useRef<HTMLDivElement>(null);

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

    // Scroll listener for sticky header
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setScrolledPastHero(heroBottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
      <header className={`sticky top-0 z-40 transition-all ${scrolledPastHero ? 'bg-white shadow-sm border-b border-amber-100' : 'bg-gradient-to-b from-white to-white/80'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-950">
              Email Signature Generator
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.isPro && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                    PRO
                  </span>
                )}
                <a
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-amber-950"
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
                  className="text-sm text-gray-600 hover:text-amber-950"
                >
                  Sign in
                </button>
                <button
                  onClick={handleUpgrade}
                  className="px-3 py-1.5 bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-amber-800 transition-colors"
                >
                  Upgrade to Pro
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div ref={heroRef} className="bg-gradient-to-br from-amber-50 via-white to-orange-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-5xl sm:text-6xl font-bold text-amber-950 tracking-tight mb-6">
            Your Email Signature, Perfected
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Create a professional email signature in seconds. No design skills needed. Your signature is your digital handshake—make it count.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => {
                document.querySelector('input[placeholder=""]')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3 bg-amber-700 text-white font-semibold rounded-lg hover:bg-amber-800 transition-colors shadow-lg hover:shadow-xl"
            >
              Start Creating
            </button>
            <a
              href="#how-it-works"
              className="px-8 py-3 bg-white border-2 border-amber-700 text-amber-950 font-semibold rounded-lg hover:bg-amber-50 transition-colors"
            >
              See How It Works
            </a>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-lg p-6 border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-semibold text-amber-950 mb-2">60 Seconds</h3>
              <p className="text-sm text-gray-600">Create a professional signature in under a minute</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="font-semibold text-amber-950 mb-2">Always Fresh</h3>
              <p className="text-sm text-gray-600">Live preview as you type, no design experience required</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-semibold text-amber-950 mb-2">Copy & Paste</h3>
              <p className="text-sm text-gray-600">Works everywhere—Gmail, Outlook, Apple Mail</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Editor */}
          <div className="space-y-6">
            {/* Free Templates */}
            <section id="how-it-works">
              <h2 className="text-lg font-bold text-amber-950 mb-4">
                Select a Template
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {freeTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className={`px-3 py-2.5 rounded-lg border-2 text-left transition-all ${
                      templateId === t.id
                        ? "border-amber-700 bg-amber-50 ring-2 ring-amber-400"
                        : "border-gray-200 bg-white hover:border-amber-200"
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
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-bold text-amber-950">
                  Premium Templates
                </h2>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                  Pro
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {proOnly.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className={`px-3 py-2.5 rounded-lg border text-left transition-all relative ${
                      templateId === t.id
                        ? "border-amber-700 bg-amber-50 ring-1 ring-amber-700"
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
                      <span className="absolute top-2 right-2 text-xs text-amber-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {!user?.isPro && (
                <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-4 text-center">
                  <p className="text-sm text-amber-900 font-medium mb-2">
                    Unlock {proOnly.length} Pro templates, saved signatures, custom colors, and more
                  </p>
                  <button
                    onClick={handleUpgrade}
                    className="px-4 py-2 bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-amber-800 transition-colors"
                  >
                    Upgrade to Pro — $29.99/year
                  </button>
                </div>
              )}
            </section>

            {/* Fields */}
            <section>
              <h2 className="text-lg font-bold text-amber-950 mb-4">
                Fill Your Details
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Social Links */}
            <section>
              <button
                onClick={() => setShowSocials(!showSocials)}
                className="flex items-center gap-2 text-lg font-bold text-amber-950 mb-4 hover:text-amber-800 transition-colors"
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
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-transparent"
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
              <h2 className="text-lg font-bold text-amber-950">
                Live Preview
              </h2>
              <div className="flex items-center gap-2">
                {user?.isPro && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-amber-200 text-amber-700 hover:bg-amber-50 transition-all disabled:opacity-50"
                  >
                    {saveMsg || (saving ? "Saving..." : "Save")}
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    copied
                      ? "bg-green-600 text-white"
                      : "bg-amber-700 text-white hover:bg-amber-800"
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

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-amber-950 mb-3">
                How to Use
              </h3>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li><strong>Fill in your details</strong> and choose a template</li>
                <li>Click <strong>"Copy HTML"</strong> to copy your signature</li>
                <li>
                  Open your email settings (Gmail: Settings → Signature)
                </li>
                <li>Paste into your email's signature editor</li>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl border border-amber-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-950">Upgrade to Pro</h2>
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setUpgradePlan("yearly")}
                className={`flex-1 rounded-lg border-2 p-4 text-left text-sm transition-all ${
                  upgradePlan === "yearly"
                    ? "border-amber-700 bg-amber-50"
                    : "border-gray-300 hover:border-amber-200"
                }`}
              >
                <div className="font-bold text-gray-900">$29.99/year</div>
                <div className="text-xs text-amber-700 font-semibold mt-1">Save 37%</div>
              </button>
              <button
                onClick={() => setUpgradePlan("monthly")}
                className={`flex-1 rounded-lg border-2 p-4 text-left text-sm transition-all ${
                  upgradePlan === "monthly"
                    ? "border-amber-700 bg-amber-50"
                    : "border-gray-300 hover:border-amber-200"
                }`}
              >
                <div className="font-bold text-gray-900">$3.99/month</div>
                <div className="text-xs text-gray-600 mt-1">Flexible</div>
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
                className="flex-1 rounded-lg bg-amber-700 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-50"
              >
                Continue to Payment
              </button>
            </div>
            <button
              onClick={handleVerifyAccess}
              disabled={!upgradeEmail.trim()}
              className="mt-3 w-full text-center text-sm text-amber-700 hover:underline disabled:opacity-50"
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
