"use client";

import React from "react";

interface ErrorMessageProps {
    readonly message: string | null;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
    if (!message) return null;

    return (
        <div className="flex items-center justify-center border border-[#B40C31] text-[#B40C31] text-[14px] font-bold rounded h-8 px-3 my-6 w-full mx-auto break-words">
            {message}
        </div>
    );
}
