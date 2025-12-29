"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmCancelButtonsProps {
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
  loading?: boolean;

}

export const ConfirmCancelButtons: React.FC<ConfirmCancelButtonsProps> = ({
  onConfirm,
  onCancel,
  disabled = false,
  loading = false,

}) => {
  return (
    <div className="flex items-center gap-2 px-[0.22rem]">
      <Button
        type="button"
        variant="outline"
        className="rounded-[4px] border-[#B40C31] text-[#B40C31] hover:bg-[#B40C31]/10"
        onClick={onCancel}
        aria-label="Cancelar"
        data-testid="input-cancelar-confirmcancelbuttons"
        disabled={loading}
      >
        <X className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="outline"
        className={`
          rounded-[4px] 
          ${disabled 
            ? "border-[#b0b0b0] text-[#b0b0b0] cursor-not-allowed bg-transparent" 
            : "border-[#297805] text-[#297805] hover:bg-[#297805]/10"}
        `}
        disabled={disabled}
        onClick={onConfirm}
        aria-label="Confirmar"
        data-testid="input-confirmar-confirmcancelbuttons"
        loading={loading}

      >
        <Check className="w-4 h-4" />
      </Button>
    </div>
  );
};
