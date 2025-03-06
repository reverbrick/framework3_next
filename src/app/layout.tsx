import type { Metadata } from "next";
import "@/index.css";
import SkipToMain from "@/components/skip-to-main";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { cn } from "@/lib/utils";
import { StrictMode } from "react";
import { Providers } from "@/components/providers";

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
            <AppSidebar />
            <div
              id="content"
              className={cn(
                "max-w-full w-full ml-auto",
                "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
                "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
                "transition-[width] ease-linear duration-200",
                "h-svh flex flex-col",
                "group-data-[scroll-locked=1]/body:h-full",
                "group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh",
              )}
            >
              {children}
            </div>
          </Providers>
        </StrictMode>
      </body>
    </html>
  );
}
