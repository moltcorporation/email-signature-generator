import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Email Signature Generator",
  description:
    "Simple, transparent pricing for Email Signature Generator. Free forever with 5 templates or Pro with 30+ templates and advanced features.",
};

const freeFeatures = [
  "5 professional templates",
  "Basic customization",
  "Works with Gmail, Outlook, Apple Mail",
  "HTML export",
  "No signup required",
];

const proFeatures = [
  "30+ premium templates",
  "Full customization & branding",
  "Team signatures",
  "Social media links",
  "Banner support",
  "Priority support",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-blue-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
        <nav className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-900 dark:text-blue-100">
            Email Signature Generator
          </Link>
          <div className="flex gap-4">
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
            >
              Editor
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Start free with 5 templates. Upgrade to Pro for full access.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 mb-16">
          {/* Free tier */}
          <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Free
            </h2>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                $0
              </span>
              <span className="text-gray-600 dark:text-gray-400">Forever</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Perfect for trying it out. No signup or credit card needed.
            </p>
            <ul className="space-y-4 mb-8">
              {freeFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                >
                  <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="block w-full py-3 text-center rounded-lg border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro tier */}
          <div className="rounded-2xl border-2 border-blue-600 bg-white dark:bg-gray-800 p-8 shadow-lg relative">
            <div className="absolute -top-4 left-6 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
              Most Popular
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Pro
            </h2>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                $29.99
              </span>
              <span className="text-gray-600 dark:text-gray-400">/year</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Just $2.50/month when paid annually
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Ideal for professionals and teams needing advanced templates and features.
            </p>
            <ul className="space-y-4 mb-8">
              {proFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                >
                  <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <a
                href="https://buy.stripe.com/3cIcN58FR8OlaPH7Mo3Nm0Q"
                className="block w-full py-3 text-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold transition-colors"
              >
                Upgrade to Pro — $29.99/yr
              </a>
              <a
                href="https://buy.stripe.com/00wbJ18FR0hP9LD4Ac3Nm0P"
                className="block w-full py-2 text-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Monthly billing also available
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="border-t border-gray-300 dark:border-gray-700 pt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-10 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I change my mind?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes. You can cancel Pro anytime through your Stripe account. Your signatures and templates remain available.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is the free tier really free?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Absolutely. 5 templates, no signup, no credit card. Use it forever at no cost.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do you store my email signature?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Free users: no. We generate it client-side and you copy it directly. Pro users: yes, so you can access it anywhere.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Works with my email provider?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes. Our signatures work with Gmail, Outlook, Apple Mail, and most other email clients.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Create a professional email signature in seconds. Free, no signup required.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 px-6 py-3 font-semibold transition-colors"
          >
            Create Your Signature
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Editor
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
