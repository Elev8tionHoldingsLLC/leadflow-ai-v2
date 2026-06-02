import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";
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
  title: "LeadFlow AI",
  description: "AI-powered property intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen overflow-x-hidden bg-black text-white antialiased">
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3000,
      style: {
        background: "#111111",
        color: "#ffffff",
        border: "1px solid rgba(34,211,238,0.3)",
        borderRadius: "16px",
      },
      success: {
        iconTheme: {
          primary: "#4ade80",
          secondary: "#000",
        },
      },
      error: {
        iconTheme: {
          primary: "#f87171",
          secondary: "#000",
        },
      },
    }}
  />

  <Sidebar />

  {children}
</body>
    </html>
  );
}