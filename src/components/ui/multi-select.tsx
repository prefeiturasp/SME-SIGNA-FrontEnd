import * as React from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
    CommandEmpty,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Option {
    label: string;
    value: string;
}

interface MultiSelectProps {
    options: Option[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function MultiSelect({
    options,
    value = [],
    onChange,
    placeholder = "Selecione...",
    disabled = false,
    className,
}: Readonly<MultiSelectProps>) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (optionValue: string) => {
        const newValue = value.includes(optionValue)
            ? value.filter((v) => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    const handleRemove = (
        optionValue: string,
        e: React.MouseEvent | React.KeyboardEvent
    ) => {
        e.stopPropagation();
        const newValue = value.filter((v) => v !== optionValue);
        onChange(newValue);
    };

    const selectedOptions = value
        .map((val) => options.find((opt) => opt.value === val))
        .filter(Boolean) as Option[];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    disabled={disabled}
                    className={cn(
                        "flex w-full min-h-[40px] items-start rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        disabled && "cursor-not-allowed opacity-50",
                        !disabled && "cursor-pointer",
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1 w-full pointer-events-none">
                        {value.length === 0 ? (
                            <span className="text-muted-foreground text-[14px] text-[#42474A] font-[400]">
                                {placeholder}
                            </span>
                        ) : (
                            selectedOptions.map((opt) => (
                                <span
                                    key={opt.value}
                                    className="inline-flex items-center gap-1 bg-[#FFFFFF] border border-[#DADADA] text-[#42474A] rounded px-2 py-1 text-xs"
                                >
                                    {opt.label}
                                    <input
                                        type="button"
                                        value="×"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!disabled) {
                                                handleRemove(opt.value, e);
                                            }
                                        }}
                                        className="hover:bg-[#F5F5F5] rounded-full w-4 h-4 text-center leading-none border-0 bg-transparent cursor-pointer pointer-events-auto transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label={`Remover ${opt.label}`}
                                        disabled={disabled}
                                    />
                                </span>
                            ))
                        )}
                    </div>
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                sideOffset={4}
                className="w-[var(--radix-popover-trigger-width)] p-0 min-w-[200px]"
            >
                <Command>
                    <CommandInput placeholder="Buscar..." />
                    <CommandList>
                        <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
                        {options.map((opt) => {
                            const isSelected = value.includes(opt.value);
                            return (
                                <CommandItem
                                    key={opt.value}
                                    value={opt.label}
                                    onSelect={() => handleSelect(opt.value)}
                                    className={cn(
                                        "cursor-pointer flex items-center gap-2"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex h-4 w-4 items-center justify-center rounded-sm border border-[#dadada]",
                                            isSelected
                                                ? "bg-[#717FC7] border-[#717FC7] text-white"
                                                : "bg-white"
                                        )}
                                    >
                                        {isSelected && (
                                            <Check className="h-3 w-3" />
                                        )}
                                    </div>
                                    <span>{opt.label}</span>
                                </CommandItem>
                            );
                        })}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
