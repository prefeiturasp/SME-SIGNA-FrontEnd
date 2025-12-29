import { useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import OpenEye from "@/assets/icons/OpenEye";
import CloseEye from "@/assets/icons/CloseEye";
import { cn } from "@/lib/utils";

export type InputSenhaComToggleProps = {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    name?: string;
    className?: string;
    disabled?: boolean;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    ref?: React.Ref<HTMLInputElement>;
    type?: string;
};

const InputSenhaComToggle = forwardRef<
    HTMLInputElement,
    InputSenhaComToggleProps
>(
    (
        {
            value,
            onChange,
            placeholder,
            name,
            className,
            disabled,
            onBlur,
            onFocus,
            ...rest
        },
        ref
    ) => {
        const [show, setShow] = useState(false);
        return (
            <div className="relative">
                <Input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    name={name}
                    className={cn("font-normal pr-10", className)}
                    disabled={disabled}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    ref={ref}
                    {...rest}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#717FC7]"
                    onClick={() => setShow((v) => !v)}
                >
                    {show ? <CloseEye /> : <OpenEye />}
                </button>
            </div>
        );
    }
);

InputSenhaComToggle.displayName = "InputSenhaComToggle";

export default InputSenhaComToggle;
