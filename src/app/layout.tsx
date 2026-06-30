import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuoteAI Admin",
  description: "AI-powered product quotation admin panel",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <Script
          src={`${process.env.NEXT_PUBLIC_BOT_URL}?botid=${process.env.NEXT_PUBLIC_BOT_ID}`}
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}
