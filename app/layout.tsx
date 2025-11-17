import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roast Me (PG-13)",
  description: "Roast Me (PG-13) is a web app that generates a concise, PG-13 roast from your webcam photo and hears it yelled out loud using OpenAI's gpt-4o-mini (vision) and gpt-4o-mini-tts (text-to-speech).",
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
