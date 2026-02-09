"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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

import formSchemaDesignacao, {
  FormDesignacaoData,
} from "./schema";

import { useFetchDREs, useFetchUEs } from "@/hooks/useUnidades";

import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { InputBase } from "@/components/ui/input-base";
import { InfoItem } from "../ResumoDesignacao";
import Eye from "@/assets/icons/Eye";
import { forwardRef, useImperativeHandle, useState } from "react";

import DetalhamentoTurmasModal from "@/components/detalhamentoTurmas/detalhamentoTurmas";
import useFetchDesignacaoUnidadeMutation from "@/hooks/useDesignacaoUnidade";
import { DesignacaoUnidadeResponse, Servidor } from "@/types/designacao-unidade";
import ModalResumoServidor from "../ModalResumoServidor/ModalResumoServidor";


export interface FormularioPesquisaUnidadeRef {
  getValues: () => FormDesignacaoData;
}

interface Props {
  readonly onSubmitDesignacao: (values: FormDesignacaoData) => void;
  readonly setDisableProximo: (disable: boolean) => void;
}


const FormularioPesquisaUnidade = forwardRef<FormularioPesquisaUnidadeRef, Props>(function FormularioPesquisaUnidade({
  onSubmitDesignacao,
  setDisableProximo
}: Props, ref) {
  const { data: dreOptions = [] } = useFetchDREs();
  const [funcionariosOptions, setFuncionariosOptions] = useState<{ rf: string; nome: string }[]>([])
  const [openModal, setOpenModal] = useState(false);

  const form = useForm<FormDesignacaoData>({
    resolver: zodResolver(formSchemaDesignacao),
    defaultValues: {
      dre: "",
      ue: "",
      funcionarios_da_unidade: "",
      quantidade_turmas: "",
      codigo_estrutura_hierarquica: "",
      cargo_sobreposto: "",
      modulos: "",
    },
    mode: "onChange",
  });

  const values = form.watch();
  const { data: ueOptions = [], isLoading: isLoadingUEs } = useFetchUEs(values.dre);


  useImperativeHandle(ref, () => ({
    getValues: () => form.getValues(),
  }), [form])
  const { mutateAsync } = useFetchDesignacaoUnidadeMutation();

  const [designacaoUnidade, setDesignacaoUnidade] = useState<DesignacaoUnidadeResponse | null>();

  const onSubmit = async (values: FormDesignacaoData) => {


    try {
      const response = await mutateAsync(values.ue);
      if (!response.success) {
        throw new Error("Não foi possível buscar os dados da unidade");
      }


      const cargosSelect = response.data.cargos.map((cargo) => ({
        rf: cargo.codigoCargo,
        nome: cargo.nomeCargo,
      }));
      setFuncionariosOptions(cargosSelect)
      setDesignacaoUnidade(response.data);

    } catch (error) {
      console.error(error);
    }

    form.setValue("codigo_estrutura_hierarquica", '');
    form.setValue("quantidade_turmas", '-');



    onSubmitDesignacao(values);
  }
  
  const [openModalResumoServidor, setOpenModalResumoServidor] = useState(true);

  const servidor=  {
    rf: 'string',
  nome: 'string',
    esta_afastado: false,
  vinculo_cargo_sobreposto: 'string',
  lotacao_cargo_sobreposto: 'string',
  cargo_base: 'string',
  funcao_atividade: 'string',
  cargo_sobreposto: 'string',
  cursos_titulos: 'string',
};
const selectedServidor= values.funcionarios_da_unidade;
  return (
    <Form {...form}>

      {
      servidor && (
        <ModalResumoServidor
          isLoading={false}
          open={openModalResumoServidor}
          onOpenChange={setOpenModalResumoServidor}
          servidor={servidor}//{designacaoUnidade?.funcionarios_unidade[selectedServidor]?.servidores[0] || {} as Servidor}
        />
      )}

      <DetalhamentoTurmasModal
        open={openModal}
        onOpenChange={setOpenModal}
        dre={values.dre || "-"}
        unidadeEscolar={values.ue || "-"}
        qtdTotalTurmas={values.quantidade_turmas || "-"}
        spi="São Paulo Integral"
        // to-do: remover mock
        rows={[
          {
            turno: "Manhã",
            cicloAlfabetizacao: 3,
            cicloAltoral: 3,
            total: 5,
          },
          {
            turno: "Intermediário",
            cicloAlfabetizacao: 3,
            cicloAltoral: 3,
            total: 5,
          },
          {
            turno: "Tarde",
            cicloAltoral: 7,
            semCiclo: 4,
            total: 11,
          },
          {
            turno: "Vespertino",
            cicloAlfabetizacao: 3,
            cicloAltoral: 3,
            total: 5,
          },
          {
            turno: "Noite",
            cicloAltoral: 7,
            semCiclo: 4,
            total: 11,
          },
          {
            turno: "Integral",
            cicloAlfabetizacao: 3,
            cicloAltoral: 7,
            semCiclo: 8,
            total: 18,
          },
        ]}
      />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8"
      >
        <div className="flex flex-col md:flex-row gap-5">

          <div className="w-full md:w-[20%]">
            <FormField
              control={form.control}
              name="dre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required text-[#42474a] font-bold">
                    DRE
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.clearErrors();
                        form.setValue("ue", "");
                        setDisableProximo(true);
                      }}
                    >
                      <SelectTrigger data-testid="select-dre">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>

                      <SelectContent>
                        {dreOptions.map(
                          (dre: { codigoDRE: string; nomeDRE: string; siglaDRE: string }) => (
                            <SelectItem key={dre.siglaDRE} value={dre.codigoDRE}>
                              {dre.nomeDRE}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full md:w-[75%]">
            <FormField
              control={form.control}
              name="ue"
              render={({ field }) => (
                <FormItem >
                  <FormLabel className="required text-[#42474a] font-bold">
                    Unidade escolar
                  </FormLabel>
                  <FormControl>
                    {isLoadingUEs ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-primary " />
                      </div>
                    ) : (
                      <Combobox
                        options={ueOptions.map(
                          (ue: { codigoEol: string; nomeOficial: string }) => ({
                            label: ue.nomeOficial,
                            value: ue.codigoEol,
                          })
                        )}
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          setDisableProximo(false);
                          form.clearErrors();
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

          <div className="w-[150px] pt-[2rem] ">
            <Button type="submit" className="w-full flex items-center justify-center gap-6" variant="customOutline">

              <p className="text-[16px] font-bold">Pesquisar</p>
              <Search />
            </Button>
          </div>



        </div>

        {funcionariosOptions.length > 0 && (
          <div className="flex flex-col md:flex-row  gap-5">
            <div className="w-full md:w-[20%]">
              <FormField
                control={form.control}
                name="codigo_estrutura_hierarquica"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required text-[#42474a] font-bold">
                      Código Estrutura hierárquica
                    </FormLabel>
                    <FormControl>
                      <InputBase
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value.target.value);
                        }}
                        data-testid="input-codigo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full md:w-[15%] mt-6">
              <InfoItem
                label="Qtd. Turmas"
                value={form.watch("quantidade_turmas")}
                icon={
                  <Button
                    variant="ghost"
                    size="icon" onClick={() =>
                      setOpenModal(true)}
                    data-testid="btn-visualizar-turmas">
                    <Eye width={16} height={16} />
                  </Button>}
              />

            </div>

            <div className="w-full md:w-[75%]">
              <FormField
                control={form.control}
                name="funcionarios_da_unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required text-[#42474a] font-bold">
                      Funcionários da unidade
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          const cargoSobreposto = designacaoUnidade?.funcionarios_unidade[value]?.servidores[0]?.cargo_sobreposto || "";
                          const modulo = designacaoUnidade?.funcionarios_unidade[value]?.modulo || "";



                          form.setValue("cargo_sobreposto", cargoSobreposto);
                          form.setValue("modulos", modulo);
                        }}
                      >
                        <SelectTrigger data-testid="select-funcionarios">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>

                        <SelectContent>
                          {funcionariosOptions.map(
                            (funcionario: { rf: string; nome: string; }) => (
                              <SelectItem key={funcionario.rf} value={funcionario.rf}>
                                {funcionario.nome}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                    variant="ghost"
                    size="icon" onClick={() =>
                      setOpenModalResumoServidor(true)}
                    data-testid="btn-visualizar-servidor">
                    <Eye width={16} height={16} />
                  </Button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>



          </div>
        )}




        {form.watch("cargo_sobreposto") && form.watch("modulos") && (
          <div className="flex flex-row">


            <div className="w-full md:w-[19.5%]">
              <InfoItem label="Cargo sobreposto" value={form.watch("cargo_sobreposto")} />
            </div>

            <div className="w-full md:w-[15%] ">
              <InfoItem label="Módulos" value={form.watch("modulos")} />
            </div>
          </div>
        )}
      </form>
    </Form>
  );
});

export default FormularioPesquisaUnidade;
