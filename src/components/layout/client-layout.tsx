'use client';

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { isPublicRoute, shouldRedirectWhenLoggedIn } from "@/config/routes";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (!isPublicRoute(pathname)) {
            router.replace('/auth/sign-in');
          }
          return;
        }

        if (mounted) {
          setSession(session);
          
          // Handle redirects based on session state
          if (session && shouldRedirectWhenLoggedIn(pathname)) {
            router.replace('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (!isPublicRoute(pathname)) {
          router.replace('/auth/sign-in');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setSession(session);
        
        // Handle auth state changes
        if (event === 'SIGNED_OUT') {
          if (!isPublicRoute(pathname)) {
            router.replace('/auth/sign-in');
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (shouldRedirectWhenLoggedIn(pathname)) {
            router.replace('/dashboard');
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth, router, pathname]);

  // Don't render layout for auth pages
  if (pathname?.startsWith('/auth')) {
    return children;
  }

  // Show loading state only for protected routes
  if (isLoading && !isPublicRoute(pathname)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {session && <AppSidebar />}
      <div
        id="content"
        className={cn(
          "max-w-full w-full ml-auto",
          session && "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
          session && "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
          "transition-[width] ease-linear duration-200",
          "h-svh flex flex-col",
          "group-data-[scroll-locked=1]/body:h-full",
          "group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh",
        )}
      >
        <Header session={session}>
          <Search />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        {children}
      </div>
    </>
  );
} 