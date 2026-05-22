"use client";

import React, { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
 import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchButtonProps {
    className?: string;
    type: ButtonHTMLAttributes<HTMLButtonElement>["type"];
    isLoading: boolean;
    disabled: boolean;
    onClick: () => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({
    className,
    type,
    isLoading,
    disabled,
    onClick,
}) => {


    return (
        <div className={cn("w-[160px]", className)}>
            <Button
                type={type}
                size="lg"
                className="w-full flex items-center justify-center gap-6"
                variant="outline"
                disabled={disabled}
                onClick={onClick}
                data-testid="botao-pesquisar-servidor"
            >
                <div className="flex items-center gap-2">
                    <span className="text-[16px] font-bold">
                        {isLoading ? "Pesquisando..." : "Pesquisar"}
                    </span>
                    {isLoading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <Search size={20} />
                    )}
                </div>
            </Button>
        </div>
    );
};

export default SearchButton;
