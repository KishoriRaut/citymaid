import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { appConfig } from "@/lib/config";
import { ConditionalHeader } from "@/components/layout/ConditionalHeader";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { ToastProvider } from "@/components/shared/toast";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ToastProvider>
          <div className="flex min-h-screen flex-col">
            <ConditionalHeader />
            <main className="flex-1">{children}</main>
            <ConditionalFooter />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
