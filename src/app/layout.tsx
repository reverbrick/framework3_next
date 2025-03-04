import Cookies from "js-cookie";
import type { Metadata } from "next";

import "@/index.css";
import { SearchProvider } from "@/context/search-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import SkipToMain from "@/components/skip-to-main";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { cn } from "@/lib/utils";
import { StrictMode } from "react";
import { ThemeProvider } from "@/context/theme-context";

export const metadata: Metadata = {
  title: "Framework3",
  description: "Create internal tools fast!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const defaultOpen = Cookies.get("sidebar:state") !== "false";

  return (
    <html lang="en">
      <body className="group/body">
        <StrictMode>
          <ThemeProvider defaultTheme="light" storageKey="ui-theme">
            <SearchProvider>
              <SidebarProvider defaultOpen={defaultOpen}>
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
              </SidebarProvider>
            </SearchProvider>
          </ThemeProvider>
        </StrictMode>
      </body>
    </html>
  );
}
