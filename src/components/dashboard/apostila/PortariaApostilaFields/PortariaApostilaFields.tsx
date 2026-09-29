"use client";

import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { InputField } from "@/components/ui/FieldsForm";
 
interface Props {
  isLoading?: boolean;
}

const PortariaApostilaFields = ({ isLoading }: Props) => {
  const { register, control } = useFormContext();

  const inputFields = [
    
    {
      name: "apostila.numero_portaria",
      label: "Nº Portaria",
      placeholder: "Número Portaria",
      type: "number",
    },
    {
      name: "apostila.numero_sei",
      label: "Nº SEI",
      placeholder: "Número SEI",
      type: "string",
      mask: "9999.9999/9999999-9",
    },
    {
      name: "apostila.doc",
      label: "D.O",
      placeholder: "D.O",
      disabled: true,
    },
  ];



  return (
    <>
      {isLoading ? (
        <div className="flex justify-center h-full">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
      ) : (
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
      )}
    </>
  );
};

export default PortariaApostilaFields;