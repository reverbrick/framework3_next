'use client';

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/theme-context";
import { SearchProvider } from "@/context/search-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import Cookies from "js-cookie";

export function Providers({ children }: { children: React.ReactNode }) {
  const defaultOpen = Cookies.get("sidebar:state") !== "false";

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <SearchProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          {children}
          <Toaster />
        </SidebarProvider>
      </SearchProvider>
    </ThemeProvider>
  );
} 