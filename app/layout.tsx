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
            <div className="container mx-auto px-4 py-4">
              <nav className="flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-primary hover:opacity-80">
                  Siscora
                </Link>
                <div className="flex items-center gap-4">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Sign up</Button>
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
