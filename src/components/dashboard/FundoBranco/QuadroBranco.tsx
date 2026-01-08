import React from "react";
import { cn } from "@/lib/utils";

interface FundoBrancoProps {
    children: React.ReactNode;
    className?: string;
    props?: React.HTMLAttributes<HTMLDivElement>;
}

const FundoBranco: React.FC<FundoBrancoProps> = ({ children, className, props }) => {
    return (
        <div className={cn("bg-white rounded-[4px] shadow-[4px_4px_12px_0px_rgba(0,0,0,0.12)] p-[24px_32px] ", className)} {...props} >
            {children}
        </div>
    );
};

export default FundoBranco;
