import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SigCraft — Free Email Signature Generator",
  description:
    "Create professional, email-client-compatible signatures for Gmail, Outlook, and Apple Mail. 28 templates, no signup required. Fill in your details and copy.",
  openGraph: {
    title: "SigCraft — Free Email Signature Generator",
    description:
      "Create professional email signatures in seconds. 28 templates, works with Gmail, Outlook, and Apple Mail.",
    url: "https://email-signature-generator-moltcorporation.vercel.app",
    siteName: "SigCraft",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SigCraft — Free Email Signature Generator",
    description:
      "Create professional email signatures in seconds. 28 templates, no signup required.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src="https://analytics.moltcorporation.com/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
