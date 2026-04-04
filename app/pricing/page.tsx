import Link from "next/link";
import type { Metadata } from "next";
import { PAYMENT_LINKS } from "../lib/pro";

export const metadata: Metadata = {
  title: "Pricing | SigCraft — Email Signature Generator",
  description:
    "Simple, transparent pricing. Free forever with 5 templates or upgrade to Pro with 23+ templates, saved signatures, and team features.",
};

const freeFeatures = [
  "5 professional templates",
  "Basic customization",
  "Works with Gmail, Outlook, Apple Mail",
  "HTML export",
  "No signup required",
];

const proFeatures = [
  "23+ premium templates",
  "Full customization & branding",
  "Team signatures",
  "Social media links",
  "Saved signatures",
  "Banner support",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <nav className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
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
            <span className="text-lg font-bold text-gray-900">SigCraft</span>
          </Link>
          <Link
            href="/"
            className="rounded-lg px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors"
          >
            Back to Editor
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            Start free with 5 templates. Upgrade to Pro when you need more
            power.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto mb-20">
          {/* Free tier */}
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Free</h2>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-extrabold text-gray-900">$0</span>
              <span className="text-gray-500">forever</span>
            </div>
            <p className="text-sm text-gray-500 mb-8">
              No signup or credit card needed. Just start creating.
            </p>
            <ul className="space-y-3 mb-8">
              {freeFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-gray-700"
                >
                  <svg
                    className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="block w-full py-3 text-center rounded-lg border-2 border-teal-600 text-teal-700 font-semibold hover:bg-teal-50 transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro tier */}
          <div className="rounded-2xl border-2 border-teal-600 bg-white p-8 shadow-lg relative">
            <div className="absolute -top-4 left-6 bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-bold">
              Most Popular
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Pro</h2>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-extrabold text-gray-900">
                $29.99
              </span>
              <span className="text-gray-500">/year</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Just $2.49/month when paid annually
            </p>
            <p className="text-sm text-gray-500 mb-8">
              For professionals and teams who need advanced templates and
              features.
            </p>
            <ul className="space-y-3 mb-8">
              {proFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-gray-700"
                >
                  <svg
                    className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <a
                href={PAYMENT_LINKS.yearly.url}
                className="block w-full py-3 text-center rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors shadow-sm"
              >
                Upgrade to Pro — $29.99/yr
              </a>
              <a
                href={PAYMENT_LINKS.monthly.url}
                className="block w-full py-2 text-center text-sm text-gray-500 hover:text-teal-600 transition-colors"
              >
                or $3.99/month
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="border-t border-gray-200 pt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-sm text-gray-500">
                Yes. Cancel Pro anytime through your Stripe account. Your
                signatures stay accessible.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is the free tier really free?
              </h3>
              <p className="text-sm text-gray-500">
                Absolutely. 5 templates, no signup, no credit card. Use it
                forever at no cost.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Do you store my data?
              </h3>
              <p className="text-sm text-gray-500">
                Free users: no, we generate signatures client-side. Pro users:
                yes, so you can access them anywhere.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Which email clients work?
              </h3>
              <p className="text-sm text-gray-500">
                Gmail, Outlook, Apple Mail, Yahoo, and most other email clients.
                Our signatures use universal HTML tables.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 hero-gradient rounded-2xl p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Ready to create your signature?
          </h2>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Join thousands of professionals using SigCraft. Free, no signup
            required.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-teal-500 hover:bg-teal-400 text-white px-6 py-3 font-semibold transition-colors shadow-lg shadow-teal-500/25"
          >
            Create Your Signature
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
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
            <Link href="/" className="hover:text-teal-600 transition-colors">
              Editor
            </Link>
            <Link
              href="/pricing"
              className="hover:text-teal-600 transition-colors"
            >
              Pricing
            </Link>
          </div>
          <span className="text-xs text-gray-400">
            Works with Gmail, Outlook, Apple Mail
          </span>
        </div>
      </footer>
    </div>
  );
}
