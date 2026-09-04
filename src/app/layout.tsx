import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrowthOS — Autonomous Social Growth",
  description: "AI-native social growth operating system for planning, creating, publishing, measuring and optimizing campaigns.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
