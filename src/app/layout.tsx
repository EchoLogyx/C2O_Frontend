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
          src="https://staging.d1n7r7gw9tmtrw.amplifyapp.com/chatBot.js?botid=c6a6ecbb-66f0-4097-be42-e743fa400e62"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}
