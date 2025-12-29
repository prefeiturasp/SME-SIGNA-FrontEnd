"use client";

import * as React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

type InfoTooltipProps = {
    content: React.ReactNode;
    children?: React.ReactElement;
    side?: Side;
    align?: Align;
    delayDuration?: number;
    contentClassName?: string;
};

function InfoTooltipInner({
    content,
    children,
    side = "top",
    align = "start",
    delayDuration = 150,
    contentClassName,
}: Readonly<InfoTooltipProps>) {
    const trigger = children ?? (
        <button
            type="button"
            aria-label="Ajuda"
            className={cn(
                "inline-flex items-center justify-center rounded-full",
                "w-[13px] h-[13px] bg-[#42474A] text-white shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42474A]/50 focus-visible:ring-offset-2"
            )}
        >
            <span className="text-[10px] leading-none font-bold">?</span>
        </button>
    );

    return (
        <Tooltip delayDuration={delayDuration}>
            <TooltipTrigger asChild>{trigger}</TooltipTrigger>
            <TooltipContent
                side={side}
                align={align}
                sideOffset={8}
                className={cn(
                    "bg-[#42474A] text-[#fff] border border-[#42474A] shadow-lg ml-1",
                    "rounded-md px-3 py-2 text-center",
                    "text-[12px] leading-[1.2] font-normal",
                    "max-w-[246px]",
                    "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0",
                    "data-[side=top]:slide-in-from-bottom-1 data-[side=bottom]:slide-in-from-top-1",
                    "data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",

                    contentClassName
                )}
            >
                {content}
                {side === "top" && (
                    <span
                        className={cn(
                            "absolute -bottom-[6px] left-0 w-[16px] h-[12px] bg-[#42474A] ml-1",
                            "[clip-path:polygon(0_0,100%_0,0_100%)]"
                        )}
                    />
                )}
            </TooltipContent>
        </Tooltip>
    );
}

export default function InfoTooltip(props: Readonly<InfoTooltipProps>) {
    return (
        <TooltipProvider>
            <InfoTooltipInner {...props} />
        </TooltipProvider>
    );
}
