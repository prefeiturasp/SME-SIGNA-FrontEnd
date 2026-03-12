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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  CheckboxField,
  DateField,
  InputField,
} from "@/components/ui/FieldsForm";

interface Props {
  isLoading: boolean;
}

const PortariaDesigacaoFields = ({ isLoading }: Props) => {
  const { register, control, setValue, watch } = useFormContext();

  const anos = Array.from(
    { length: new Date().getFullYear() - 1980 + 1 },
    (_, i) => {
      const ano = new Date().getFullYear() - i;
      return { codigo: ano.toString(), nome: ano.toString() };
    }
  );

  const impedimentoSubstituicao = [
    { codigo: "1", nome: "por licença gestante" },
    { codigo: "2", nome: "por licença médica" },
    { codigo: "3", nome: "por licença paternidade" },
    { codigo: "4", nome: "por férias" },
    { codigo: "5", nome: "por licença maternidade especial" },
    { codigo: "6", nome: "por liçença adoção" },
    { codigo: "7", nome: "por licença guarda de menor" },
    {
      codigo: "8",
      nome: "para concorrer a mandato eletivo, nos termos da Portaria nº 20/SEGES/2024 e da Lei Complementar nº 64, de 18 de maio de 1990",
    },
    { codigo: "9", nome: "por licença nojo" },
    { codigo: "10", nome: "por licenca gala" },
    {
      codigo: "11",
      nome: "por afastamento por Cursos/Congressos/Competições",
    },
    { codigo: "12", nome: "por licença maternidade" },
    { codigo: "13", nome: "por prorrogação da licença à gestante" },
    { codigo: "14", nome: "por licença parental de curta duração" },
    { codigo: "15", nome: "por licença parental de longa duração" },
    { codigo: "16", nome: "por Evento/Reunião" },
    {
      codigo: "17",
      nome: "por readaptação funcional, nos termos do art. 39 da Lei nº 8.979, de 1979",
    },
    {
      codigo: "18",
      nome: 'para prestar serviços técnico-educacionais, nos termos da alínea "a", inciso IX, do artigo 66 da Lei nº 14.660, de 2007',
    },
    {
      codigo: "19",
      nome: "por exercer cargos em comissão, nos termos do § 1º do art. 45 da Lei nº 8.989, de 1979, art. 70 da Lei nº 14.660, de 2007",
    },
    {
      codigo: "20",
      nome: 'para prestar serviços técnico-educacionais, nos termos da alínea "b", inciso IX, do artigo 66 da Lei nº 14.660, de 2007',
    },
    {
      codigo: "21",
      nome: "por transferência temporária do servidor, nos termos do art. 8º do Decreto Municipal nº 57.444, de 2016",
    },
    {
      codigo: "22",
      nome: "por exercer mandato de dirigente sindical, nos termos do disposto no inciso VII do art. 66 da Lei nº 14.660, de 2007",
    },
    {
      codigo: "23",
      nome: "pelo afastamento, em caráter excepcional, nos termos da alínea 'b', inciso IX, do artigo 66 da Lei nº 14.660, de 2007",
    },
  ];

  const [pendingValue, setPendingValue] = useState<string | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleValueChange = (value: string) => {
    setPendingValue(value);
    setOpenConfirm(true);
  };

  const handleConfirm = () => {
    if (pendingValue) {
      setValue("ano", pendingValue);
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
          <Loader2
            data-testid="loading-spinner"
            className="h-16 w-16 text-primary animate-spin"
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2 lg:items-center xl:grid-cols-4">
            <div className="w-full">
              <InputField
                register={register}
                control={control}
                name="portaria_designacao"
                label="Portaria da designação"
                placeholder="Nº da portaria"
                data-testid="input-portaria-designacao"
                type="number"
              />
            </div>

            <div className="w-full">
              <FormField
                control={control}
                name="ano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required text-[#42474a] font-bold">
                      Ano Vigente
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          if (
                            value.toString() !==
                            new Date().getFullYear().toString()
                          ) {
                            return handleValueChange(value);
                          }
                          field.onChange(value);
                        }}
                      >
                        <SelectTrigger data-testid="select-ano">
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
            </div>

            <div className="w-full">
              <InputField
                register={register}
                control={control}
                name="numero_sei"
                label="Nº SEI"
                placeholder="Número SEI"
                data-testid="input-numero-sei"
                type="number"
              />
            </div>

            <div className="w-full">
              <InputField
                register={register}
                control={control}
                name="doc"
                label="D.O"
                placeholder="Número doc"
                data-testid="input-doc"
              />
            </div>
          </div>

          <div className="required text-[#42474a] font-bold pt-4 pb-4">
            Designação
          </div>

          <div className="grid gap-4 lg:grid-cols-2 lg:items-center xl:grid-cols-4">
            <div className="w-full">
              <DateField
                register={register}
                control={control}
                name="a_partir_de"
                label="A partir de"
              />
            </div>

            <div className="w-full">
              <DateField
                register={register}
                control={control}
                name="designacao_data_final"
                label="Até"
              />
            </div>

            <div className="w-full">
              <CheckboxField
                register={register}
                control={control}
                name="carater_especial"
                label="Carater Especial"
                data-testid="checkbox-carater-especial"
              />
            </div>

            <div className="w-full">
              <FormField
                control={control}
                name="impedimento_substituicao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required text-[#42474a] font-bold">
                      Impendimento para substituição:
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger data-testid="select-impedimento-substituicao">
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>

                        <SelectContent>
                          {impedimentoSubstituicao.map((impedimento) => (
                            <SelectItem
                              key={impedimento.codigo}
                              value={impedimento.codigo}
                            >
                              {impedimento.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="gap-4 lg:items-center">
            <div className="w-full pt-4">
              <CheckboxField
                register={register}
                control={control}
                name="com_afastamento"
                label="Com afastamento?"
                data-testid="checkbox-com-afastamento"
              />
            </div>

            {watch("com_afastamento") === "sim" && (
              <div className="w-full pt-4">
                <FormField
                  {...register("motivo_afastamento")}
                  control={control}
                  name="motivo_afastamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="required text-[#42474a] font-bold">
                        Motivo do afastamento
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Motivo do afastamento"
                          value={field.value}
                          onChange={(value) =>
                            field.onChange(value.target.value)
                          }
                          data-testid="input-motivo-afastamento"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="w-full pt-4">
              <CheckboxField
                register={register}
                control={control}
                name="com_pendencia"
                label="Possui pendência?"
                data-testid="checkbox-possui-pendencia"
              />
            </div>

            {watch("com_pendencia") === "sim" && (
              <div className="w-full pt-4">
                <FormField
                  {...register("motivo_pendencia")}
                  control={control}
                  name="motivo_pendencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="required text-[#42474a] font-bold">
                        Descrição da pendência
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Descreva a pendência"
                          value={field.value}
                          onChange={(value) =>
                            field.onChange(value.target.value)
                          }
                          data-testid="input-descricao-pendencia"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default PortariaDesigacaoFields;
