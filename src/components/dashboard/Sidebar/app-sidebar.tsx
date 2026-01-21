"use client";

import * as React from "react";
import Home from "@/assets/icons/Home";
import User from "@/assets/icons/User";
import Bars from "@/assets/icons/Bars";
import Designacao from "@/assets/icons/Designacao";
import { cn } from "@/lib/utils";
import { SidebarLink } from "./SidebarLink";
import { usePathname } from "next/navigation";
import LogoSignaNome from "@/assets/images/logo-signa.png";

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarRail,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
 
const items = [
    {
        title: "Início",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Meus dados",
        url: "/dashboard/meus-dados",
        icon: User,
    },
    {
        title: "Designações",
        url: "/dashboard/designacoes-passo-1",
        icon: Designacao,
    },
 
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    const { open } = useSidebar();
    return (
        <Sidebar
            className="bg-[--sidebar-background] text-[--sidebar-foreground] w-[--sidebar-width]"
            collapsible="icon"
            {...props}
        >
            <SidebarHeader>
                <SidebarTrigger logo={LogoSignaNome} />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className={`${open ? "p-2" : "p-1"}`}>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive = pathname === item.url;

                                return (
                                    <SidebarMenuItem
                                        key={item.title}
                                        className={cn(
                                            isActive
                                                ? "bg-[--sidebar-accent]"
                                                : "bg-[--sidebar-accent-foreground] mb-1",
                                            open
                                                ? "w-[--sidebar-item-width] h-[--sidebar-item-height] flex flex-col items-center"
                                                : "h-[--sidebar-item-height-collapsed] w-[--sidebar-item-width-collapsed] flex flex-col items-center justify-center"
                                        )}
                                    >
                                        <SidebarMenuButton asChild>
                                            <SidebarLink
                                                href={item.url}
                                                icon={item.icon}
                                                title={item.title}
                                                active={isActive}
                                                rightIcon={Bars}
                                            />
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
