import React from "react";

interface QuadroBrancoProps {
    children: React.ReactNode;
}

const QuadroBranco: React.FC<QuadroBrancoProps> = ({ children }) => {
    return (
        <div className="bg-white rounded-[4px] shadow-[4px_4px_12px_0px_rgba(0,0,0,0.12)] p-[24px_32px] flex flex-col gap-6 m-4">
            {children}
        </div>
    );
};

export default QuadroBranco;
