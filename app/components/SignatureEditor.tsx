"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Header */}
      <header className="bg-[#1e293b] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Email Signature Generator</h1>
              <p className="text-xs text-slate-400">Professional signatures for Gmail, Outlook &amp; Apple Mail</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.isPro && (
                  <span className="text-xs font-bold text-teal-300 bg-teal-900/40 px-2.5 py-1 rounded-full border border-teal-700/50">
                    PRO
                  </span>
                )}
                <a href="/dashboard" className="text-sm text-slate-300 hover:text-white transition-colors">
                  Dashboard
                </a>
                <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setShowAuth(true)} className="text-sm text-slate-300 hover:text-white transition-colors">
                  Sign in
                </button>
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold rounded-lg hover:from-teal-400 hover:to-teal-500 transition-all shadow-md shadow-teal-900/30"
                >
                  Upgrade to Pro
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-b from-[#1e293b] to-[#334155] pb-8 pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center py-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Stand out in every inbox
            </h2>
            <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              Fill in your details, pick a template, and copy a pixel-perfect HTML signature — works in every major email client. No signup needed.
            </p>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {freeTemplates.length} free templates
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                No signup required
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copy &amp; paste into Gmail
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Editor */}
          <div className="space-y-5">
            {/* Template Selector */}
            <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-stone-50 border-b border-stone-200">
                <h2 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  Choose a Template
                </h2>
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Free</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {freeTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateSelect(t)}
                      className={`px-3 py-2.5 rounded-lg border-2 text-left transition-all ${
                        templateId === t.id
                          ? "border-teal-500 bg-teal-50 shadow-sm"
                          : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
                      }`}
                    >
                      <span className={`text-sm font-semibold ${templateId === t.id ? "text-teal-700" : "text-stone-800"}`}>
                        {t.name}
                      </span>
                      <span className="block text-xs text-stone-500 mt-0.5">{t.description}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Pro</p>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                    {proOnly.length} templates
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {proOnly.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateSelect(t)}
                      className={`px-3 py-2.5 rounded-lg border-2 text-left transition-all relative ${
                        templateId === t.id
                          ? "border-teal-500 bg-teal-50 shadow-sm"
                          : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
                      }`}
                    >
                      <span className={`text-sm font-semibold ${templateId === t.id ? "text-teal-700" : "text-stone-800"}`}>
                        {t.name}
                      </span>
                      <span className="block text-xs text-stone-500 mt-0.5">{t.description}</span>
                      {!user?.isPro && (
                        <span className="absolute top-2 right-2 text-amber-500">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {!user?.isPro && (
                  <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Unlock {proOnly.length} Pro templates + saved signatures
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">Custom colors, team management, and more</p>
                    </div>
                    <Link
                      href="/pricing"
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-md shadow-amber-200 shrink-0"
                    >
                      See Plans
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Fields */}
            <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-stone-50 border-b border-stone-200">
                <h2 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Your Details
                </h2>
              </div>
              <div className="p-5 space-y-3">
                {mainFields.map((field) => (
                  <div key={field}>
                    <label htmlFor={field} className="block text-xs font-semibold text-stone-600 mb-1">
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
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all bg-stone-50/50"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Social Links */}
            <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowSocials(!showSocials)}
                className="w-full px-5 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between hover:bg-stone-100 transition-colors"
              >
                <h2 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Social Links
                </h2>
                <svg
                  className={`w-4 h-4 text-stone-400 transition-transform ${showSocials ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showSocials && (
                <div className="p-5 space-y-3">
                  {socialFields.map((field) => (
                    <div key={field}>
                      <label htmlFor={field} className="block text-xs font-semibold text-stone-600 mb-1">
                        {fieldLabels[field]}
                      </label>
                      <input
                        id={field}
                        type="url"
                        value={data[field]}
                        onChange={handleChange(field)}
                        placeholder={`https://${field === "twitter" ? "x.com" : field + ".com"}/username`}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all bg-stone-50/50"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right: Preview + Copy */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Live Preview
                </h2>
                <div className="flex items-center gap-2">
                  {user?.isPro && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border border-teal-200 text-teal-700 hover:bg-teal-50 transition-all disabled:opacity-50"
                    >
                      {saveMsg || (saving ? "Saving..." : "Save")}
                    </button>
                  )}
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                      copied
                        ? "bg-emerald-600 text-white shadow-emerald-200"
                        : "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-400 hover:to-teal-500 shadow-teal-200"
                    }`}
                  >
                    {copied ? "Copied!" : "Copy HTML"}
                  </button>
                </div>
              </div>

              {/* Email client mockup */}
              <div className="p-6">
                <div className="border border-stone-200 rounded-lg overflow-hidden">
                  <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    </div>
                    <span className="text-[10px] text-stone-400 ml-2">New Message</span>
                  </div>
                  <div className="bg-white p-4 text-xs text-stone-400 space-y-1 border-b border-stone-100">
                    <div>To: colleague@company.com</div>
                    <div>Subject: Re: Project update</div>
                  </div>
                  <div className="bg-white p-4">
                    <p className="text-sm text-stone-500 mb-4">Looking forward to connecting!</p>
                    <div className="border-t border-stone-100 pt-4">
                      <div
                        ref={previewRef}
                        dangerouslySetInnerHTML={{ __html: signatureHtml }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How to use */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-stone-50 border-b border-stone-200">
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  How to Add Your Signature
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { step: "1", title: "Fill in your details", desc: "Enter your name, title, and contact info" },
                    { step: "2", title: "Choose a template", desc: "Pick from free or Pro designs" },
                    { step: "3", title: 'Click "Copy HTML"', desc: "Your signature is on your clipboard" },
                    { step: "4", title: "Paste in email settings", desc: "Gmail: Settings \u2192 Signature" },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-stone-800">{item.title}</p>
                        <p className="text-xs text-stone-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Raw HTML Preview */}
            <details className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <summary className="px-5 py-3 text-sm font-bold text-stone-800 cursor-pointer hover:bg-stone-50 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                View HTML Source
              </summary>
              <pre className="px-5 pb-4 text-xs text-stone-500 overflow-x-auto whitespace-pre-wrap break-all bg-stone-50 border-t border-stone-200 p-4">
                {signatureHtml}
              </pre>
            </details>
          </div>
        </div>
      </main>

      {/* Bottom SEO / Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 mt-8">
        <div className="text-center mb-8">
          <h2 className="text-xl font-extrabold text-stone-900">Why use our Email Signature Generator?</h2>
          <p className="text-sm text-stone-500 mt-1">Everything you need, nothing you don&apos;t</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              title: "Works Everywhere",
              desc: "Compatible with Gmail, Outlook, Apple Mail, Yahoo Mail, and Thunderbird. Table-based HTML that renders perfectly.",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              title: "No Account Needed",
              desc: "Start creating signatures immediately. No sign-up, no email capture. Just fill in your details and copy.",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
            },
            {
              title: "Photo & Social Links",
              desc: "Add your headshot, LinkedIn, Twitter, GitHub, and Instagram. Your signature becomes a networking tool.",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ),
            },
            {
              title: `${allTemplates.length} Template Designs`,
              desc: `${freeTemplates.length} free templates to get started, plus ${proOnly.length} Pro designs for teams and professionals who want to stand out.`,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                </svg>
              ),
            },
            {
              title: "Save & Manage (Pro)",
              desc: "Pro users can save multiple signatures, manage team templates, and access advanced customization options.",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              ),
            },
            {
              title: "Privacy First",
              desc: "Your data stays in your browser. We don't store or share your contact information. Generate signatures offline.",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                {feature.icon}
              </div>
              <h3 className="text-sm font-bold text-stone-900">{feature.title}</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between text-xs text-stone-400">
          <p>Email Signature Generator &mdash; Free professional email signatures</p>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-stone-600 transition-colors">Pricing</Link>
            <Link href="/dashboard" className="hover:text-stone-600 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-stone-900">Upgrade to Pro</h2>
              </div>
              <button onClick={() => setShowUpgrade(false)} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">&times;</button>
            </div>
            <p className="text-sm text-stone-500 mb-4">
              Unlock {allTemplates.filter((t) => t.pro).length} Pro templates, saved signatures, team management, and more.
            </p>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Email address</label>
              <input
                type="email"
                value={upgradeEmail}
                onChange={(e) => setUpgradeEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setUpgradePlan("yearly")}
                className={`flex-1 rounded-lg border-2 p-3 text-left text-sm transition-all ${
                  upgradePlan === "yearly"
                    ? "border-teal-500 bg-teal-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="font-bold text-stone-900">$29.99/year</div>
                <div className="text-xs text-emerald-600 font-semibold">Save 37%</div>
              </button>
              <button
                onClick={() => setUpgradePlan("monthly")}
                className={`flex-1 rounded-lg border-2 p-3 text-left text-sm transition-all ${
                  upgradePlan === "monthly"
                    ? "border-teal-500 bg-teal-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="font-bold text-stone-900">$3.99/month</div>
                <div className="text-xs text-stone-500">Flexible</div>
              </button>
            </div>
            {verifyError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{verifyError}</p>
            )}
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowUpgrade(false)}
                className="flex-1 rounded-lg border border-stone-300 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={!upgradeEmail.trim()}
                className="flex-1 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 py-2.5 text-sm font-semibold text-white hover:from-teal-400 hover:to-teal-500 disabled:opacity-50 transition-all shadow-md shadow-teal-200"
              >
                Continue to Payment
              </button>
            </div>
            <button
              onClick={handleVerifyAccess}
              disabled={!upgradeEmail.trim()}
              className="mt-3 w-full text-center text-sm text-teal-600 hover:underline disabled:opacity-50"
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
