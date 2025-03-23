import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuComp - Neural Image Compression",
  description: "Advanced neural network-based image compression",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
