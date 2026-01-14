"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import ArrowLeft from "@/assets/icons/ArrowLeft";
import Link from "next/link";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
import User from "@/assets/icons/User";
import ArrowCircleDark from "@/assets/icons/ArrowCircleDark";
import HomeIcon from "@/assets/icons/Home";
  
interface PageHeaderProps {
    title: string;
    showBackButton?: boolean;
    onClickBack?: () => void;
    icon?: React.ReactNode;
    breadcrumbs?: { title: string; href?: string }[];
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    showBackButton = true,
    onClickBack,
    icon,
    breadcrumbs,
}) => {
   

    return (
        <div className="w-full pr-4">
            <Breadcrumb className="mb-8">
                <BreadcrumbList>
                

                    {breadcrumbs?.map((crumb, index) => (
                        
                        <React.Fragment key={`${crumb.title}-${index}`}>
                            {index === 0 && (
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/">
                                        <HomeIcon width={16} height={16} fill="#B40C02" />
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            )}  
                            <BreadcrumbItem>
                                {crumb.href ? (
                                    <BreadcrumbLink href={crumb.href}>
                                        {crumb.title}
                                    </BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                            {index < breadcrumbs.length - 1 && (
                                <BreadcrumbSeparator>
                                    <ArrowCircleDark width={16} height={16} fill="#B40C02" />
                                </BreadcrumbSeparator>
                            )}
                        </React.Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between w-full pr-4 mb-4">
                <div className="flex items-center gap-2">
                    {icon && (
                        <div className="w-6 h-6">
                            {icon}
                        </div>
                    )}
                    <h1 className="text-[#42474a] text-[20px] font-bold m-0">            
                        {title}
                    </h1>
                </div>
                {showBackButton && (
                    <Button asChild variant="customOutline" size="sm">
                        <Link href="/dashboard" onClick={onClickBack}>
                            <ArrowLeft />
                            &nbsp;Voltar
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
