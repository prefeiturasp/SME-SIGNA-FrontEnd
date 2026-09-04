"use client";

import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

 

import { Combobox } from "@/components/ui/Combobox";

import { useFetchDREs, useFetchUEs } from "@/hooks/useUnidades";

import { Loader2 } from "lucide-react";

 
import { CampoSelectDRE, InputField } from "@/components/ui/FieldsForm";


 

const CamposPesquisaUnidade = (
  
) => {
  
  const { register, control, watch, setValue, clearErrors } = useFormContext();

  const { data: dreOptions = [],  isLoading: isLoadingDREs } = useFetchDREs();
  const values = watch();
  const { data: ueOptions = [], isLoading: isLoadingUEs } = useFetchUEs(
    values?.dre ?? "",
  );

  return (
      <div className="grid gap-4 lg:grid-cols-2 lg:items-center xl:grid-cols-4">
        <div className="w-full">
          <CampoSelectDRE
            register={register}
            control={control}
            name="dre"
            dreOptions={dreOptions}
            isLoading={isLoadingDREs}
            onValueChange={(value) => {              
              clearErrors();
              setValue("ue", "");
              setValue("ue_nome", "");
              const dreSelecionada = dreOptions.find(
                (dre: { codigoDRE: string; nomeDRE: string; siglaDRE: string }) =>
                  String(dre.codigoDRE) === value
              );
              setValue("dre_nome", dreSelecionada?.nomeDRE ?? "");
            }}
          />
        </div>

        <div className="w-full">
          <FormField
            control={control}
            name="ue"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="required text-[#313131] font-bold">
                  Unidade proponente
                </FormLabel>
                <FormControl>
                  {isLoadingUEs ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-primary " />
                    </div>
                  ) : (
                    <Combobox

                      options={ueOptions.map(
                        (ue: { codigoEscola: string; nomeEscola: string, siglaTipoEscola: string }) => ({
                          label: `${ue.siglaTipoEscola} - ${ue.nomeEscola}`,
                          value: ue.codigoEscola,
                        })
                      )}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        clearErrors();
                        const ueSelecionada = ueOptions.find(
                          (ue: { codigoEscola: string; nomeEscola: string; siglaTipoEscola: string }) =>
                            ue.codigoEscola === value
                        );
                        setValue("ue_nome", ueSelecionada ? `${ueSelecionada.siglaTipoEscola} - ${ueSelecionada.nomeEscola}` : "");
                      }}  
                      placeholder="Digite o nome da UE"
                      disabled={!values.dre}
                      data-testid="select-ue"
                    />
                  )}
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
            name="codigo_hierarquico"
            label="Código Estrutura Hierárquica"
            placeholder="Exemplo: 1234567890"
            data-testid="input-codigo-hierarquico"
            type="text"
          />
        </div>


      </div>



 
  );
};

export default CamposPesquisaUnidade;
