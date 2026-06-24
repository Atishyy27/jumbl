import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { NavbarLinks } from "@/components/navbar-links";
import "./globals.css";

const sansFont = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalentFlow | Applicant Tracking System",
  description: "Next-generation Applicant Tracking System for scaling teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${sansFont.variable} ${monoFont.variable} antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20`}
      >
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 -z-50 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
                <span className="bg-primary text-primary-foreground px-2.5 py-1 rounded-lg text-lg font-extrabold tracking-wider mr-1 shadow-sm">
                  TF
                </span>
                Talent<span className="font-light text-muted-foreground">Flow</span>
              </Link>
              <NavbarLinks />
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SQLite Online
              </span>
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                JD
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="w-full border-t border-border bg-card py-6">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div>
              &copy; {new Date().getFullYear()} TalentFlow Inc. Built for ATS Intern Assignment.
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <span>&bull;</span>
              <a href="#" className="hover:underline">Terms of Service</a>
              <span>&bull;</span>
              <span className="font-mono bg-muted px-2 py-0.5 rounded text-[10px]">v1.0.0-foundation</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
