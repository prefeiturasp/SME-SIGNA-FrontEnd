"use client";

import { memo, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

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


import { InputField, SelectField } from "@/components/ui/FieldsForm";
import useFetchDesignacaoUnidadeMutation from "@/hooks/useDesignacaoUnidade";



interface Props {
  disabled?: boolean;
}

const CamposPesquisaUnidade = ({ disabled }: Props) => {
  const { register, control, setValue, clearErrors } = useFormContext();

  const { data: dreOptions = [], isLoading: isLoadingDREs } = useFetchDREs();
  const dre = useWatch({ control, name: "dre" });
  const { data: ueOptions = [], isLoading: isLoadingUEs } = useFetchUEs(
    dre ?? "",
  );

  const dreSelectOptions = useMemo(
    () =>
      dreOptions.map(
        (dre: { codigoDRE: string; nomeDRE: string; siglaDRE: string }) => ({
          label: `${dre.siglaDRE} - ${dre.nomeDRE}`,
          value: dre.codigoDRE,
        })
      ),
    [dreOptions]
  );
  const ueSelectOptions = useMemo(
    () =>
      ueOptions.map(
        (ue: { codigoEscola: string; nomeEscola: string, siglaTipoEscola: string }) => ({
          label: `${ue.siglaTipoEscola} - ${ue.nomeEscola}`,
          value: ue.codigoEscola,
        })
      ),
    [ueOptions]
  );
  const { mutateAsync, isPending: isLoadingCodigoHierarquico } = useFetchDesignacaoUnidadeMutation();

  const populaCodigoHierarquico = async (codigo_ue: string) => {
    const response = await mutateAsync(codigo_ue);
    if (response.success) {      
      setValue("codigo_hierarquico", response.data.codigo_hierarquico ?? "");
    }
  }


  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-center xl:grid-cols-4">
      <div className="w-full">
        <SelectField
          disabled={disabled|| isLoadingCodigoHierarquico}
          isLoading={isLoadingDREs}
          key="dre"
          placeholder="Selecione a DRE"
          dataTestId="select-dre"
          register={register}
          control={control}
          name="dre"
          label="DRE"
          options={dreSelectOptions}
          onValueChange={(value: string) => {
            
            setValue("ue", "");
            setValue("ue_nome", "");
            setValue("codigo_hierarquico", "");
            clearErrors();
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
          disabled={disabled}
          control={control}
          name="ue"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required text-[#313131] font-bold">
                Unidade proponente
              </FormLabel>
              <FormControl>
                {isLoadingUEs || isLoadingCodigoHierarquico ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-primary " />
                  </div>
                ) : (
                  <Combobox
                    placeholder="Digite o nome da UE"
                    disabled={!dre || disabled}
                    data-testid="select-ue"
                    value={field.value}
                    options={ueSelectOptions}
                    onChange={(value) => {
                      field.onChange(value);
                      clearErrors();
                      const ueSelecionada = ueOptions.find(
                        (ue: { codigoEscola: string; nomeEscola: string; siglaTipoEscola: string }) =>
                          ue.codigoEscola === value
                      );
                      setValue("ue_nome", ueSelecionada ? `${ueSelecionada.siglaTipoEscola} - ${ueSelecionada.nomeEscola}` : "");
                      if (ueSelecionada) populaCodigoHierarquico(ueSelecionada.codigoEscola);
                    }}
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
            disabled={true}
          />         
      </div>
    </div>
  );
};

export default memo(CamposPesquisaUnidade);
