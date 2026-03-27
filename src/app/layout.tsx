import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Background Remover - Remove Image Background",
  description: "Remove image background with one click. Powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {children}
      </body>
    </html>
  );
}
