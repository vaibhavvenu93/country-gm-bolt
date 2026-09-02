import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COUNTRY GM — Bolt Food Malta",
  description:
    "AI-native country operating system for Bolt Food Malta — turning market signals into weekly growth experiments, P&L decisions and execution.",
  applicationName: "COUNTRY GM",
  authors: [
    {
      name: "Vaibhav Venu",
    },
  ],
  openGraph: {
    title: "COUNTRY GM — Bolt Food Malta",
    description:
      "A public-data operating simulation for running Bolt Food Malta: market intelligence, growth opportunities, P&L decisions and weekly experiments.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "COUNTRY GM — Bolt Food Malta",
    description:
      "What if an AI-native Strategy & Operations Manager continuously investigated Malta, challenged the economics and surfaced the next move?",
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