import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "File Vault - Commotion Labs",
  description: "A file management application with folder organization and metadata",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}