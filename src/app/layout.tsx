import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteUrl } from "@/lib/site";
import { fetchDiscordProfile } from "@/lib/discord-profile";
import { intToHex } from "@/lib/discord-profile.shared";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();
const title = "zeusgmj";
const description = "building (maybe) stuff, watching stuff, gaming stuff";

export async function generateViewport(): Promise<Viewport> {
  const userId = process.env.DISCORD_USER_ID
  if (!userId) return {}
  try {
    const profile = await fetchDiscordProfile(userId)
    if (!profile.themeColors) return {}
    return { themeColor: intToHex(profile.themeColors[0]) }
  } catch {
    return {}
  }
}

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title,
  description,
  applicationName: title,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    siteName: title,
    type: "website",
    url: "/",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
