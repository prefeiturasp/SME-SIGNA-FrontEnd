"use client";

import { useFormContext } from "react-hook-form";

import { Loader2 } from "lucide-react";

import {
 
  InputField,
} from "@/components/ui/FieldsForm";

import {SelectAnoField} from "@/components/ui/SelectAnoField"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  isLoading?: boolean;
}

const PortariaInsubsistenciaFields = ({ isLoading }: Props) => {
  const { register, control } = useFormContext();

  const inputFields = [
    {
      name: "insubsistencia.numero_portaria",
      label: "Portaria de insubsistência",
      placeholder: "Nº da portaria",
      type: "number",
    },
    
    {
      name: "insubsistencia.ano",
      label: "Ano Vigente",
      placeholder: "Ano Vigente",
      type: "date",
    },
    {
      name: "insubsistencia.numero_sei",
      label: "Nº SEI",
      placeholder: "Número SEI",
      type: "string",
      mask: "9999.9999/9999999-9",
    },
    {
      name: "insubsistencia.doc",
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
        <>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {inputFields.map((field) => (
                field.name === "insubsistencia.ano" ? (                  
                    <SelectAnoField name="insubsistencia.ano" key={field.name} label="Ano Vigente" />                
                  ) : (
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
                )               
              ))}              
          </div>          
           <div className="w-full pt-4">
                <FormField
                  {...register("insubsistencia.observacoes")}
                  control={control}
                  name="insubsistencia.observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="required text-[#42474a] font-bold">
                      Observações
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Texto"
                          value={field.value}
                          onChange={(value) =>
                            field.onChange(value.target.value)
                          }
                          data-testid="input-observacoes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                  
        </>
      )}
    </>
  );
};

export default PortariaInsubsistenciaFields;