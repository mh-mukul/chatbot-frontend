"use client";

import * as React from 'react';
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton } from "@/components/ui/sidebar";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
        <SidebarMenuItem>
             <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
    )
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light")
  }
  
  return (
    <SidebarMenuItem>
        <SidebarMenuButton
          onClick={toggleTheme}
          className="w-full justify-start group-data-[collapsible=icon]:justify-center"
        >
          {resolvedTheme === 'light' ? (
            <Moon size={16} />
          ) : (
            <Sun size={16} />
          )}
          <span className="truncate group-data-[collapsible=icon]:hidden">
            {resolvedTheme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
