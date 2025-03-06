import { Main } from "@/components/layout/main";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

interface PageLayoutProps {
  /** The main content to be rendered */
  children: React.ReactNode;
  /** The title of the page */
  title: string;
  /** Optional description of the page */
  description?: string;
  /** Optional additional content to be rendered in the title area */
  titleContent?: React.ReactNode;
}

export function PageLayout({ 
  children, 
  title, 
  description,
  titleContent
}: PageLayoutProps) {
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (!session) return children;

  return (
    <Main>
      <div className="mb-2 flex items-center justify-between space-y-2 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {titleContent}
      </div>
      {children}
    </Main>
  );
} 