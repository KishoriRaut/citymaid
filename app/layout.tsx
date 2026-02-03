import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { appConfig } from "@/lib/config";
import { ConditionalHeader } from "@/components/layout/ConditionalHeader";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { Toaster } from "@/components/ui/toaster";
import { EnvironmentIndicator } from "@/components/EnvironmentIndicator";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: `${appConfig.brand.name} - ${appConfig.brand.tagline}`,
  description: appConfig.brand.description,
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
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
          <ConditionalHeader />
          <main className="flex-1">{children}</main>
          <ConditionalFooter />
        </div>
        <Toaster />
        <EnvironmentIndicator />
      </body>
    </html>
  );
}
