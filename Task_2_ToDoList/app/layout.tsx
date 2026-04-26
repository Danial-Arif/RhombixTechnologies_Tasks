import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo List",
  description: "Manage your daily tasks | By Danial Arif",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
