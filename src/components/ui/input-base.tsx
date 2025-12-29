import * as React from "react";
import { cn, numberToBRL } from "@/lib/utils";
import BaseInputMask from "@mona-health/react-input-mask";

// Tipagem genérica e compatível com qualquer versão da lib
type BaseInputMaskProps = React.ComponentProps<typeof BaseInputMask>;

export interface InputBaseProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputBase = React.forwardRef<HTMLInputElement, InputBaseProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full border border-[#dadada] bg-background px-3 py-2 text-sm font-medium ring-0 ring-offset-0 shadow-none outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none focus:bg-[#E8F0FE] focus:border-[#ced4da] disabled:cursor-not-allowed rounded-[4px]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
InputBase.displayName = "InputBase";

export interface InputBaseMaskProps extends InputBaseProps {
  maskProps: BaseInputMaskProps;
}

const InputBaseMask = React.forwardRef<HTMLInputElement, InputBaseMaskProps>(
  ({ maskProps, ...props }, ref) => {
    return (
      <BaseInputMask {...maskProps} {...props} maskPlaceholder={null} ref={ref}>
        <InputBase />
      </BaseInputMask>
    );
  }
);
InputBaseMask.displayName = "InputBaseMask";

export interface CurrencyInputBaseProps extends InputBaseProps {}

const CurrencyInputBase = React.forwardRef<HTMLInputElement, CurrencyInputBaseProps>(
  ({ onChange, ...props }, ref) => {
    return (
      <InputBase
        {...props}
        onChange={(e) => {
          const cleanedValue = Number(e.target.value.replace(/\D/g, ""));
          const valueCents = Number(cleanedValue) / 100;
          e.target.value = numberToBRL(valueCents);
          onChange && onChange(e);
        }}
        ref={ref}
      />
    );
  }
);
CurrencyInputBase.displayName = "CurrencyInputBase";

const DocumentInputBase = React.forwardRef<HTMLInputElement, CurrencyInputBaseProps>(
  ({ onChange, ...props }, ref) => {
    return (
      <InputBase
        {...props}
        onChange={(e) => {
          const input = e.target as HTMLInputElement;
          const cleanedValue = input.value.replace(/\D/g, "");
          if (cleanedValue.length <= 11) {
            input.value = cleanedValue
              .replace(/(\d{3})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d{1,2})/, "$1-$2");
          } else {
            input.value = cleanedValue
              .replace(/(\d{2})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d)/, "$1/$2")
              .replace(/(\d{4})(\d)/, "$1-$2")
              .replace(/(-\d{2})\d+/, "$1");
          }
          onChange && onChange(e);
        }}
        ref={ref}
      />
    );
  }
);
DocumentInputBase.displayName = "DocumentInputBase";

const PhoneInputBase = React.forwardRef<HTMLInputElement, CurrencyInputBaseProps>(
  ({ onChange, ...props }, ref) => {
    return (
      <InputBase
        {...props}
        onChange={(e) => {
          const input = e.target as HTMLInputElement;
          const cleanedValue = input.value.replace(/\D/g, "");
          if (cleanedValue.length <= 10) {
            input.value = cleanedValue
              .replace(/(\d{2})(\d)/, "($1) $2")
              .replace(/(\d{4})(\d)/, "$1-$2");
          } else {
            input.value = cleanedValue
              .replace(/(\d{2})(\d)/, "($1) $2")
              .replace(/(\d{5})(\d)/, "$1-$2")
              .replace(/(-\d{4})\d+/, "$1");
          }
          onChange && onChange(e);
        }}
        ref={ref}
      />
    );
  }
);
PhoneInputBase.displayName = "PhoneInputBase";

export {
  InputBase,
  InputBaseMask,
  CurrencyInputBase,
  DocumentInputBase,
  PhoneInputBase,
};
