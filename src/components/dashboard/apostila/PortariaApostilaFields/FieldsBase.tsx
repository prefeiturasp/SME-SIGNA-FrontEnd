"use client";

import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { InputField } from "@/components/ui/FieldsForm";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export interface InputFieldType {
  name: string;
  label: string;
  placeholder: string;
  type: string;
  disabled: boolean;
  mask?: string;
  maxLength?: number;
}

export interface TextareaFieldType {
  name: string;
  label: string;
  placeholder: string;
}
interface Props {
  isLoading?: boolean;
  inputFields: InputFieldType[];
  textareaFields: TextareaFieldType[];
}

const FieldsBase = ({ isLoading, inputFields, textareaFields }: Props) => {
  const { register, control } = useFormContext();


  return (
    <>
      {isLoading ? (
        <div className="flex justify-center h-full">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {inputFields.map((field) =>
                <InputField
                  key={field.name}
                  register={register}
                  control={control}
                  name={field.name}
                  label={field.label}
                  placeholder={field.placeholder}
                  type={field.type}
                  disabled={field.disabled}
                  mask={field.mask}
                />
            )}
          </div>

          {textareaFields.map((item) => (
            <div className="w-full pt-4" key={item.name}>
              <FormField
                control={control}
                name={item.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required text-[#313131] font-bold">
                      {item.label}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder={item.placeholder}
                        data-testid={`input-${item.name}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default FieldsBase;