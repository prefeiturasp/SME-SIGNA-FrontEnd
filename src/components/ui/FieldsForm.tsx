import { Button } from "@/components/ui/button";
import { InputBase } from "@/components/ui/input-base";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { FieldValues, UseFormRegister } from "react-hook-form";
import { FormControl, FormField, FormLabel, FormMessage } from "./form";
import { Control } from "react-hook-form";
import { FormItem } from "./form";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
interface PropsField {
    register: UseFormRegister<FieldValues>;
    control: Control<FieldValues>;
    name: string;
    label: string;
    placeholder?: string;
    dataTestId?: string;
    type?: string;
    disabled?: boolean;
}


export const CheckboxField = ({ register, control, name, label, dataTestId }: PropsField) => {
    return (
        <FormField
            {...register(name)}
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="required text-[#42474a] font-bold">
                        {label}
                    </FormLabel>
                    <FormControl>
                        <RadioGroup


                            value={field.value}
                            onValueChange={field.onChange}
                            defaultValue="sim"
                            className="w-fit "
                        >
                            <div className="flex items-center mt-4 gap-3">
                                <Field orientation="horizontal">
                                    <RadioGroupItem
                                        value="sim"
                                        id={dataTestId + "-sim"}
                                        aria-label={dataTestId + "-sim"}
                                    />
                                    <Label htmlFor="doc-sim">Sim</Label>
                                </Field>

                                <Field orientation="horizontal">
                                    <RadioGroupItem
                                        value="nao"
                                        id={dataTestId + "-nao"}
                                        aria-label={dataTestId + "-nao"}
                                    />
                                    <Label htmlFor="doc-nao">Não</Label>
                                </Field>
                            </div>
                        </RadioGroup>
                    </FormControl>
                </FormItem>
            )}
        ></FormField>

    );
};
export const InputField = ({ register, control, name, label, placeholder, dataTestId, type = "text", disabled = false }: { register: UseFormRegister<FieldValues>; control: Control<FieldValues>; name: string; label: string; placeholder?: string; dataTestId?: string; type?: string; disabled?: boolean }) => {
    return (
        <FormField
            {...register(name)}
            control={control}
            name={name}

            render={({ field }) => (
                <FormItem >
                    <FormLabel className="required text-[#42474a] font-bold">
                        {label}
                    </FormLabel>
                    <FormControl >
                        <InputBase
                            type={type}
                            placeholder={placeholder}
                            value={field.value}
                            onChange={(value) => {
                                field.onChange(value.target.value);
                            }}
                            data-testid={dataTestId}
                            disabled={disabled}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};



export const DateField = ({ register, control, name, label }: PropsField) => {
    return (
        <FormField
            {...register(name)}
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel className="required text-[#42474a] font-bold">
                        {label}
                    </FormLabel>

                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="customOutline"
                                    className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground",
                                    )}
                                >
                                    {field.value ? (
                                        format(field.value, "dd/MM/yyyy")
                                    ) : (
                                        <span>Selecione uma data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                            />
                        </PopoverContent>
                    </Popover>

                    <FormMessage />
                </FormItem>
            )}
        />
    );
};