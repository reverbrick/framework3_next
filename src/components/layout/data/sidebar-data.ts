"use client";

import {
  IconBarrierBlock,
  IconBrowserCheck,
  IconBug,
  IconChecklist,
  IconError404,
  IconHelp,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconMessages,
  IconNotification,
  IconPackages,
  IconPalette,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUserOff,
  IconUsers,
  IconTable,
  IconForms,
} from "@tabler/icons-react";
import { AudioWaveform, Command, GalleryVerticalEnd } from "lucide-react";
import { type SidebarData } from "../types";
import { createClient } from "@/utils/supabase/client";

async function getTableDefinitions() {
  const supabase = createClient();
  const { data: tables, error } = await supabase
    .from('table_definitions')
    .select('table_name, columns')
    .not('columns', 'is', null)
    .not('columns', 'eq', '[]')
    .not('columns', 'eq', 'null');

  if (error) {
    console.error('Error fetching table definitions:', error);
    return [];
  }

  // Additional filter to ensure we only have valid column arrays
  return (tables || []).filter(table => 
    Array.isArray(table.columns) && 
    table.columns.length > 0 && 
    table.columns !== null
  );
}

async function getFormDefinitions() {
  const supabase = createClient();
  const { data: forms, error } = await supabase
    .from('form_definitions')
    .select('form_name, name, fields')
    .not('fields', 'is', null)
    .not('fields', 'eq', '[]')
    .not('fields', 'eq', 'null');

  if (error) {
    console.error('Error fetching form definitions:', error);
    return [];
  }

  // Additional filter to ensure we only have valid field arrays
  return (forms || []).filter(form => 
    Array.isArray(form.fields) && 
    form.fields.length > 0 && 
    form.fields !== null
  );
}

export async function getSidebarData(): Promise<SidebarData> {
  const tables = await getTableDefinitions();
  const forms = await getFormDefinitions();
  
  return {
    user: {
      name: "Daniel Górny",
      email: "dadmin.dgor@gmail.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "Framework3",
        logo: Command,
        plan: "Create internal tools fast!",
      },
      {
        name: "Acme Inc",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
    ],
    navGroups: [
      {
        title: "General",
        items: [
          {
            title: "Dashboard",
            url: "/",
            icon: IconLayoutDashboard,
          },
          {
            title: "Tasks",
            url: "/tasks",
            icon: IconChecklist,
          },
          {
            title: "Apps",
            url: "/apps",
            icon: IconPackages,
          },
          {
            title: "Chats",
            url: "/chats",
            badge: "3",
            icon: IconMessages,
          },
          {
            title: "Users",
            url: "/users",
            icon: IconUsers,
          },
        ],
      },
      {
        title: "Tables",
        items: tables.map(table => ({
          title: table.table_name,
          url: `/table/${table.table_name}`,
          icon: IconTable,
        })),
      },
      {
        title: "Forms",
        items: forms.map(form => ({
          title: form.name,
          url: `/form/${form.form_name}`,
          icon: IconForms,
        })),
      },
      {
        title: "Pages",
        items: [
          {
            title: "Auth",
            icon: IconLockAccess,
            items: [
              {
                title: "Sign In",
                url: "/auth/sign-in",
              },
              {
                title: "Sign In (2 Col)",
                url: "/auth/sign-in-2",
              },
              {
                title: "Sign Up",
                url: "/auth/sign-up",
              },
              {
                title: "Forgot Password",
                url: "/auth/forgot-password",
              },
              {
                title: "OTP",
                url: "/auth/otp",
              },
            ],
          },
          {
            title: "Errors",
            icon: IconBug,
            items: [
              {
                title: "Unauthorized",
                url: "/errors/401",
                icon: IconLock,
              },
              {
                title: "Forbidden",
                url: "/errors/403",
                icon: IconUserOff,
              },
              {
                title: "Not Found",
                url: "/errors/404",
                icon: IconError404,
              },
              {
                title: "Internal Server Error",
                url: "/errors/500",
                icon: IconServerOff,
              },
              {
                title: "Maintenance Error",
                url: "/errors/503",
                icon: IconBarrierBlock,
              },
            ],
          },
        ],
      },
      {
        title: "Other",
        items: [
          {
            title: "Settings",
            icon: IconSettings,
            items: [
              {
                title: "Profile",
                url: "/settings/profile",
                icon: IconUserCog,
              },
              {
                title: "Account",
                url: "/settings/account",
                icon: IconTool,
              },
              {
                title: "Appearance",
                url: "/settings/appearance",
                icon: IconPalette,
              },
              {
                title: "Notifications",
                url: "/settings/notifications",
                icon: IconNotification,
              },
              {
                title: "Display",
                url: "/settings/display",
                icon: IconBrowserCheck,
              },
            ],
          },
          {
            title: "Help Center",
            url: "/help-center",
            icon: IconHelp,
          },
        ],
      },
    ],
  };
}
