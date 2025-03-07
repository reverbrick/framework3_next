import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TableNotFound() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Table Not Found</h2>
      <p className="text-muted-foreground">
        The table you're looking for doesn't exist or you don't have access to it.
      </p>
      <Button asChild>
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
} 