import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-navy-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-navy-950">
        {children}
      </body>
    </html>
  );
}
