"use client";

import { useState, useCallback, useRef } from "react";
import { templates, SignatureData } from "./templates";

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

export default function SignatureEditor() {
  const [data, setData] = useState<SignatureData>(defaultData);
  const [templateId, setTemplateId] = useState(templates[0].id);
  const [copied, setCopied] = useState(false);
  const [showSocials, setShowSocials] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const template = templates.find((t) => t.id === templateId) || templates[0];
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
          <span className="text-xs text-gray-400 hidden sm:block">Free &middot; No signup required</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Editor */}
          <div className="space-y-6">
            {/* Template Selector */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Choose a Template
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplateId(t.id)}
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
    </div>
  );
}
