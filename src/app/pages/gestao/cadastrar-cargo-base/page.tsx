"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Steps, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Button } from "@/components/ui/button";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { FormProvider } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/Combobox";
import { StatusOpcoes, CargosBaseGrupamento, SituacaoFuncionalOpcoes } from "@/components/dashboard/Gestao/FiltroDeCargosBase/FiltroDeCargosBase";
import { useCriarEditarCargosBase } from "@/hooks/useCriarEditarCargosBase";

const ROTA_LISTAGEM_CARGOS_BASE = "/pages/gestao/cargos-base";

const ETAPAS = [
  { title: "Informações do cargo" },
  { title: "Utilização do cargo" },
  { title: "Módulo do cargo" },
];

export default function CadastrarCargoBase() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const codigoCargoSelecionado = searchParams.get("codigo_cargo");

  const router = useRouter();
  const [etapaAtual, setEtapaAtual] = useState(0);

  const { form, isLoadingCargosBase, onSubmitForm } = useCriarEditarCargosBase(
    id ? Number(id) : null,
    codigoCargoSelecionado ? { codigo_cargo: codigoCargoSelecionado } : undefined
  );

  const codigoCargo = form.watch("codigo_cargo");
  const descricaoCompleta = form.watch("descricao_completa");
  const ultimaEtapa = etapaAtual === ETAPAS.length - 1;

  const avancarEtapa = () => {
    if (!ultimaEtapa) {
      setEtapaAtual((etapa) => etapa + 1);
    }
  };
  const voltarEtapa = () => {
    if (etapaAtual > 0) {
      setEtapaAtual((etapa) => etapa - 1);
    }
  };

  const cancelar = () => router.push(ROTA_LISTAGEM_CARGOS_BASE);

  return (
    <FormProvider {...form}>
      <PageHeader
        showBackButton={false}
        title="Cadastrar cargo base"
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Gestão", href: ROTA_LISTAGEM_CARGOS_BASE },
          { title: "Cargos base", href: ROTA_LISTAGEM_CARGOS_BASE },
          { title: "Cadastrar cargo base", href: "" },
        ]}
        createButton={
          <>
            <Button
              size="lg"
              type="button"
              variant="default"
              data-testid="btn-cancelar"
              onClick={cancelar}
            >
              <span className="font-bold">Cancelar</span>
            </Button>
            <Button
              size="lg"
              type="button"
              variant="default"
              data-testid="btn-anterior"
              onClick={voltarEtapa}
              disabled={etapaAtual === 0}
            >
              <span className="font-bold">Anterior</span>
            </Button>
            <Button
              size="lg"
              type="button"
              variant="destructive"
              data-testid="botao-proximo"
              onClick={avancarEtapa}
              disabled={ultimaEtapa}
            >
              <span className="font-bold">Próximo</span>
            </Button>
          </>
        }
      />

      <FundoBranco className="mb-4 mt-8">
        <form onSubmit={form.handleSubmit(onSubmitForm)}>
          <Steps
            current={etapaAtual}
            items={ETAPAS.map((etapa) => ({ title: etapa.title }))}
            className="pb-8"
          />

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-[60%]">
              <div className="pb-6">
                <p className="text-[20px] font-bold pt-1 pb-1">{ETAPAS[etapaAtual].title}</p>
                <p className="text-[14px] font-normal pt-1">Dados de identificação e classificação funcional.</p>
              </div>

              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="grupamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="required text-[#313131] font-bold">Grupamento</FormLabel>
                      <FormControl>
                        <Combobox
                          placeholder="Selecione"
                          data-testid="select-grupamento"
                          value={field.value ?? ""}
                          options={CargosBaseGrupamento.map((item) => ({
                            value: item.codigo,
                            label: item.nome,
                          }))}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage showBlankSpace={false} />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="situacao_funcional"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="required text-[#313131] font-bold">Situação funcional</FormLabel>
                        <FormControl>
                          <Combobox
                            placeholder="Selecione"
                            data-testid="select-situacao-funcional"
                            value={field.value ?? ""}
                            options={SituacaoFuncionalOpcoes.map((item) => ({
                              value: item.codigo,
                              label: item.nome,
                            }))}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage showBlankSpace={false} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="required text-[#313131] font-bold">Status</FormLabel>
                        <FormControl>
                          <Combobox
                            placeholder="Selecione"
                            data-testid="select-status"
                            value={field.value ?? ""}
                            options={StatusOpcoes.map((item) => ({
                              value: item.codigo,
                              label: item.nome,
                            }))}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage showBlankSpace={false} />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="provimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="required text-[#313131] font-bold">Provimento</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value ?? ""}
                          onChange={(event) => field.onChange(event.target.value)}
                          placeholder="Digite o provimento do cargo..."
                          data-testid="input-provimento"
                        />
                      </FormControl>
                      <FormMessage showBlankSpace={false} />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="w-full lg:w-[40%] pl-0 lg:pl-8">
              <div className="rounded-lg border border-gray-200 p-4 flex items-center justify-between gap-4">
                <span className="text-[14px]" data-testid="cargo-selecionado">
                  {isLoadingCargosBase
                    ? "Carregando cargo..."
                    : `Cargo: ${codigoCargo || "-"}${descricaoCompleta ? ` - ${descricaoCompleta}` : ""}`}
                </span>
                <Tooltip title="Aparece em listagens e resumos." placement="left">
                  <InfoCircleOutlined style={{ color: "#B22B2A" }} />
                </Tooltip>
              </div>
            </div>
          </div>
        </form>
      </FundoBranco>
    </FormProvider>
  );
}
