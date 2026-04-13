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

interface Props {
  isLoading?: boolean;
}

const PortariaCessacaoFields = ({ isLoading }: Props) => {
  const { register, control, setValue } = useFormContext();

  // 🔥 anos igual designação
  const anos = Array.from(
    { length: new Date().getFullYear() - 1980 + 1 },
    (_, i) => {
      const ano = new Date().getFullYear() - i;
      return { codigo: ano.toString(), nome: ano.toString() };
    }
  );

  const [pendingValue, setPendingValue] = useState<string | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleValueChange = (value: string) => {
    setPendingValue(value);
    setOpenConfirm(true);
  };

  const handleConfirm = () => {
    if (pendingValue) {
      setValue("cessacao.ano", pendingValue);
    }
    setOpenConfirm(false);
  };

  const handleCancel = () => {
    setPendingValue(null);
    setOpenConfirm(false);
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center h-full">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <InputField
              register={register}
              control={control}
              name="cessacao.numero_portaria"
              label="Portaria de cessação*"
              placeholder="Nº da portaria"
              type="number"
            />

            <FormField
              control={control}
              name="cessacao.ano"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                    Ano Vigente*
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        if (
                          value !== new Date().getFullYear().toString()
                        ) {
                          return handleValueChange(value);
                        }
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um ano" />
                      </SelectTrigger>

                      <SelectContent>
                        {anos.map((ano) => (
                          <SelectItem key={ano.codigo} value={ano.codigo}>
                            {ano.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>

                      <Popconfirm
                        title="Mudar o ano"
                        description="Tem certeza que deseja mudar o ano?"
                        open={openConfirm}
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                        okText="Sim"
                        cancelText="Não"
                      />
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <InputField
              register={register}
              control={control}
              name="cessacao.numero_sei"
              label="Nº SEI*"
              placeholder="Número SEI"
              type="number"
            />

            <InputField
              register={register}
              control={control}
              name="cessacao.doc"
              label="D.O*"
              placeholder="Número do DOC"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4 mt-4">
            <DateField
              register={register}
              control={control}
              name="cessacao.data_inicio"
              label="Designação a partir de:*"
            />

            <CheckboxField
              register={register}
              control={control}
              name="cessacao.a_pedido"
              label="A pedido?*"
            />

            <CheckboxField
              register={register}
              control={control}
              name="cessacao.remocao"
              label="Remoção?*"
            />

            <CheckboxField
              register={register}
              control={control}
              name="cessacao.aposentadoria"
              label="Aposentadoria?*"
            />
          </div>
        </>
      )}
    </>
  );
};

export default PortariaCessacaoFields;