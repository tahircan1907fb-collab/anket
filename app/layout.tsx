import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Space_Grotesk } from "next/font/google";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "700"]
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "AmbarScope | Premium Ambar Ihtiyac Analizi",
  description:
    "Depo operasyonlarinizi netlestiren, premium deneyimli web anketi ile ihtiyaclarinizi toplayin ve size uygun ambar yazilimi kapsamaini ortaya cikarin.",
  metadataBase: new URL("https://example.com")
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
