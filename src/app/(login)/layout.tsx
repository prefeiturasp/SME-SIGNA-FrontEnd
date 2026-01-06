import Banner from "@/components/login/Banner";
import React from "react";

interface AuthLayoutProps {
    readonly children: React.ReactNode;
}

export default function LoginLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex flex-col md:flex-row w-full min-h-screen overflow-x-hidden">
            <div className="w-full md:w-1/2 flex-shrink-0">
                <Banner />
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col bg-white overflow-y-auto justify-center">
                <div className="w-full flex flex-col items-center flex-shrink-0 px-4 py-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
