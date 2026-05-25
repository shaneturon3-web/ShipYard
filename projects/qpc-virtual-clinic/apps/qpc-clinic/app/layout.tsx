import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quebec Psychology Clinic",
  description: "Human-centered psychology care — Montreal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
