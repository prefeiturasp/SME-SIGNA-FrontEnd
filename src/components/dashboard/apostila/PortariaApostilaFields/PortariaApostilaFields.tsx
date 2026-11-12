"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { InputField } from "@/components/ui/FieldsForm";

interface Props {
  isLoading?: boolean;
  origem?: string | null;
}

const CAMPOS_ATO_PAI = {
  designacao: { numero_portaria: "portaria_designacao", numero_sei: "numero_sei" },
  cessacao: { numero_portaria: "cessacao.numero_portaria", numero_sei: "cessacao.numero_sei" },
};

const PortariaApostilaFields = ({ isLoading, origem }: Props) => {
  const { control, setValue } = useFormContext();
  const camposAtoPai = origem === "cessacao" ? CAMPOS_ATO_PAI.cessacao : CAMPOS_ATO_PAI.designacao;

  const numeroPortariaAtoPai = useWatch({ control, name: camposAtoPai.numero_portaria });
  const numeroSeiAtoPai = useWatch({ control, name: camposAtoPai.numero_sei });

  useEffect(() => {
    setValue("apostila.numero_portaria", numeroPortariaAtoPai ?? "");
    setValue("apostila.numero_sei", numeroSeiAtoPai ?? "");
  }, [numeroPortariaAtoPai, numeroSeiAtoPai, setValue]);

  const inputFields = [

    {
      name: "apostila.numero_portaria",
      label: "Nº Portaria",
      placeholder: "Número Portaria",
      type: "number",
      disabled: true,
    },
    {
      name: "apostila.numero_sei",
      label: "Nº SEI",
      placeholder: "Número SEI",
      type: "string",
      mask: "9999.9999/9999999-9",
      disabled: true,
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
