import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/lib/providers";
import AuthProvider from "@/components/providers/session-provider";


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
    <Providers>
      <AuthProvider>{children}</AuthProvider>
      </Providers> 
    </body> 
    </html> 
    ) 
  }
