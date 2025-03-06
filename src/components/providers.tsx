'use client';

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/theme-context";
import { SearchProvider } from "@/context/search-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NextIntlClientProvider } from 'next-intl';
import Cookies from "js-cookie";
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
  messages?: any;
  locale?: string;
}

export function Providers({ children, messages, locale }: ProvidersProps) {
  const defaultOpen = Cookies.get("sidebar:state") !== "false";

  const content = (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <SearchProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          {children}
          <Toaster />
        </SidebarProvider>
      </SearchProvider>
    </ThemeProvider>
  );

  if (messages && locale) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        {content}
      </NextIntlClientProvider>
    );
  }

  return content;
} 