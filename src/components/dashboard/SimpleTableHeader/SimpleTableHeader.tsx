import React from "react";

interface SimpleTableHeaderProps {
    title: string;
    subtitle: string;
}

const SimpleTableHeader: React.FC<SimpleTableHeaderProps> = ({ title, subtitle }) => {
    return (
        <div className="pb-8">
            <p className="text-[20px] font-bold pt-1 pb-1">{title}</p>
            <p className="text-[14px] font-normal pt-1 ">{subtitle}</p>
        </div>
    );
};

export default SimpleTableHeader;

