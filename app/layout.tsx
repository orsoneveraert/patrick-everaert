import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patrick Everaert — Selected Works",
  description:
    "A virtual museum presenting the work of Patrick Everaert at real-world relative scale.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Patrick Everaert — Selected Works",
    description: "A minimal virtual museum, 1989—2022.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Patrick Everaert — Selected Works",
    description: "A minimal virtual museum, 1989—2022.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
