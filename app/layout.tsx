import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Juux.net",
  description: "Self-hosted service hub"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
