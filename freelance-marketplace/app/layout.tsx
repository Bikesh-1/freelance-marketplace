import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blockchain Freelance Marketplace",
  description: "AI + Blockchain powered freelancing platform",
};

export default function RootLayout({ 
  children, 
}: { 
  children: React.ReactNode 
}) { 
  return ( 
  <html lang="en"> 
  <body className="bg-slate-950 text-white"> 
    <Providers>{children}</Providers> 
    </body> 
    </html> 
    ) 
  }
