"use client";

import React from "react";
import User from "@/assets/icons/User";
import { useUserStore } from "@/stores/useUserStore";

const QuadroUsuario: React.FC = () => {
    const user = useUserStore((state) => state.user);
    return (
        <div className="flex flex-col items-center justify-center bg-[#E8F0FE] rounded-[4px] p-6 h-full">
            <User width={48} height={48} fill="#717FC7" />
            <span className="mt-4 text-[24px] font-bold text-[#42474A] text-center">
                {user?.name}
            </span>
            <span className="mt-2 text-[14px] text-[#42474A] text-center">
                CPF: {user?.cpf}
            </span>
            <span className="text-[14px] text-[#42474A] text-center">
                RF: {user?.username}
            </span>
        </div>
    );
};

export default QuadroUsuario;
