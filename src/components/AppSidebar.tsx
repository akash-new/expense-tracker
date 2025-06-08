"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Target,
  Sparkles,
  Settings,
  LogOut,
  LogIn,
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { AppLogo } from "@/components/AppLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { Button } from "./ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, authRequired: false },
  { href: "/expenses", label: "Expenses", icon: CreditCard, authRequired: true },
  { href: "/budgets", label: "Budgets", icon: Target, authRequired: true },
  { href: "/charts", label: "Charts", icon: BarChart3, authRequired: true },
  { href: "/savings-ai", label: "AI Savings", icon: Sparkles, authRequired: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { session, signOut, isLoadingAuth } = useAuth(); // Get auth state and functions

  return (
    <Sidebar variant="sidebar" collapsible="icon" side="left">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 py-2 hover:no-underline">
          <AppLogo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            if (item.authRequired && !session && !isLoadingAuth) {
              return null; // Don't render auth-required items if not logged in
            }
            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    disabled={item.authRequired && isLoadingAuth}
                    className={cn(
                      "justify-start",
                      pathname === item.href
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <a>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          {session && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Settings"
                className="justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                disabled // Settings page not implemented
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            {session ? (
              <SidebarMenuButton
                onClick={signOut}
                tooltip="Sign Out"
                className="justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                disabled={isLoadingAuth}
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </SidebarMenuButton>
            ) : (
              <Link href="/auth/signin" passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  tooltip="Sign In"
                  isActive={pathname === "/auth/signin"}
                  className={cn(
                      "justify-start",
                      pathname === "/auth/signin"
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  disabled={isLoadingAuth}
                >
                  <a>
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}