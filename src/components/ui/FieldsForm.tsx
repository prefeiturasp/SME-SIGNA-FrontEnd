import { Button } from "@/components/ui/button";
import { InputBaseMask } from "@/components/ui/input-base";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { FieldValues, UseFormRegister, Control, FieldPath } from "react-hook-form";
import type { ReactNode } from "react";
import { FormControl, FormField, FormLabel, FormMessage, FormItem, FormDescription } from "./form";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { format, isValid } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatePicker, Switch } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const isDate = (value: unknown): value is Date => value instanceof Date;

interface PropsField<TFieldValues extends FieldValues = FieldValues> {
    register: UseFormRegister<TFieldValues>;
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string | ReactNode;
    placeholder?: string;
    dataTestId?: string;
    type?: string;
    disabled?: boolean;
    allowClear?: boolean;
    showBlankSpace?: boolean;
    description?: string | ReactNode;
}

interface FieldSecondary {
    label: string; subtitle: string; value: string;
}

interface PropsSelectDRE  {
    isLoading: boolean;
    dreOptions: {
        codigoDRE: string;
        nomeDRE: string;
        siglaDRE: string;
    }[];
    onValueChange: (value: string) => void;
}
interface PropsFieldSecondary  {
    fields: FieldSecondary[];
}


export const CheckboxFieldSecondary = <TFieldValues extends FieldValues = FieldValues,>({ register, control, name, showBlankSpace, fields }: PropsField<TFieldValues> & PropsFieldSecondary) => {
    return (
        <FormField
            {...register(name)}
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>

                    <FormControl>
                        <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}

                            className="w-fit "
                        >
                            <div className="flex flex-col  mt-4 gap-3">
                                {fields.map((field) => (
                                    <Field orientation="horizontal" key={field.value} className="flex items-start">
                                        <RadioGroupItem
                                            value={field.value}
                                            id={field.value}
                                            aria-label={field.value}
                                        />
                                        <div className="flex flex-col items-start ">
                                            <p className=" text-[#313131]">
                                                {field.label}
                                            </p>
                                            <p className="text-[12px] text-[#9CA3B9]">
                                                {field.subtitle}
                                            </p>
                                        </div>
                                    </Field>
                                ))}
                            </div>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage showBlankSpace={showBlankSpace} />
                </FormItem>
            )}
        ></FormField>

    );
};



export const CampoSelectDRE = <TFieldValues extends FieldValues = FieldValues,>({ register, control, name, isLoading,dreOptions, onValueChange }: Omit<PropsField<TFieldValues>, "label"> & PropsSelectDRE) => {
    return (
      <FormField
      {...register(name)}
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem >
          <FormLabel className="required text-[#313131] font-bold">
            DRE
          </FormLabel>
          <FormControl>
          {isLoading ? (
            <div className="flex h-10 items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-primary " />
            </div>
          ) : (
            <Select
              key={field.value}
              value={field.value}
              onValueChange={(value) => {    
                field.onChange(value);          
                onValueChange(value);
              }}
            >
                <SelectTrigger data-testid="select-dre">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
              <SelectContent>
                {dreOptions.map(
                  (dre: {
                    codigoDRE: string;
                    nomeDRE: string;
                    siglaDRE: string;
                  }) => (
                    <SelectItem
                      key={dre.siglaDRE}
                      value={dre.codigoDRE}
                    >
                      {dre.nomeDRE}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>   
            )}
            </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    );
  };
  
  

export const CheckboxField = <TFieldValues extends FieldValues = FieldValues,>({ register, control, name, label, dataTestId, showBlankSpace }: PropsField<TFieldValues>) => {
    return (
        <FormField
            {...register(name)}
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="required text-[#313131] font-bold">
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
                    <FormMessage showBlankSpace={showBlankSpace} />
                </FormItem>
            )}
        ></FormField>

    );
};
export const InputField = <TFieldValues extends FieldValues = FieldValues,>({
     register, control, name, label, placeholder, dataTestId, type = "text",
      disabled = false, mask, maxLength, showBlankSpace = true }: 
      { register: UseFormRegister<TFieldValues>; control: Control<TFieldValues>; name: FieldPath<TFieldValues>; label: string | ReactNode; placeholder?: string; dataTestId?: string; type?: string; disabled?: boolean; mask?: string; maxLength?: number; showBlankSpace?: boolean }) => {
    return (
        <FormField
            {...register(name)}
            control={control}
            name={name}

            render={({ field, fieldState }) => (
                <FormItem >
                    <FormLabel className="required text-[#313131] font-bold">
                        {label}
                    </FormLabel>
                    <FormControl >
                        <InputBaseMask
                            mask={mask}
                            type={type}
                            placeholder={placeholder}
                            value={field.value}
                            onChange={(value) => {
                                field.onChange(value.target.value);
                            }}
                            data-testid={dataTestId}
                            disabled={disabled}
                            maxLength={maxLength}
                            className={cn(fieldState?.error && "!border-destructive")}
                        />
                    </FormControl>
                    <FormMessage showBlankSpace={showBlankSpace} />
                </FormItem>
            )}
        />
    );
};

interface SelectOption {
    value: string;
    label: string;
}

export const SelectField = <TFieldValues extends FieldValues = FieldValues,>({
    control,
    name,
    label,
    placeholder,
    dataTestId,
    options,
    disabled = false,
    register,
    showBlankSpace = true,
}: {
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string | ReactNode;
    placeholder?: string;
    dataTestId?: string;
    options: SelectOption[];
    disabled?: boolean;
    register: UseFormRegister<TFieldValues>;
    showBlankSpace?: boolean;
}) => {
    return (
        <FormField
            {...register(name)}
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <FormItem>
                    <FormLabel className="text-[#313131] font-bold">{label}</FormLabel>
                    <FormControl>
                        <Select
                            value={field.value}
                            onValueChange={(value) => field.onChange(value)}
                            disabled={disabled}
                        >
                            <SelectTrigger
                                data-testid={dataTestId}
                                className={cn(fieldState?.error && "!border-destructive")}
                            >
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                                {options.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage showBlankSpace={showBlankSpace} />
                </FormItem>
            )}
        />
    );
};

export const MultiSelectField = ({
    control,
    name,
    label,
    placeholder,
    dataTestId,
    options,
    disabled = false,
    register,
    showBlankSpace = true,
}: {
    control: Control<FieldValues>;
    name: string;
    label: string | ReactNode;
    placeholder?: string;
    dataTestId?: string;
    options: SelectOption[];
    disabled?: boolean;
    register: UseFormRegister<FieldValues>;
    showBlankSpace?: boolean;
}) => {
    return (
        <FormField
            {...register(name)}
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <FormItem>
                    <FormLabel className="text-[#313131] font-bold">{label}</FormLabel>
                    <FormControl>
                        <MultiSelect
                            value={Array.isArray(field.value) ? field.value : []}
                            onChange={field.onChange}
                            options={options}
                            placeholder={placeholder}
                            disabled={disabled}
                            data-testid={dataTestId}
                            className={cn(fieldState?.error && "!border-destructive")}
                        />
                    </FormControl>
                    <FormMessage showBlankSpace={showBlankSpace} />
                </FormItem>
            )}
        />
    );
};



export const DateField = <TFieldValues extends FieldValues = FieldValues,>({ register, control, name, label, placeholder, allowClear = true, showBlankSpace = true }: PropsField<TFieldValues>) => {
    return (
        <FormField
            {...register(name)}
            control={control}
            name={name}
            render={({ field }) => {
                const value =
                    isDate(field.value) && isValid(field.value)
                        ? dayjs(field.value)
                        : null;

                return (
                    <FormItem className="flex flex-col">
                        <FormLabel className="required text-[#313131] font-bold">
                            {label}
                        </FormLabel>

                        <FormControl>
                            <DatePicker
                                allowClear={allowClear}
                                format="DD/MM/YYYY"
                                size="large"
                                value={value}
                                placeholder={placeholder ?? "Selecione a data"}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }
                                }}
                                onChange={(date) => {
                                    field.onChange(date ? date.toDate() : null);
                                }}
                                onBlur={field.onBlur}
                                style={{ width: "100%" }}
                            />
                        </FormControl>

                        <FormMessage showBlankSpace={showBlankSpace} />
                    </FormItem>
                );
            }}
        />
    );
};

export const DateRangeField = <TFieldValues extends FieldValues = FieldValues,>({ register, control, name, label, placeholder, showBlankSpace = true }: PropsField<TFieldValues>) => {
    return (
        <FormField
            {...register(name)}
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel className="required text-[#313131] font-bold">
                        {label}
                    </FormLabel>

                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="customOutline"
                                    size="lg"
                                    className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value?.from && "text-muted-foreground",
                                    )}
                                >
                                    {field.value?.from ? (
                                        field.value.to ? (
                                            <>
                                                {format(field.value.from, "dd/MM/yyyy")} -{" "}
                                                {format(field.value.to, "dd/MM/yyyy")}
                                            </>
                                        ) : (
                                            format(field.value.from, "dd/MM/yyyy")
                                        )
                                    ) : (
                                        <span>{placeholder ?? "Selecione um período"}</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                selected={field.value}
                                onSelect={field.onChange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>

                    <FormMessage showBlankSpace={showBlankSpace} />
                </FormItem>
            )}
        />
    );
};

export const DateRangePickerField = <TFieldValues extends FieldValues = FieldValues,>({ register, control, name, label, placeholder, allowClear = true, showBlankSpace = true }: PropsField<TFieldValues>) => {
    return (
        <FormField
            {...register(name)}
            control={control}
            name={name}
            render={({ field }) => {
                const value: [Dayjs | null, Dayjs | null] | null =
                    isDate(field.value?.from) && isValid(field.value?.from)
                        ? [
                            dayjs(field.value.from),
                            isDate(field.value?.to) && isValid(field.value?.to)
                                ? dayjs(field.value.to)
                                : null,
                        ]
                        : null;

                return (
                    <FormItem className="flex flex-col">
                        <FormLabel className="required text-[#313131] font-bold">
                            {label}
                        </FormLabel>

                        <FormControl>
                            <DatePicker.RangePicker
                                allowClear={allowClear}
                                format="DD/MM/YYYY"
                                size="large"
                                value={value}
                                placeholder={[
                                    placeholder ?? "Data inicial",
                                    placeholder ?? "Data final",
                                ]}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }
                                }}
                                onChange={(dates) => {
                                    field.onChange(
                                        dates
                                            ? {
                                                from: dates[0]?.toDate(),
                                                to: dates[1]?.toDate(),
                                            }
                                            : null,
                                    );
                                }}
                                onBlur={field.onBlur}
                                style={{ width: "100%" }}
                            />
                        </FormControl>

                        <FormMessage showBlankSpace={showBlankSpace} />
                    </FormItem>
                );
            }}
        />
    );
};



export const SwitchField = <TFieldValues extends FieldValues = FieldValues,>({
    register,
    control,
    name,
    label,
    dataTestId,
    disabled = false,
    showBlankSpace = true,
    description
}: PropsField<TFieldValues>) => {
    return (
        <FormField
            {...register(name)}
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <div className="flex items-center justify-between">
                        <div>
                            <FormLabel className="text-[#313131] font-bold">
                                {label}
                            </FormLabel>
                            <p className="text-sm max-w-[511px]">
                                {description}
                            </p>
                        </div>

                        <FormControl className="min-w-[22px]">
                            <Switch
                                checked={!!field.value}
                                onChange={(checked) => field.onChange(checked)}
                                disabled={disabled}
                                data-testid={dataTestId}
                                checkedChildren="Sim" unCheckedChildren="Não"
                            />
                        </FormControl>
                    </div>

                    <FormMessage showBlankSpace={showBlankSpace} />
                </FormItem>
            )}
        />
    );
};