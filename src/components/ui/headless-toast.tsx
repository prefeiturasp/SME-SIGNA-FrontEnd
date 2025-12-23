// components/ui/headless-toast.tsx
"use client";

import * as React from "react";
import { toast as sonnerToast } from "sonner";
import { CheckCircle2, X, CircleX } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

function cn(...c: Array<string | false | undefined>) {
    return c.filter(Boolean).join(" ");
}

const toastStyles = cva(
    "group pointer-events-auto w-[336px] rounded-[4px] border shadow-lg ring-1 p-4 flex items-start gap-3",
    {
        variants: {
            variant: {
                default: "bg-white border-zinc-200 text-zinc-900 ring-black/5",
                success:
                    "bg-[#D4EDDA] border border-[#155724] text-[#155724] ring-transparent",
                error: "bg-[#FBC7C4] border border-[#B40C02] text-[#721c24] ring-transparent",
            },
        },
        defaultVariants: { variant: "default" },
    }
);

type ToastVariant = NonNullable<VariantProps<typeof toastStyles>["variant"]>;

type ToastInput = {
    title: string;
    description?: string;
    variant?: ToastVariant;
};

type HeadlessToastProps = ToastInput & { id: string | number };

function HeadlessToast({
    id,
    title,
    description,
    variant = "default",
}: HeadlessToastProps) {
    return (
        <div className={cn(toastStyles({ variant }))}>
            {variant === "success" && (
                <CheckCircle2
                    aria-hidden
                    className="w-[22px] h-[22px] shrink-0 text-[#52C41A]"
                />
            )}
            {variant === "error" && (
                <CircleX
                    aria-hidden
                    className="w-[22px] h-[22px] shrink-0 text-[#B40C02]"
                />
            )}

            <div className="flex-1 min-w-0">
                <p className="text-sm font-normal truncate">{title}</p>
                {description ? (
                    <p
                        className={cn(
                            "mt-1 break-words text-[12px] leading-[1.2] font-normal",
                            variant === "success" && "text-[#155724]",
                            variant === "error" && "text-[#721c24]"
                        )}
                    >
                        {description}
                    </p>
                ) : null}
            </div>

            <button
                type="button"
                aria-label="Fechar"
                onClick={() => sonnerToast.dismiss(id)}
                className={cn(
                    "ml-3 inline-flex items-center justify-center rounded-md p-1",
                    variant === "success" &&
                        "hover:bg-[#155724]/10 focus-visible:ring-2 focus-visible:ring-[#155724]",
                    variant === "error" &&
                        "hover:bg-[#B40C02]/10 focus-visible:ring-2 focus-visible:ring-[#B40C02]"
                )}
            >
                <X
                    className={cn(
                        "size-4",
                        variant === "success" && "text-[#155724]",
                        variant === "error" && "text-[#B40C02]"
                    )}
                />
            </button>
        </div>
    );
}

export function toast({ title, description, variant = "default" }: ToastInput) {
    return sonnerToast.custom((id) => (
        <HeadlessToast
            id={id}
            title={title}
            description={description}
            variant={variant}
        />
    ));
}
