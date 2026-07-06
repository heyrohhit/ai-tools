import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteUrl, siteName, siteDescription } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Prompt Hub — Discover, Generate & Share the Best AI Prompts",
    template: "%s | AI Prompt Hub",
  },
  description: siteDescription,
  keywords: [
    "AI prompts",
    "prompt library",
    "prompt generator",
    "ChatGPT prompts",
    "Claude prompts",
    "Midjourney prompts",
    "prompt engineering",
  ],
  applicationName: siteName,
  alternates: { canonical: "/" },
  openGraph: {
    title: "AI Prompt Hub — Discover, Generate & Share the Best AI Prompts",
    description: siteDescription,
    type: "website",
    url: siteUrl,
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Prompt Hub",
    description: siteDescription,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="page-gradient" aria-hidden="true" />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
