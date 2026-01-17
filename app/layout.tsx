import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Siscora - Building Smart Software Solutions",
  description: "Building Smart Software Solutions",
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
                <Link href="/" className="text-lg sm:text-xl font-bold text-primary hover:opacity-80 transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
                  Siscora
                </Link>
                <div className="flex items-center gap-2 sm:gap-4">
                  <Link
                    href="/login"
                    className="text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 px-2 py-1.5 sm:px-0 sm:py-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                  >
                    Sign in
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="text-xs sm:text-sm min-h-[36px] sm:min-h-0 px-3 sm:px-4">
                      Sign up
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t bg-secondary text-secondary-foreground">
            <div className="container mx-auto px-4 py-6">
              <div className="text-center text-sm">
                <p>&copy; {new Date().getFullYear()} Siscora. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
