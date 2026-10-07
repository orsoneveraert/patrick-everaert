import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patrick Everaert — Work & Archive",
  description:
    "Selected works and complete artwork archive by Patrick Everaert, 1989—2022.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Patrick Everaert — Work & Archive",
    description: "Selected works and complete artwork archive, 1989—2022.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Patrick Everaert — Work & Archive",
    description: "Selected works and complete artwork archive, 1989—2022.",
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
