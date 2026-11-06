import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/supabase/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SkillSwap AI — Find Your Perfect Team",
  description:
    "AI-powered collaboration platform for college students. Find compatible teammates based on complementary technical skills, project goals, and availability.",
  keywords: [
    "student collaboration",
    "hackathon team finder",
    "skill swap",
    "AI matchmaking",
    "capstone teammates",
    "college tech projects",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", inter.variable)}>
      <body className="min-h-screen bg-[#0B0F19] text-slate-100 antialiased selection:bg-purple-600 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
