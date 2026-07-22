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
import ArrowCircleDark from "@/assets/icons/ArrowCircleDark";
import HomeIcon from "@/assets/icons/Home";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
    title: React.ReactNode;
    showBackButton?: boolean;
    icon?: React.ReactNode;
    breadcrumbs?: { title: string; href?: string; onClick?: React.MouseEventHandler<HTMLAnchorElement> }[];
    createButton?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    showBackButton = false,
    icon,
    breadcrumbs,
    createButton,
}) => {
    const router = useRouter();


    return (
        <div className="w-full ">
            <div className="flex justify-between items-center">


                <Breadcrumb className="mb-8">
                    <BreadcrumbList>


                        {breadcrumbs?.map((crumb, index) => (

                            <React.Fragment key={`${crumb.title}-${index}`}>
                                {index === 0 && (
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href="/">
                                            <HomeIcon width={16} height={16} fill="#660C0B" />
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                )}
                                <BreadcrumbItem>
                                    {crumb.href || crumb.onClick ? (
                                        <BreadcrumbLink href={crumb.href ?? "#"} onClick={crumb.onClick}>
                                            {crumb.title}
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                                {index < breadcrumbs.length - 1 && (
                                    <BreadcrumbSeparator>
                                        <ArrowCircleDark width={16} height={16} fill="#660C0B" />
                                    </BreadcrumbSeparator>
                                )}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>


            </div>
            <div className="flex items-center justify-between w-full mb-4">
                <div className="flex items-center gap-2 mb-2">
                    {icon && (
                        <div className="w-6 h-6 ">
                            {icon}
                        </div>
                    )}
                    <h1 className="text-[#313131] text-[20px] font-bold m-0">
                        {title}
                    </h1>
                </div>

                <div className="flex gap-2">

                    {showBackButton && (
                        <Button
                            size="lg"
                            type="button"
                            variant="default"
                            className="gap-2"
                            data-testid="btn-voltar"
                            onClick={() => router.back()}
                        >
                            <span className="font-bold">Voltar</span>
                            <ArrowLeft width={24} height={24} />
                        </Button>
                    )}

                    {createButton && (
                        <>
                            {createButton}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
