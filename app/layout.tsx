import type { Metadata } from "next";
import "./globals.css";

const siteUrl = new URL("https://patrickeveraert.info");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Patrick Everaert",
  description:
    "Œuvres, archives, expositions et publications de Patrick Everaert, artiste belge né à Charleroi, actif depuis les années 1990.",
  keywords: [
    "Patrick Everaert",
    "artiste belge",
    "art contemporain belge",
    "photographie",
    "photomontage",
    "collage",
    "Charleroi",
  ],
  authors: [{ name: "Patrick Everaert", url: "https://patrickeveraert.info/" }],
  creator: "Patrick Everaert",
  publisher: "Patrick Everaert",
  category: "Art contemporain",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Patrick Everaert",
    locale: "fr_BE",
    alternateLocale: ["en_GB"],
    title: "Patrick Everaert — Artiste belge contemporain",
    description:
      "Œuvres, archives, expositions et publications de Patrick Everaert.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Patrick Everaert — œuvres et archives, 1989–2022",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Patrick Everaert — Artiste belge contemporain",
    description:
      "Œuvres, archives, expositions et publications de Patrick Everaert.",
    images: ["/og.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://patrickeveraert.info/#patrick-everaert",
      name: "Patrick Everaert",
      url: "https://patrickeveraert.info/",
      birthDate: "1962",
      birthPlace: {
        "@type": "Place",
        name: "Charleroi, Belgique",
      },
      jobTitle: "Artiste plasticien",
      description:
        "Artiste belge dont la pratique associe photographie, montage, collage et superposition d’images.",
      sameAs: ["https://www.fanfare.design/everaert-art"],
    },
    {
      "@type": "WebSite",
      "@id": "https://patrickeveraert.info/#website",
      url: "https://patrickeveraert.info/",
      name: "Patrick Everaert",
      inLanguage: ["fr", "en"],
      creator: {
        "@id": "https://patrickeveraert.info/#patrick-everaert",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
