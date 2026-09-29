"use client";

import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Popconfirm } from "antd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";

interface SelectAnoFieldProps {
  name: string;
  label?: string;
  opcoes?: { codigo: string; nome: string }[];
}

export const SelectAnoField = ({ name, label = "Ano Vigente", opcoes }: SelectAnoFieldProps) => {
  const { control, setValue } = useFormContext();
  const valorSelecionado = useWatch({ control, name });
  const [pendingValue, setPendingValue] = useState<string | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const currentYear = new Date().getFullYear().toString();

  // O select exibe o ano atual quando o formulário está vazio; grava esse
  // mesmo valor para que o que aparece na tela e o que é validado coincidam.
  useEffect(() => {
    if (!opcoes && !valorSelecionado) {
      setValue(name, currentYear);
    }
  }, [opcoes, valorSelecionado, name, currentYear, setValue]);

  const anosDefault = Array.from(
    { length: new Date().getFullYear() - 1980 + 1 },
    (_, i) => {
      const ano = new Date().getFullYear() - i;
      return { codigo: ano.toString(), nome: ano.toString() };
    }
  );

  const anos = opcoes ?? anosDefault;

  return (
    <FormField
      control={control}
      name={name}
      defaultValue={currentYear}
      render={({ field }) => {
        const handleValueChange = (value: string) => {
          if (!opcoes && value !== currentYear) {
            setPendingValue(value);
            setOpenConfirm(true);
          } else {
            field.onChange(value);
          }
        };

        return (
          <FormItem>
            <FormLabel className="required text-[#313131] font-bold">
              {label}*
            </FormLabel>
            <FormControl>
              <Select
                value={field.value || currentYear}
                onValueChange={handleValueChange}
              >
                <SelectTrigger data-testid="select-ano">
                  <SelectValue placeholder="Selecione um ano" />
                </SelectTrigger>

                <SelectContent>
                  {anos.map((ano) => (
                    <SelectItem key={ano.codigo} value={ano.codigo} data-testid={`select-item-${ano.codigo}`}>
                      {ano.nome}
                    </SelectItem>
                  ))}
                </SelectContent>

                <Popconfirm
                  title="Mudar o ano"
                  description="Tem certeza que deseja mudar o ano?"
                  open={openConfirm}
                  onConfirm={() => {
                    if (pendingValue) field.onChange(pendingValue);
                    setOpenConfirm(false);
                  }}
                  onCancel={() => {
                    setPendingValue(null);
                    setOpenConfirm(false);
                  }}
                  okText="Sim"
                  cancelText="Não"
                />
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};