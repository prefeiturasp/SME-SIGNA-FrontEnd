import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
    "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
    {
        variants: {
            variant: {
                default: "bg-background text-foreground",
                destructive:
                    "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
                aviso: "bg-[#F5F5F5] text-[#42474a] border-none",
                error: "bg-[rgba(180,12,49,0.1)] text-[#42474a] border-none",
            },
        },
        defaultVariants: {
            variant: "aviso",
        },
    }
);

const Alert = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
    />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn(
            "mb-1 font-medium leading-none tracking-tight",
            className
        )}
        {...props}
    />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
    const mergedClassName = cn("text-sm [&_p]:leading-relaxed mt-1", className);
    if (typeof children === "string") {
        // Quebra o texto por <br /> ou <br>
        const parts = children.split(/<br\s*\/?>/i);
        return (
            <div ref={ref} className={mergedClassName} {...props}>
                {parts.map((part, idx) => (
                    <React.Fragment key={idx}>
                        {idx > 0 && <div style={{ height: 16 }} />}
                        <span>{part}</span>
                    </React.Fragment>
                ))}
            </div>
        );
    }
    return (
        <div ref={ref} className={mergedClassName} {...props}>
            {children}
        </div>
    );
});
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
