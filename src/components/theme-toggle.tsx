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
          tooltip={resolvedTheme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            Toggle Theme
          </span>
        </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
