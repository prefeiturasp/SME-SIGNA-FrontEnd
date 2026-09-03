"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Combobox } from "@/components/ui/Combobox";

import formSchemaDesignacao, { FormDesignacaoData } from "./schema";

import { useFetchDREs, useFetchUEs } from "@/hooks/useUnidades";

import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { InfoItem } from "@/components/ui/info-item";
import Eye from "@/assets/icons/Eye";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import DetalhamentoTurmasModal from "@/components/detalhamentoTurmas/detalhamentoTurmas";
import useFetchDesignacaoUnidadeMutation from "@/hooks/useDesignacaoUnidade";
import { DesignacaoUnidadeResponse } from "@/types/designacao-unidade";
import ModalResumoServidor from "../ModalResumoServidor/ModalResumoServidor";
import { FormDesignacaoEServidorIndicado } from "@/app/pages/designacoes/DesignacaoContext";
import { CargoAPI, CargoSelect } from "@/types/designacao";
import SearchButton from "../../SearchButton/SearchButton";
import { formSchemaApostilaData } from "@/app/pages/apostila/schema";


interface Props {
  form: UseFormReturn<formSchemaApostilaData>;
}

const CamposPesquisaUnidade = (
  { form }: Props,
) => {
 
  const { data: dreOptions = [] } = useFetchDREs();


 
  const values = form.watch();
  const { data: ueOptions = [], isLoading: isLoadingUEs } = useFetchUEs(
    values.dre,
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
 
  return (
    <>
    
            <div className="flex flex-col md:flex-row gap-5 justify-items-center">
              <div className="sm:w-full lg:w-[300px] 2xl:w-[390px]">
                <FormField               
                  control={form.control}
                  name="dre"
                  render={({ field }) => (
                    
                    <FormItem >
                      <FormLabel className="required text-[#313131] font-bold">
                        DRE
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.clearErrors();
                            form.setValue("ue", "");
                            form.setValue("ue_nome", "");
                            const dreSelecionada = dreOptions.find(
                              (dre: { codigoDRE: string; nomeDRE: string; siglaDRE: string }) =>
                                dre.codigoDRE === value
                            );
                            form.setValue("dre_nome", dreSelecionada?.nomeDRE ?? "");

                          }}
                        >
                          <SelectTrigger data-testid="select-dre">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>

                          <SelectContent>
                            {dreOptions.map(
                              (dre: {
                                codigoDRE: string;
                                nomeDRE: string;
                                siglaDRE: string;
                              }) => (
                                <SelectItem
                                  key={dre.siglaDRE}
                                  value={dre.codigoDRE}
                                >
                                  {dre.nomeDRE}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-full">
                <FormField
                  control={form.control}
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
                              form.clearErrors();
                              const ueSelecionada = ueOptions.find(
                                (ue: { codigoEscola: string; nomeEscola: string; siglaTipoEscola: string }) =>
                                  ue.codigoEscola === value
                              );
                              form.setValue("ue_nome", ueSelecionada ? `${ueSelecionada.siglaTipoEscola} - ${ueSelecionada.nomeEscola}` : "");
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

       
            </div>

            {errorMessage && (
              <div className="mt-2 flex items-center gap-2">
                <p className="text-sm text-red-600" data-testid="login-error">
                  {errorMessage}
                </p>
              </div>
            )}

           
     
    </>
  );
};

export default CamposPesquisaUnidade;
