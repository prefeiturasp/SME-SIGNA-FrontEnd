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
import { Check, ChevronDown } from "lucide-react";

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
    "data-testid"?: string;
}

export function MultiSelect({
    options,
    value = [],
    onChange,
    placeholder = "Selecione...",
    disabled = false,
    className,
    "data-testid": dataTestId,
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
        .filter((opt): opt is Option => opt !== undefined);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    disabled={disabled}
                    data-testid={dataTestId}
                    className={cn(
                        "flex min-h-10 w-full items-start justify-between gap-2 rounded-lg border border-[#dadada] bg-background px-3 py-2 text-sm ring-offset-background",
                        "focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        disabled && "cursor-not-allowed opacity-50 disabled:bg-[#9CA3B9]",
                        !disabled && "cursor-pointer",
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1 w-full pointer-events-none">
                        {value.length === 0 ? (
                            <span className="text-muted-foreground text-[14px] text-[#313131] font-normal">
                                {placeholder}
                            </span>
                        ) : (
                            selectedOptions.map((opt) => (
                                <span
                                    key={opt.value}
                                    className="inline-flex items-center gap-1 bg-[#F1F5F9] border border-[#DADADA] text-[#313131] rounded px-2 py-1 text-xs"
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
                    <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                sideOffset={4}
                className="w-(--radix-popover-trigger-width) p-0 min-w-[200px]"
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
                                                ? "bg-[#B22B2A] border-[#B22B2A] text-white"
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
