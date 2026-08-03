import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ModalProvider } from "@/components/providers/modal-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const publicAppUrl =
  process.env.NEXT_PUBLIC_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
  "https://www.digica-academy.web.id";

export const metadata: Metadata = {
  metadataBase: new URL(publicAppUrl),
  title: "Digica Academy Dashboard",
  description:
    "Dashboard for managing Digica Academy programs, participants, payments, and expenses",
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
        <QueryProvider>
          {children}
          <ModalProvider />
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
