"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
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
}

export const SelectAnoField = ({ name, label = "Ano Vigente" }: SelectAnoFieldProps) => {
  const { control, setValue } = useFormContext();
  const [pendingValue, setPendingValue] = useState<string | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const currentYear = new Date().getFullYear().toString();

  const anos = Array.from(
    { length: new Date().getFullYear() - 1980 + 1 },
    (_, i) => {
      const ano = new Date().getFullYear() - i;
      return { codigo: ano.toString(), nome: ano.toString() };
    }
  );

  const handleValueChange = (value: string) => {
    if (value !== currentYear) {
      setPendingValue(value);
      setOpenConfirm(true);
    } else {
      setValue(name, value);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      defaultValue={currentYear}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="required text-[#42474a] font-bold">
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
                  if (pendingValue) setValue(name, pendingValue);
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
          <div className="h-[10px]">
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};