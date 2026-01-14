"use client"
 
import * as React from "react"
import {
  IconDashboard,
  IconInnerShadowTop,
  IconUsers,
  IconShield,
  IconKey,
  IconFileText,
} from "@tabler/icons-react"
 
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
 
const data = {
  user: {
    name: "管理员",
    email: "admin@guardian.com",
    avatar: "",
  },
  navMain: [
    {
      title: "仪表板",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "管理员管理",
      url: "/dashboard/admins",
      icon: IconUsers,
    },
    {
      title: "角色管理",
      url: "/dashboard/roles",
      icon: IconShield,
    },
    {
      title: "权限管理",
      url: "/dashboard/permissions",
      icon: IconKey,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">管理中心</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
