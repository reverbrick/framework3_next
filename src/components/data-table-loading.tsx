import { IconLoader } from '@tabler/icons-react';

interface DataTableLoadingProps {
  message?: string;
  className?: string;
}

export function DataTableLoading({ 
  message = "Loading data...",
  className = ""
}: DataTableLoadingProps) {
  return (
    <div className={`flex h-full items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <IconLoader className="h-8 w-8 animate-spin text-primary" />
        <div className="text-lg text-muted-foreground">{message}</div>
      </div>
    </div>
  );
} 