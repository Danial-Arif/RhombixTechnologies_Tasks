import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import SocketInitializer from "@/components/SocketInitializer";
import { SocketProvider } from "@/context/SocketContext";
import Navbar from "@/components/Navbar";
import Rightbar from "@/components/Rightbar";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexus — Social Platform",
  description:
    "A modern realtime social networking platform. Connect, share, and discover.",
  keywords: ["social media", "networking", "realtime", "chat", "community"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-full bg-background text-foreground antialiased">
        <AuthProvider>
          <SocketProvider>
            <TooltipProvider>
              <SocketInitializer />
              <Navbar />
              <main className="flex-1 pt-14 pb-20 md:pt-0 md:pb-0 md:pl-64">
                <div className="flex w-full min-h-screen relative">
                  <div className="flex-1 min-w-0">
                    {children}
                  </div>
                  <Rightbar />
                </div>
              </main>
            </TooltipProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
