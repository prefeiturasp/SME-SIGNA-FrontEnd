import React from "react";

interface InfoItemProps {
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
  className?: string;
}

export const InfoItem: React.FC<InfoItemProps> = ({
  label,
  value,
  icon,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-row items-center gap-2">
        <p className="text-[14px] font-bold">{label}</p>
        {icon && <div className="w-6 h-6">{icon}</div>}
      </div>

      <p className="text-[14px] text-[#6F6C8F]">
        {value ?? "-"}
      </p>
    </div>
  );
};