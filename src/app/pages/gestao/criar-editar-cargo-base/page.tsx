"use client";

import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Button } from "@/components/ui/button";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import { FormProvider } from "react-hook-form";
import FormCargosBasePrincipal from "@/components/dashboard/Gestao/FormCargosBase/FormCargosBasePrincipal";
import FormCargosBaseSecundario from "@/components/dashboard/Gestao/FormCargosBase/FormCargosBaseSecundario";
import { useCriarEditarCargosBase } from "@/hooks/useCriarEditarCargosBase";
import { CargosBaseCriarEditar, StatusCargosBase } from "@/types/gestao";



export default function CriarEditarCargoBase() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const grupamento = searchParams.get("grupamento");
  const descricao_resumida = searchParams.get("descricao_resumida");
  const descricao_completa = searchParams.get("descricao_completa");
  const situacao_funcional = searchParams.get("situacao_funcional");
  const usado_em_funcoes = searchParams.get("usado_em_funcoes");
  const usado_em_designacoes = searchParams.get("usado_em_designacoes");
  const usado_em_ste = searchParams.get("usado_em_ste");
  const usado_em_permutas = searchParams.get("usado_em_permutas");
  const cargo_base_ficticio = searchParams.get("cargo_base_ficticio");
  const status = searchParams.get("status");
  const defaultValues: CargosBaseCriarEditar = {
    grupamento: grupamento ? grupamento : "",
    descricao_resumida: descricao_resumida ? descricao_resumida : "",
    descricao_completa: descricao_completa ? descricao_completa : "",
    situacao_funcional: situacao_funcional ? situacao_funcional : "",
    usado_em_funcoes: usado_em_funcoes ? JSON.parse(usado_em_funcoes) : false,
    usado_em_designacoes: usado_em_designacoes ? JSON.parse(usado_em_designacoes) : false,
    usado_em_ste: usado_em_ste ? JSON.parse(usado_em_ste) : false,
    usado_em_permutas: usado_em_permutas ? JSON.parse(usado_em_permutas) : false,
    cargo_base_ficticio: cargo_base_ficticio ? JSON.parse(cargo_base_ficticio) : false,
    status: status as StatusCargosBase,
  };
  const {
    form,
    onSubmitForm,    
    CargosBaseOpcoes,
  } = useCriarEditarCargosBase(defaultValues, id ? Number(id) : null);
  const router = useRouter(); 

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)}>
        <PageHeader
          showBackButton={false}
          title={
            id ? "Editar cargo base" : "Cadastrar cargo base"
          }
          breadcrumbs={[
            { title: "Início", href: "/" },
            { title: "Gestão", href: "/pages/gestao/cargos-base" },
            { title: "Cargos base", href: "/pages/gestao/cargos-base" },
            { title: id ? "Editar cargo base" : "Cadastrar cargo base", href: "/" },
          ]}
          createButton={
            <div className="flex justify-end gap-2">
              <Button
                size="lg"
                type="button"
                variant="default"
                className="gap-2"
                onClick={() => router.push("/pages/gestao/cargos-base")}
                data-testid="btn-voltar"
              >
                <span className="font-bold">Cancelar</span>
              </Button>
              <Button
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                variant="destructive"
                data-testid="botao-cadastrar-cargo"
                type="submit"               
              >
                {id ? "Salvar" : "Cadastrar cargo"}
              </Button>
            </div>
          }
        />

        <div className="w-full flex flex-col lg:flex-row gap-4 mb-4 mt-8" >
          <FundoBranco className="w-full lg:w-[50%]">
            <FormCargosBasePrincipal CargosBaseOpcoes={CargosBaseOpcoes} />
          </FundoBranco>

          <FundoBranco className="w-full lg:w-[50%]">
            <FormCargosBaseSecundario/>
          </FundoBranco>
        </div>

      </form>
    </FormProvider>
  );
}
