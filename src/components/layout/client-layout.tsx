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
import { isPublicRoute } from "@/config/routes";

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
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
        }
        
        // Debug logging
        console.log('Initial auth check:', {
          pathname,
          isPublicRoute: isPublicRoute(pathname),
          hasSession: !!session,
          shouldRedirect: !session && !isPublicRoute(pathname)
        });
        
        // Only redirect if we're not on a public route and there's no session
        if (!session && !isPublicRoute(pathname)) {
          console.log('Initial check - redirecting to sign-in...');
          router.push('/auth/sign-in');
        }
      } catch (error) {
        console.error('Error getting session:', error);
        // Only redirect to sign-in if not on a public route
        if (!isPublicRoute(pathname)) {
          console.log('Error case - redirecting to sign-in...');
          router.push('/auth/sign-in');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
      }
      
      // Debug logging
      console.log('Auth state changed:', {
        event: _event,
        pathname,
        isPublicRoute: isPublicRoute(pathname),
        hasSession: !!session,
        shouldRedirect: !session && !isPublicRoute(pathname)
      });
      
      // Only redirect if we're not on a public route and there's no session
      if (!session && !isPublicRoute(pathname)) {
        console.log('Auth state change - redirecting to sign-in...');
        router.push('/auth/sign-in');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth, router, pathname]);

  if (isLoading) {
    return null; // Or a loading spinner
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