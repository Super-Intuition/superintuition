import type { Metadata } from "next";
import "./layers.css";
import "./globals.css";
import AppTheme from "./components/AppTheme";

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
    <html
      lang="en"
      data-astryx-theme="neutral"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body>
        <AppTheme>{children}</AppTheme>
      </body>
    </html>
  );
}
