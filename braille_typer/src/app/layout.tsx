import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Braille Auto-Correct System | QWERTY Braille Typing & Suggestions",
  description:
    "Braille Auto-Correct System: Type in QWERTY Braille format and get real-time spelling suggestions, powered by Trie-based search and custom dictionaries. Accessible, fast, and optimized for visually impaired users.",
  openGraph: {
    title: "Braille Auto-Correct System",
    description:
      "Type in QWERTY Braille format and get real-time suggestions. Accessible, fast, and optimized for visually impaired users.",
    url: "https://braille-typing.vercel.app",
    siteName: "Braille Auto-Correct System",
    images: [
      {
        url: "/file.svg",
        width: 1200,
        height: 630,
        alt: "Braille Auto-Correct System Screenshot",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Braille Auto-Correct System",
    description: "Type in QWERTY Braille format and get real-time suggestions.",
    images: ["/file.svg"],
    creator: "@Aman09143227",
  },
  metadataBase: new URL("https://braille-typing.vercel.app"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Braille Auto-Correct System",
              url: "https://braille-typing.vercel.app/", // Replace with your real domain
              description:
                "Type in QWERTY Braille format and get real-time suggestions. Accessible, fast, and optimized for visually impaired users.",
              applicationCategory: "Accessibility",
              inLanguage: "en",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
            }),
          }}
        />
        <meta name="google-site-verification" content="wWuvjXv4TbbQZsDxAJIy8huwBGRyKrkzFBzje8MK6FE" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
