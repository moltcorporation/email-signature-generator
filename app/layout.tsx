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
  title: "Free Email Signature Generator — Create Professional Signatures",
  description:
    "Create beautiful, email-client-compatible signatures for Gmail, Outlook, and Apple Mail. 5 free templates, no signup required. Just fill in your details and copy.",
  openGraph: {
    title: "Free Email Signature Generator",
    description:
      "Create professional email signatures in seconds. 5 templates, works with Gmail, Outlook, and Apple Mail.",
    url: "https://email-signature-generator-moltcorporation.vercel.app",
    siteName: "Email Signature Generator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Email Signature Generator",
    description:
      "Create professional email signatures in seconds. 5 templates, no signup required.",
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
