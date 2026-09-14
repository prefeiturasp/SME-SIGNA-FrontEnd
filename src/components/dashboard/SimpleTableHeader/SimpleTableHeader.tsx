import React from "react";

interface SimpleTableHeaderProps {
    title: string;
    subtitle: string;
}

export const SimpleTableHeader: React.FC<SimpleTableHeaderProps> = ({ title, subtitle }) => {
    return (
        <div className="pb-8">
            <p className="text-[20px] font-bold pt-1 pb-1">{title}</p>
            <p className="text-[14px] font-normal pt-1 ">{subtitle}</p>
        </div>
    );
};

interface SimpleHeaderWithBorderProps {
    title: string;
    subtitle: string;
    buttonRight?: React.ReactNode;
}


export const SimpleHeaderWithBorder = ({ title, subtitle, buttonRight }: SimpleHeaderWithBorderProps) => {
    return (
        <div className="p-4 flex column justify-between items-center bg-[#F1F5F9]  rounded-lg">
            <div>
                <p className="text-[20px] font-bold pt-1 pb-1">{title}</p>
                <p className="text-[14px] font-normal pt-1 ">{subtitle}</p>
            </div>
            <div>
                {buttonRight && <div className="flex justify-end">{buttonRight}</div>}
            </div>
        </div>
    );
};


export default SimpleTableHeader;

