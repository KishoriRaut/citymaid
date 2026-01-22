import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: `${appConfig.brand.name} - ${appConfig.brand.tagline}`,
  description: appConfig.brand.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <div className="flex min-h-screen flex-col">
          <header className="border-b">
            <div className="container mx-auto px-4 py-3 sm:py-4">
              <nav className="flex items-center justify-between">
                <Link href={appConfig.routes.home} className="text-lg sm:text-xl font-bold text-primary hover:opacity-80 transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
                  {appConfig.brand.name}
                </Link>
                <div className="flex items-center gap-2 sm:gap-4">
                  <Link
                    href={appConfig.routes.login}
                    className="text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 px-2 py-1.5 sm:px-0 sm:py-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                  >
                    Admin
                  </Link>
                </div>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t bg-secondary text-secondary-foreground">
            <div className="container mx-auto px-4 py-6">
              <div className="text-center text-sm">
                <p>&copy; {new Date().getFullYear()} {appConfig.brand.name}. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
