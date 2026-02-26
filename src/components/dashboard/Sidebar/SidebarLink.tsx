"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

interface SidebarLinkProps
    extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
    active?: boolean;
    rightIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const SidebarLink = React.forwardRef<
    HTMLAnchorElement,
    SidebarLinkProps
>(
    (
        {
            href,
            icon: Icon,
            title,
            active,
            rightIcon: RightIcon,
            className,
            ...props
        },
        ref
    ) => {
        const { open } = useSidebar();

        const iconColor = active
            ? "fill-[--sidebar-accent-foreground]"
            : "fill-white";
        const textColor = active
            ? "text-[--sidebar-accent-foreground]"
            : "text-white";

        return (
            <a
                ref={ref}
                href={href}
                className={cn(
                    "relative flex items-center gap-2",
                    open ? "flex-row justify-start" : "flex-col justify-center",
                    className
                )}
                {...props}
            >
                <Icon
                    width={open ? 16 : 22}
                    height={open ? 16 : 19}
                    className={iconColor}
                />

                <div
                    className={cn(
                        "flex flex-col gap-0.5 font-semibold",
                        textColor,
                        open
                            ? " text-[14px]"
                            : "items-center mt-1  text-[10px] text-center break-words whitespace-normal w-[80px] leading-[1.1]"
                    )}
                >
                    <span>{title}</span>
                </div>

                {!open && RightIcon && (
                    <RightIcon
                        width={12}
                        height={12}
                        className={cn("absolute right-2 top-[8px]", iconColor)}
                    />
                )}
            </a>
        );
    }
);

SidebarLink.displayName = "SidebarLink";
