import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { TabBar } from "@/features/navigation/components/tab-bar";
import { Eruda } from "@/features/debug/eruda";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alien Miniapp",
  description: "Alien Miniapp Boilerplate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 px-6 pb-24 pt-12">
            {children}
          </main>
          <TabBar />
          {process.env.NODE_ENV === "development" && <Eruda />}
        </Providers>
      </body>
    </html>
  );
}
