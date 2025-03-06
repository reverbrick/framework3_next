import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  fixed?: boolean;
}

export function PageLayout({ 
  children, 
  title, 
  description,
  fixed = true 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen">
      <Header fixed={fixed}>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {children}
      </Main>
    </div>
  );
} 