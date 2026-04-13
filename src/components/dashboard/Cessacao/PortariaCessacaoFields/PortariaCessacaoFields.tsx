"use client";

import { useFormContext } from "react-hook-form";

import {
  SelectItem,
  Select,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

import {
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
  FormControl,
} from "@/components/ui/form";

import { Popconfirm } from "antd";
import { useState } from "react";
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
      type: "number",
    },
    {
      name: "cessacao.doc",
      label: "D.O*",
      placeholder: "Número do DOC",
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
                />
              ))}

              <SelectAnoField name="cessacao.ano" label="Ano Vigente" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4 mt-4">
            <DateField
              register={register}
              control={control}
              name="cessacao.data_inicio"
              label="Designação a partir de:*"
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