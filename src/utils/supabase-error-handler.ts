import { toast } from "@/hooks/use-toast";
import { PostgrestError } from "@supabase/supabase-js";

interface ErrorConfig {
  context?: string;
  fallbackMessage?: string;
}

export function handleSupabaseError(error: PostgrestError | Error, config: ErrorConfig = {}) {
  const { context = "operation", fallbackMessage = "An unexpected error occurred" } = config;

  if ('code' in error) {
    const supabaseError = error as PostgrestError;
    
    switch (supabaseError.code) {
      case 'PGRST116':
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: `You don't have permission to perform this ${context}. Please contact your administrator.`,
        });
        break;
      case '42P01':
        toast({
          variant: "destructive",
          title: "Database Error",
          description: "The requested resource could not be found. Please contact support.",
        });
        break;
      case 'PGRST301':
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Unable to connect to the database. Please try again later.",
        });
        break;
      default:
        toast({
          variant: "destructive",
          title: `Error During ${context}`,
          description: supabaseError.message || fallbackMessage,
        });
    }
  } else {
    console.error(`Error during ${context}:`, error);
    toast({
      variant: "destructive",
      title: `Error During ${context}`,
      description: fallbackMessage,
    });
  }
} 