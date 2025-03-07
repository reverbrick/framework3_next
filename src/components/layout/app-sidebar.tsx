"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/layout/nav-group";
import { TeamSwitcher } from "@/components/layout/team-switcher";
import { getSidebarData } from "./data/sidebar-data";
import { type SidebarData } from "./types";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [sidebarData, setSidebarData] = React.useState<SidebarData | null>(null);

  React.useEffect(() => {
    const loadSidebarData = async () => {
      const data = await getSidebarData();
      setSidebarData(data);
    };
    loadSidebarData();
  }, []);

  if (!sidebarData) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
