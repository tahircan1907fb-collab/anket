import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "AmbarScope | Premium Ambar Ihtiyac Analizi",
  description:
    "Depo operasyonlarinizi netlestiren, premium deneyimli web anketi ile ihtiyaclarinizi toplayin ve size uygun ambar yazilimi kapsamını ortaya cikarın.",
  metadataBase: new URL("https://example.com")
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
