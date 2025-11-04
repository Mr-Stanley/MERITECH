import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MERITECH BUILDING TECHNOLOGIES - Building Materials Shop",
  description: "Browse our digital menu of building materials and interior decoration products",
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
