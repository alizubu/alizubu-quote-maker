import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

// ⚠️ সরাসরি next-themes থেকে নয়, আমাদের বানানো ক্লায়েন্ট প্রোভাইডার ইম্পোর্ট করতে হবে
import { ThemeProvider } from "../components/ThemeProvider"; 

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Alizubu Quote Maker",
  description: "Professional Web-based Canvas Editor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning দেওয়া হয়েছে যাতে next-themes এর কারণে কোনো ওয়ার্নিং না আসে
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}