"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { templates, SignatureData, Template } from "./templates";
import { proTemplates } from "./pro-templates";
import { PAYMENT_LINKS } from "../lib/pro";
import AuthModal from "./AuthModal";
import Link from "next/link";

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
  const [upgradePlan, setUpgradePlan] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [verifyError, setVerifyError] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
      })
      .catch(() => {});

    const storedEmail = localStorage.getItem("proEmail");
    if (storedEmail) {
      setUpgradeEmail(storedEmail);
      fetch(`/api/license?email=${encodeURIComponent(storedEmail)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.tier === "pro") {
            setUser((prev) =>
              prev
                ? { ...prev, isPro: true }
                : { id: 0, email: storedEmail, isPro: true }
            );
          }
        })
        .catch(() => {});
    }
  }, []);

  const template =
    allTemplates.find((t) => t.id === templateId) || allTemplates[0];
  const signatureHtml = template.render(data);

  const handleChange = useCallback(
    (field: keyof SignatureData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleUpgrade = () => {
    if (user?.email) setUpgradeEmail(user.email);
    setShowUpgrade(true);
  };

  const handleCheckout = () => {
    if (!upgradeEmail.trim()) return;
    const email = upgradeEmail.toLowerCase().trim();
    localStorage.setItem("proEmail", email);
    const url = `${PAYMENT_LINKS[upgradePlan].url}?prefilled_email=${encodeURIComponent(email)}`;
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
          setUser((prev) =>
            prev
              ? { ...prev, isPro: true }
              : { id: 0, email, isPro: true }
          );
          setShowUpgrade(false);
        } else {
          setVerifyError(
            "No active Pro subscription found for this email. If you just purchased, it may take a moment to process."
          );
        }
      })
      .catch(() =>
        setVerifyError("Failed to verify access. Please try again.")
      );
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const mainFields: (keyof SignatureData)[] = [
    "name",
    "title",
    "company",
    "phone",
    "email",
    "website",
    "photoUrl",
  ];

  const socialFields: (keyof SignatureData)[] = [
    "linkedin",
    "twitter",
    "github",
    "instagram",
  ];

  const freeTemplates = allTemplates.filter((t) => !t.pro);
  const proOnly = allTemplates.filter((t) => t.pro);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center shadow-sm">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">
              SigCraft
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:inline"
            >
              Pricing
            </Link>
            {user ? (
              <>
                {user.isPro && (
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                    PRO
                  </span>
                )}
                <a
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </a>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={handleUpgrade}
                  className="px-3.5 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Go Pro
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-teal-300 mb-6 border border-white/10">
                <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                Free to use, no signup required
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4 tracking-tight">
                Email signatures
                <br />
                <span className="text-teal-400">that get noticed</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-md leading-relaxed">
                Pick a template, fill in your details, and copy a
                pixel-perfect HTML signature. Works with every major email
                client.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <button
                  onClick={scrollToEditor}
                  className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-teal-500/25"
                >
                  Create Your Signature
                </button>
                <Link
                  href="/pricing"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors border border-white/10"
                >
                  See Pricing
                </Link>
              </div>
              {/* Email client badges */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Works with:</span>
                <div className="flex items-center gap-3">
                  <span className="bg-white/10 px-2.5 py-1 rounded text-xs font-medium text-gray-300">
                    Gmail
                  </span>
                  <span className="bg-white/10 px-2.5 py-1 rounded text-xs font-medium text-gray-300">
                    Outlook
                  </span>
                  <span className="bg-white/10 px-2.5 py-1 rounded text-xs font-medium text-gray-300">
                    Apple Mail
                  </span>
                  <span className="bg-white/10 px-2.5 py-1 rounded text-xs font-medium text-gray-300">
                    Yahoo
                  </span>
                </div>
              </div>
            </div>
            {/* Floating signature preview */}
            <div className="hidden lg:block">
              <div className="sig-preview-frame float-anim p-6 max-w-sm ml-auto">
                <div style={{ fontFamily: "Arial, sans-serif" }}>
                  <table cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td style={{ paddingRight: "16px", verticalAlign: "top" }}>
                          <div
                            style={{
                              width: "72px",
                              height: "72px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #0d9488, #134e4a)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "24px",
                              fontWeight: 700,
                            }}
                          >
                            AJ
                          </div>
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: 700,
                              color: "#0f172a",
                              marginBottom: "2px",
                            }}
                          >
                            Alex Johnson
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#0d9488",
                              fontWeight: 600,
                              marginBottom: "8px",
                            }}
                          >
                            Head of Product Design
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              lineHeight: "1.6",
                            }}
                          >
                            Acme Corporation
                            <br />
                            alex@acme.co | (555) 123-4567
                            <br />
                            <span style={{ color: "#0d9488" }}>
                              acmecorp.com
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Pick a template",
                desc: `Choose from ${allTemplates.length} professional designs — ${freeTemplates.length} free, ${proOnly.length} Pro.`,
              },
              {
                step: "2",
                title: "Add your details",
                desc: "Fill in your name, title, contact info, and social links.",
              },
              {
                step: "3",
                title: "Copy & paste",
                desc: "One click copies your signature HTML. Paste into any email client.",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editor Section */}
      <main
        ref={editorRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Editor */}
          <div className="space-y-6">
            {/* Free Templates */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-teal-500 rounded-full"></span>
                Free Templates
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {freeTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className={`card-hover px-4 py-3 rounded-xl border-2 text-left font-medium ${
                      templateId === t.id
                        ? "border-teal-500 bg-teal-50 text-teal-900 shadow-md"
                        : "border-gray-200 bg-white text-gray-900 hover:border-teal-300"
                    }`}
                  >
                    <span className="text-sm">{t.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Pro Templates */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span>
                  Pro Templates
                </h2>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {proOnly.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {proOnly.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className={`card-hover px-4 py-3 rounded-xl border-2 text-left font-medium relative ${
                      templateId === t.id
                        ? "border-amber-500 bg-amber-50 text-amber-900 shadow-md"
                        : "border-gray-200 bg-white text-gray-900 hover:border-amber-300"
                    }`}
                  >
                    <span className="text-sm">{t.name}</span>
                    {!user?.isPro && (
                      <span className="absolute top-3 right-3 text-amber-500">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {!user?.isPro && (
                <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-amber-900 font-semibold mb-1">
                    Unlock {proOnly.length} Pro templates
                  </p>
                  <p className="text-xs text-amber-700 mb-3">
                    Plus saved signatures, team management, and custom branding
                  </p>
                  <button
                    onClick={handleUpgrade}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Upgrade to Pro — $2.49/mo
                  </button>
                </div>
              )}
            </section>

            {/* Fields */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-teal-500 rounded-full"></span>
                Your Details
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3.5 shadow-sm">
                {mainFields.map((field) => (
                  <div key={field}>
                    <label
                      htmlFor={field}
                      className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide"
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Social Links */}
            <section>
              <button
                onClick={() => setShowSocials(!showSocials)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3 hover:text-gray-900 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showSocials ? "rotate-90" : ""}`}
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
                <span className="w-1.5 h-5 bg-teal-500 rounded-full"></span>
                Social Links
              </button>
              {showSocials && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3.5 shadow-sm">
                  {socialFields.map((field) => (
                    <div key={field}>
                      <label
                        htmlFor={field}
                        className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide"
                      >
                        {fieldLabels[field]}
                      </label>
                      <input
                        id={field}
                        type="url"
                        value={data[field]}
                        onChange={handleChange(field)}
                        placeholder={`https://${field === "twitter" ? "x.com" : field + ".com"}/username`}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right: Preview + Copy */}
          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-teal-500 rounded-full"></span>
                Live Preview
              </h2>
              <div className="flex items-center gap-2">
                {user?.isPro && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-teal-200 text-teal-700 hover:bg-teal-50 transition-all disabled:opacity-50"
                  >
                    {saveMsg || (saving ? "Saving..." : "Save")}
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                    copied
                      ? "bg-emerald-600 text-white shadow-emerald-200"
                      : "bg-teal-600 text-white hover:bg-teal-700 hover:shadow-md"
                  }`}
                >
                  {copied ? "Copied!" : "Copy HTML"}
                </button>
              </div>
            </div>

            {/* Email client mockup frame */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <span className="text-xs text-gray-400 ml-2">
                  New Message
                </span>
              </div>
              <div className="p-4 text-xs text-gray-400 border-b border-gray-100">
                <div className="mb-1">
                  <span className="font-medium text-gray-500">To:</span>{" "}
                  recipient@company.com
                </div>
                <div>
                  <span className="font-medium text-gray-500">Subject:</span>{" "}
                  Quick follow-up
                </div>
              </div>
              <div className="p-4 text-sm text-gray-500 border-b border-gray-100">
                Hi there,
                <br />
                <br />
                Thanks for the great meeting today...
              </div>
              <div className="p-5">
                <div
                  ref={previewRef}
                  dangerouslySetInnerHTML={{ __html: signatureHtml }}
                />
              </div>
            </div>

            {/* Quick Start */}
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
              <h3 className="text-xs font-semibold text-teal-900 mb-2">
                How to install your signature
              </h3>
              <ol className="text-xs text-teal-800 space-y-1 list-decimal list-inside">
                <li>Click &quot;Copy HTML&quot; above</li>
                <li>
                  Open email settings (Gmail: Settings &rarr; Signature)
                </li>
                <li>Paste into the signature editor</li>
              </ol>
            </div>

            {/* Raw HTML Preview */}
            <details className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <summary className="px-4 py-3 text-xs font-semibold text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
                View HTML Source
              </summary>
              <pre className="px-4 pb-4 text-xs text-gray-500 overflow-x-auto whitespace-pre-wrap break-all bg-gray-50 rounded-b-xl">
                {signatureHtml}
              </pre>
            </details>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-teal-700 rounded-md flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                SigCraft
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link
                href="/"
                className="hover:text-teal-600 transition-colors"
              >
                Editor
              </Link>
              <Link
                href="/pricing"
                className="hover:text-teal-600 transition-colors"
              >
                Pricing
              </Link>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>Compatible with Gmail, Outlook, Apple Mail</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Upgrade to Pro
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Unlock premium features
                </p>
              </div>
              <button
                onClick={() => setShowUpgrade(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 mb-4 border border-teal-200">
              <p className="text-sm text-teal-900 font-semibold">
                {allTemplates.filter((t) => t.pro).length} Pro templates +
                saved signatures + team collaboration
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={upgradeEmail}
                onChange={(e) => setUpgradeEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="mt-6 space-y-2">
              <button
                onClick={() => setUpgradePlan("yearly")}
                className={`w-full rounded-lg border-2 p-3 text-left text-sm transition-all ${
                  upgradePlan === "yearly"
                    ? "border-teal-500 bg-teal-50 shadow-md"
                    : "border-gray-200 hover:border-teal-300"
                }`}
              >
                <div className="font-semibold text-gray-900">
                  $29.99/year
                </div>
                <div className="text-xs text-gray-600">
                  Save 37% — just $2.49/mo
                </div>
              </button>
              <button
                onClick={() => setUpgradePlan("monthly")}
                className={`w-full rounded-lg border-2 p-3 text-left text-sm transition-all ${
                  upgradePlan === "monthly"
                    ? "border-teal-500 bg-teal-50 shadow-md"
                    : "border-gray-200 hover:border-teal-300"
                }`}
              >
                <div className="font-semibold text-gray-900">
                  $3.99/month
                </div>
                <div className="text-xs text-gray-600">
                  Cancel anytime
                </div>
              </button>
            </div>
            {verifyError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {verifyError}
              </p>
            )}
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowUpgrade(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={!upgradeEmail.trim()}
                className="flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-all disabled:opacity-50"
              >
                Continue to Payment
              </button>
            </div>
            <button
              onClick={handleVerifyAccess}
              disabled={!upgradeEmail.trim()}
              className="mt-3 w-full text-center text-sm text-teal-600 hover:text-teal-700 hover:underline disabled:opacity-50 transition-colors"
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
