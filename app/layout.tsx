import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "CampoLive - Gestione Tornei e Eventi Sportivi",
  description: "La piattaforma definitiva per organizzare tornei, gestire squadre e trasmettere eventi sportivi in diretta",
  keywords: "tornei, calcio, sport, streaming, eventi sportivi, gestione squadre",
  openGraph: {
    title: "CampoLive",
    description: "Organizza tornei e trasmetti eventi sportivi",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
