"use client";
import {  FieldValues, FormProvider, UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import FormItem from "antd/es/form/FormItem";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface InformacoesAdicionaisProps {
  form: UseFormReturn<FieldValues>;
  onChangeDescricao: (value: string) => void;
  onValueChangeDetalheParaQuadroDeHistoricoPorAno: (value: string) => void;
  disableFields: boolean;
}


export default function InformacoesAdicionais({ disableFields = false, form, onChangeDescricao, onValueChangeDetalheParaQuadroDeHistoricoPorAno }: Readonly<InformacoesAdicionaisProps>) {

  return (

        <FormProvider {...form}>
          <form >
            <div className="w-full ">
              <FormField
                {...form.register("informacoes_adicionais")}
                control={form.control}
                name="informacoes_adicionais"
                render={({ field }) => (
                  <FormItem className="mb-0">
                    <div className="mb-4">
                      <FormLabel className="required font-normal">
                        Insira informações que considerar importante no processo da designação. Este é um campo opcional.
                      </FormLabel>
                    </div>
                    <FormControl className="space-y-4">
                      <Textarea
                        disabled={disableFields}
                        rows={4}
                        placeholder=""
                        value={field.value}
                        onChange={(e) => {
                          onChangeDescricao(e.target.value)
                          return field.onChange(e.target.value);
                        }}
                        data-testid="input-descricao-pendencia"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <div className="w-full">

                <FormField
                control={form.control}
                
                name="detalhe_para_quadro_de_historico_por_ano"
                render={({ field }) => (

                  <FormItem className="mb-0">
                    <FormLabel className="font-bold text-[#313131]">
                      Detalhe para quadro de histórico por ano
                    </FormLabel>

                    { disableFields ?  (
                    <div className="flex items-center pt-1">
                      <span className="text-sm text-gray-500">
                        {field.value ? "Contabilizar" : "Não contabilizar"}
                      </span>
                    </div>

                  ) : (
                    <Select
                      value={field.value?.toString() ?? ''}
                      onValueChange={(value) => {
                        onValueChangeDetalheParaQuadroDeHistoricoPorAno(value)
                        const booleanValue = value === "true";                       
                        return field.onChange(booleanValue)                        
                      }}
                    >
                      <SelectTrigger >
                        <SelectValue placeholder="Selecione o Detalhe..." />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="false">Não contabilizar</SelectItem>
                        <SelectItem value="true">Contabilizar</SelectItem>
                      </SelectContent>
                    </Select>
                     )}
                    <FormMessage />
                  </FormItem>
                )}               
              />            
            </div>
          </form>
        </FormProvider>
 

  )
}
