import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fetchHistoricoDeDesignacoes } from "@/actions/designacao";
import filterFormSchemaFiltroAtosAdministrativos, {
  filterFormSchemaFiltroAtosAdministrativosData,
} from "@/components/dashboard/Designacao/FiltroDeAtosAdministrativos/filterFormSchemaFiltroAtosAdministrativos";
import { AtosAdministrativosFiltros } from "@/types/designacao";
import {
  DesignacaoHistorico,
  HistoricoDeDesignacoesFiltros,
} from "@/types/historico-designacoes";

const defaultValuesFilters: AtosAdministrativosFiltros = {
  tipo: "TODOS",
  cargo: "TODOS",
  portaria: "",
  numero_sei: "",
  nome_titular_e_indicado: "",
  status_publicacao: "",
  periodo: {
    from: undefined,
    to: undefined,
  },
  periodo_before: "",
  rf: "",
  observacao: "",
};

export function useHistoricoDeDesignacoes(
  codigoUe: string,
  defaultValues: AtosAdministrativosFiltros = defaultValuesFilters
) {
  const [resultado, setResultado] = useState<DesignacaoHistorico[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [tabelaKey, setTabelaKey] = useState(0);

  const filterForm = useForm<filterFormSchemaFiltroAtosAdministrativosData>({
    resolver: zodResolver(filterFormSchemaFiltroAtosAdministrativos),
    defaultValues: { ...defaultValues },
    mode: "onChange",
  });

  const gerarFiltros = (
    values: filterFormSchemaFiltroAtosAdministrativosData
  ): HistoricoDeDesignacoesFiltros => {
    const periodoFrom = values.periodo?.from;
    const periodoTo = values.periodo?.to;

    return {
      cargo: values.cargo === "TODOS" ? undefined : values.cargo,
      tipo: values.tipo === "TODOS" ? undefined : values.tipo,
      portaria: values.portaria,
      numero_sei: values.numero_sei,
      nome_titular_e_indicado: values.nome_titular_e_indicado,
      status_publicacao: values.status_publicacao,
      periodo_after: periodoFrom ? format(periodoFrom, "yyyy-MM-dd") : undefined,
      periodo_before: periodoTo ? format(periodoTo, "yyyy-MM-dd") : undefined,
      rf: values.rf,
      observacao: values.observacao,
    };
  };

  const buscarHistoricoDeDesignacoes = async (
    values: filterFormSchemaFiltroAtosAdministrativosData,
    ue: string = codigoUe
  ) => {
    return fetchHistoricoDeDesignacoes(ue, gerarFiltros(values));
  };

  const buscar = (
    values: filterFormSchemaFiltroAtosAdministrativosData,
    ue: string = codigoUe
  ) => {
    if (!ue) {
      setResultado([]);
      return;
    }

    startTransition(async () => {
      const response = await buscarHistoricoDeDesignacoes(values, ue);

      if (response.success) {
        setResultado(response.data);
        setTabelaKey((current) => current + 1);
      } else {
        console.error(response.error);
      }
    });
  };

  const handleClear = () => {
    filterForm.reset(defaultValues);

    buscar(defaultValues);
  };

  const onSubmitFilterForm = (
    values: filterFormSchemaFiltroAtosAdministrativosData
  ) => {
    buscar(values);
  };

  useEffect(() => {
    buscar(filterForm.getValues(), codigoUe);
    // A busca inicial deve rodar apenas quando a unidade muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigoUe]);

  return {
    handleClear,
    resultado,
    tabelaKey,
    setTabelaKey,
    isPending,
    filterForm,
    buscar,
    buscarHistoricoDeDesignacoes,
    onSubmitFilterForm,
  };
}
