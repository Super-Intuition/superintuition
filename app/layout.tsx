import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuperIntuition — Code Review",
  description: "Private code review walkthrough.",
  robots: { index: false, follow: false },
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
