"use client";
import { useState, useTransition, useEffect, useMemo } from "react";
import ListagemDeDesignacoes from "@/components/dashboard/Designacao/ListagemDeDesignacoes/ListagemDeDesignacoes";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Button } from '@/components/ui/button';
import Designacao from "@/assets/icons/Designacao";
import FiltroDeDesignacoes from "@/components/dashboard/Designacao/FiltroDeDesignacoes/FiltroDeDesignacoes";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DesignacaoPaginada } from "@/types/designacao";
import Filter from "@/assets/icons/Alert";
import formSchemaFiltroDesignacao, { formSchemaFiltroDesignacaoData } from "./schema";
import { fetchDesignacoesAction } from "@/actions/designacao";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useFetchDREs, useFetchUEs } from "@/hooks/useUnidades";

export default function DesignacoesPasso1() {
  const [resultado, setResultado] = useState<DesignacaoPaginada | null>(null);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<formSchemaFiltroDesignacaoData>({
    resolver: zodResolver(formSchemaFiltroDesignacao),
    defaultValues: {
      rf: "",
      nome_servidor: "",
      periodo: undefined,
      cargo_base: "",
      cargo_sobreposto: "",
      dre: "",
      unidade_escolar: "",
      ano: "",
    },
    mode: "onChange",
  });

  const dreValue = form.watch("dre");

  const { data: dreOptions = [] } = useFetchDREs();

  const dreCodigoParaUEs = useMemo(() => {
    const found = dreOptions.find(
      (dre: { codigoDRE: string; nomeDRE: string }) => dre.nomeDRE === dreValue
    );
    return found?.codigoDRE ?? "";
  }, [dreValue, dreOptions]);

  const { data: ueOptions = [] } = useFetchUEs(dreCodigoParaUEs);

  const buscar = (values: formSchemaFiltroDesignacaoData, currentPage = 1) => {
     startTransition(async () => {
       const ueSelecionada = ueOptions.find(
        (ue: { codigoEscola: string; nomeEscola: string }) => ue.codigoEscola === values.unidade_escolar
      );

      const response = await fetchDesignacoesAction({
        rf: values.rf,
        nome: values.nome_servidor,
        periodo_after: values.periodo?.from ? format(values.periodo.from, "yyyy-MM-dd") : undefined,
        periodo_before: values.periodo?.to ? format(values.periodo.to, "yyyy-MM-dd") : undefined,
        cargo_base: values.cargo_base,
        cargo_sobreposto: values.cargo_sobreposto,
        dre: values.dre,
        unidade: ueSelecionada?.nomeEscola ?? values.unidade_escolar,
        ano: values.ano,
        page: currentPage,
        page_size: 10,
      });

      if (response.success) {

        setResultado(response.data);
        setPage(currentPage);
      } else {
        console.error(response.error);
      }
    });
  };

  useEffect(() => {
    buscar(form.getValues(), 1);
  }, []);

  const onSubmit = (values: formSchemaFiltroDesignacaoData) => {
    buscar(values, 1);
  };

  const onPageChange = (newPage: number) => {
    buscar(form.getValues(), newPage);
  };

  const handleClear = () => {
    form.reset({
      rf: "",
      nome_servidor: "",
      periodo: undefined,
      cargo_base: "",
      cargo_sobreposto: "",
      dre: "",
      unidade_escolar: "",
      ano: "",
    });

    buscar(
      {
        rf: "",
        nome_servidor: "",
        periodo: undefined,
        cargo_base: "",
        cargo_sobreposto: "",
        dre: "",
        unidade_escolar: "",
        ano: "",
      },
      1
    );
  };

  return (
    <>
      <PageHeader
        title={''}
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Designação" },
        ]}
        icon={
          <div className="flex justify-start">
            <Button
              className="gap-2 rounded-full text-[#660C0B] border-[#660C0B]"
              type="button"
              variant="default"
              size="sm"
            >
              <Filter />
              <span className="font-bold">Filtros</span>
            </Button>
          </div>
        }
        showBackButton={false}
        createButton={
          <Button
            className="gap-2 px-4"
            type="button"
            variant="destructive"
            size="lg"
            onClick={() => router.push("/pages/designacoes/designacoes-passo-1")}
          >
            <span className="font-bold">Iniciar Nova Designação</span>
            <Designacao width={20} height={20} fill="white" />
          </Button>
        }
      />

      <FundoBranco className="mb-4">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FiltroDeDesignacoes onClear={handleClear} />
          </form>
        </FormProvider>
      </FundoBranco>

      <ListagemDeDesignacoes
        data={resultado?.results ?? []}
        isLoading={isPending}
        total={resultado?.count ?? 0}
        page={page}
        onPageChange={onPageChange}
      />
    </>
  );
}