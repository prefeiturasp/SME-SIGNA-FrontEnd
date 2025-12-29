"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import ArrowLeft from "@/assets/icons/ArrowLeft";
import Link from "next/link";

interface PageHeaderProps {
    title: string;
    showBackButton?: boolean;
    onClickBack?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    showBackButton = true,
    onClickBack,
}) => {
    return (
        <div className="flex items-center justify-between w-full px-4">
            <h1 className="text-[#42474a] text-[24px] font-bold m-0">
                {title}
            </h1>
            {showBackButton && (
                <Button asChild variant="customOutline" size="sm">
                    <Link href="/dashboard" onClick={onClickBack}>
                        <ArrowLeft />
                        &nbsp;Voltar
                    </Link>
                </Button>
            )}
        </div>
    );
};

export default PageHeader;
