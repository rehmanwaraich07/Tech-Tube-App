import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Providers from "@/components/Providers";

const geistSans = Geist({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechTube",
  description:
    "TechTube - Your Ultimate Tech Video Sharing Platform. Share, discover, and engage with the latest technology videos, tutorials, and insights. Join our community of tech enthusiasts and creators to learn, share knowledge, and stay updated with cutting-edge technology trends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
