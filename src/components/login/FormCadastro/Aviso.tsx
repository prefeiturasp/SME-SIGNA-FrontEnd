import { ReactNode } from "react";

interface AvisoProps {
    children: ReactNode;
    icon?: ReactNode;
}

export default function Aviso({ children, icon }: Readonly<AvisoProps>) {
    return (
        <div className="flex items-start gap-2 p-4 rounded-md bg-[#F5F5F5] text-[#42474a]">
            {icon && <>{icon}</>}
            <span
                className="text-[14px] font-normal"
                style={{ lineHeight: 1.2 }}
            >
                {children}
            </span>
        </div>
    );
}
