import type { Metadata, Viewport } from "next";
import { Lexend, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaClient } from "@/components/pwa/pwa-client";

const lexend = Lexend({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PowerOS",
  applicationName: "PowerOS",
  appleWebApp: { capable: true, title: "PowerOS", statusBarStyle: "default" },
  icons: { apple: "/pwa/apple-touch-icon.png" },
  description: "The community-built, open-source operating system for your business.",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, minimumScale: 1, maximumScale: 1,
  userScalable: false, viewportFit: "cover", themeColor: "#2458c7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${lexend.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><PwaClient />{children}</body>
    </html>
  );
}
