"use client";

import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { InputField } from "@/components/ui/FieldsForm";
import { SelectAnoField } from "@/components/ui/SelectAnoField";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  isLoading?: boolean;
}

const PortariaApostilaFields = ({ isLoading }: Props) => {
  const { register, control } = useFormContext();

  const inputFields = [
    {
      name: "apostila.numero_sei",
      label: "Nº SEI",
      placeholder: "Número SEI",
      type: "string",
    },
    {
      name: "apostila.doc",
      label: "D.O",
      placeholder: "D.O",
      disabled: true,
    },
  ];

  const textareaFields = [
    {
      name: "apostila.observacoes",
      label: "Observações",
      placeholder: "Texto",
    },
  ];

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
                    <FormLabel className="required text-[#42474a] font-bold">
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

export default PortariaApostilaFields;