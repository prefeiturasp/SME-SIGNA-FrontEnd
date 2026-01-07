import React from "react";

interface FundoBrancoProps {
    children: React.ReactNode;
}

const FundoBranco: React.FC<FundoBrancoProps> = ({ children }) => {
    return (
        <div className="bg-white rounded-[4px] shadow-[4px_4px_12px_0px_rgba(0,0,0,0.12)] p-[24px_32px] ">
            {children}
        </div>
    );
};

export default FundoBranco;
