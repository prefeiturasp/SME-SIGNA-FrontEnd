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

import { useFetchImpedimentos } from "@/hooks/useTiposImpedimentos";

import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  CheckboxField,
  DateField,
  InputField,
} from "@/components/ui/FieldsForm";
import {SelectAnoField} from "@/components/ui/SelectAnoField"


interface Props {
  isLoading: boolean;
}

const PortariaDesigacaoFields = ({ isLoading }: Props) => {
  const { register, control, watch } = useFormContext();
  const { mutate, data, isPending } = useFetchImpedimentos();

  const impedimentos =
    data?.map((item) => ({
      codigo: item.value.toString(),
      nome: item.label,
    })) ?? [];


  const dataFinal = watch("designacao_data_final");
  const isImpedimentoDisabled = !dataFinal;

  useEffect(() => {
    mutate();
  }, []);

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
               <SelectAnoField name="cessacao.ano" label="Ano Vigente" />
            </div>

            <div className="w-full">
              <InputField
                register={register}
                control={control}
                name="numero_sei"
                label="Nº SEI"
                placeholder="Número SEI"
                data-testid="input-numero-sei"
                type="string"                
                mask= "9999.9999/9999999-9"
              />
            </div>

            <div className="w-full">
              <InputField
                register={register}
                control={control}
                name="doc"
                label="D.O"
                placeholder="Número DO"
                data-testid="input-doc"
                disabled
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
                      Impedimento para substituição:
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                        disabled={isImpedimentoDisabled || isPending}
                      >
                        <SelectTrigger data-testid="select-impedimento-substituicao">
                          <SelectValue
                            placeholder={
                              isImpedimentoDisabled
                                ? "Preencha a data 'Até' primeiro"
                                : "Selecione uma opção"
                            }
                          />
                        </SelectTrigger>

                        <SelectContent>
                          {impedimentos.map((impedimento) => (
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
