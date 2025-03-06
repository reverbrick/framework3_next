import type { Metadata } from "next";
import "@/index.css";
import SkipToMain from "@/components/skip-to-main";
import { cn } from "@/lib/utils";
import { StrictMode } from "react";
import { Providers } from "@/components/providers";
import { ClientLayout } from "@/components/layout/client-layout";

export const metadata: Metadata = {
  title: "Framework3",
  description: "Create internal tools fast!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="group/body">
        <StrictMode>
          <Providers>
            <SkipToMain />
            <ClientLayout>{children}</ClientLayout>
          </Providers>
        </StrictMode>
      </body>
    </html>
  );
}
