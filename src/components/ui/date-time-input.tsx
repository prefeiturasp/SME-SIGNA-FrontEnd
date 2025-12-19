import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface DateTimeInputProps {
    dateValue?: string;
    timeValue?: string;
    onDateChange?: (value: string) => void;
    onTimeChange?: (value: string) => void;
    maxDate?: string;
    datePlaceholder?: string;
    timePlaceholder?: string;
    className?: string;
}

const DateTimeInput = React.forwardRef<HTMLDivElement, DateTimeInputProps>(
    (
        {
            dateValue,
            timeValue,
            onDateChange,
            onTimeChange,
            maxDate,
            datePlaceholder = "Selecione a data",
            timePlaceholder = "Digite o horário",
            className,
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex items-center gap-0 border border-input rounded-md overflow-hidden bg-background",
                    className
                )}
            >
                <div className="flex-1">
                    <Input
                        type="date"
                        placeholder={datePlaceholder}
                        value={dateValue}
                        onChange={(e) => onDateChange?.(e.target.value)}
                        max={maxDate}
                        className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 has-calendar"
                    />
                </div>
                <div className="flex-1">
                    <Input
                        type="time"
                        placeholder={timePlaceholder}
                        value={timeValue}
                        onChange={(e) => onTimeChange?.(e.target.value)}
                        className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 has-calendar"
                    />
                </div>
            </div>
        );
    }
);

DateTimeInput.displayName = "DateTimeInput";

export { DateTimeInput };
