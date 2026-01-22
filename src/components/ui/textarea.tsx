import * as React from "react";

import { cn } from "@/lib/utils";
import { useFormField } from "./form";

const Textarea = React.forwardRef<
    HTMLTextAreaElement,
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
    const { error } = useFormField();

    return (
        <textarea
            className={cn(
                "flex min-h-[80px] w-full border border-[#dadada] bg-background px-3 py-2 text-sm font-medium ring-0 ring-offset-0 shadow-none outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none focus:bg-[#E8F0FE] focus:border-[#ced4da] disabled:cursor-not-allowed rounded-[4px] resize-none",
                error && "!border-destructive",
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Textarea.displayName = "Textarea";

export { Textarea };
