"use client";

import { useFormContext } from "react-hook-form";

import { Loader2 } from "lucide-react";

import {
  CheckboxField,
  DateField,
  InputField,
} from "@/components/ui/FieldsForm";

import {SelectAnoField} from "@/components/ui/SelectAnoField"

interface Props {
  isLoading?: boolean;
}

const PortariaCessacaoFields = ({ isLoading }: Props) => {
  const { register, control } = useFormContext();

  const inputFields = [
    {
      name: "cessacao.numero_portaria",
      label: "Portaria de cessação*",
      placeholder: "Nº da portaria",
      type: "number",
    },
    {
      name: "cessacao.numero_sei",
      label: "Nº SEI*",
      placeholder: "Número SEI",
      type: "string",
      mask: "9999.9999/9999999-9",
    },
    {
      name: "cessacao.doc",
      label: "D.O",
      placeholder: "Número do DOC",
      disabled: true,
    },
  ];

  const checkboxFields = [
    { name: "cessacao.a_pedido", label: "A pedido?*" },
    { name: "cessacao.remocao", label: "Remoção?*" },
    { name: "cessacao.aposentadoria", label: "Aposentadoria?*" },
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
              ))}

              <SelectAnoField name="cessacao.ano" label="Ano Vigente" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4 mt-4">
            <DateField
              register={register}
              control={control}
              name="cessacao.data_inicio"
              label="Cessação a partir de:*"
            />

            {checkboxFields.map((field) => (
              <CheckboxField
                key={field.name}
                register={register}
                control={control}
                name={field.name}
                label={field.label}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default PortariaCessacaoFields;