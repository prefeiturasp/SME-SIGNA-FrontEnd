"use client";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion } from "@/components/ui/accordion";
import { BuscaDesignacaoRequest } from "@/types/designacao";
import ResumoTitular from "@/components/dashboard/Designacao/ResumoTitular";

import { formSchemaDesignacaoPasso2Data } from "../../../../app/pages/designacoes/designacoes-passo-2/schema";

// Componentes Customizados
import FormularioBuscaDesignacao from "@/components/dashboard/Designacao/BuscaDesignacao/FormularioBuscaDesignacao";
import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import { FormEditarServidorData } from "../ModalEditarServidor/schema";
import { Servidor } from "@/types/designacao-unidade";
import { useFetchCargos } from "@/hooks/useCargos";
import { Loader2 } from "lucide-react";

interface SelecaoTipoCargoProps {
  readonly form: UseFormReturn<formSchemaDesignacaoPasso2Data>;
  readonly tipoCargo: string;
  readonly dadosTitular: Servidor | null;
  readonly errorBusca: string | null;
  readonly isLoading: boolean;
  readonly onBuscaTitular: (values: BuscaDesignacaoRequest) => Promise<void>;
  readonly setDadosTitular: (val: Servidor | null) => void;
  readonly setErrorBusca: (val: string | null) => void;
}

export default function SelecaoServidorIndicado({
  form,
  tipoCargo,
  dadosTitular,
  errorBusca,
  isLoading = false,
  onBuscaTitular,
  setDadosTitular,
  setErrorBusca,
}: Readonly<SelecaoTipoCargoProps>) {

  const { data: cargosData = [] } = useFetchCargos();
  const cargos = cargosData.map(cargo => ({
    id: cargo.codigoCargo,
    label: cargo.nomeCargo,
  }));

  function handleSubmitEditarServidor(data: FormEditarServidorData) {
    setDadosTitular({
      ...dadosTitular!,
      nome_servidor: data.nome_servidor,
      nome_civil: data.nome_civil,
    });
  }



  return (
    <div className="p-4 pt-4 border-t mt-4">
      {isLoading ? (
        <div className="flex justify-center h-full">
          <Loader2
           data-testid="loading-spinner"
            className="h-16 w-16 text-primary animate-spin "/>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="tipo_cargo"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="font-bold text-[#42474a] text-lg">
                  Selecione o tipo de cargo:
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(val) => {
                      field.onChange(val);
                      setDadosTitular(null);
                      setErrorBusca(null);
                      form.setValue("rf_titular", "");
                      form.setValue("cargo_vago_selecionado", null);
                    }}
                    value={field.value}
                    className="flex flex-row gap-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="disponivel" id="disponivel" />
                      <Label htmlFor="disponivel" className="font-normal cursor-pointer">
                        Cargo Disponível
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vago" id="vago" />
                      <Label htmlFor="vago" className="font-normal cursor-pointer">
                        Cargo Vago
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="w-full">
            {tipoCargo === "vago" ? (
              <div className="w-full md:w-[60%] animate-in fade-in duration-300">
                <FormField
                  control={form.control}
                  name="cargo_vago_selecionado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-[#42474a]">
                        Selecione o cargo
                      </FormLabel>

                      <Select
                        onValueChange={(value) => {
                          const cargoSelecionado = cargos.find(
                            (cargo) => String(cargo.id) === value);
                          field.onChange({ id: cargoSelecionado?.id, label: cargoSelecionado?.label });
                        }}
                        value={field.value?.id ? String(field.value.id) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cargo..." />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {cargos.map((cargo) => (
                            <SelectItem key={cargo.id} value={String(cargo.id)}>{cargo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div className="pt-2">
                  <FormularioBuscaDesignacao                    
                    label={"RF Titular"}
                    onBuscaDesignacao={onBuscaTitular}
                  />
                </div>

                {errorBusca && (
                  <div className="text-red-500 text-sm animate-in shake-1">
                    {errorBusca}
                  </div>
                )}

                {dadosTitular && (
                  <div className="mt-4 animate-in zoom-in-95 duration-300">
                    <Accordion type="single" collapsible defaultValue="resultado">
                      <CustomAccordionItem
                        title="Dados do Servidor Titular"
                        value="resultado"
                        color="green"
                      >
                        <ResumoTitular
                          data={dadosTitular}
                          onSubmitEditarServidor={handleSubmitEditarServidor}
                        />
                      </CustomAccordionItem>
                    </Accordion>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}