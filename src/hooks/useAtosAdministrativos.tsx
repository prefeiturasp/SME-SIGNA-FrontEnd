import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtosAdministrativosFiltros, AtosAdministrativosPaginada } from "@/types/designacao";
import { fetchAtosAdministrativos } from "@/actions/designacao";
import filterFormSchemaFiltroAtosAdministrativos, { filterFormSchemaFiltroAtosAdministrativosData } from "@/components/dashboard/Designacao/FiltroDeAtosAdministrativos/filterFormSchemaFiltroAtosAdministrativos";
import { format } from "date-fns";


const defaultValuesFilters: AtosAdministrativosFiltros = {
  tipo: "DESIGNACAO",
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
};

export function useAtosAdministrativos(defaultValues: AtosAdministrativosFiltros = defaultValuesFilters) {

  const [resultado, setResultado] = useState<AtosAdministrativosPaginada | null>(null);
  const [salvando, setSalvando] = useState(false); 
  const [tabelaKey, setTabelaKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const filterForm = useForm<filterFormSchemaFiltroAtosAdministrativosData>({
    resolver: zodResolver(filterFormSchemaFiltroAtosAdministrativos),
    defaultValues: {...defaultValues},
    mode: "onChange",
  });


  const onPageChange = (newPage: number) => {
    buscar(filterForm.getValues(), newPage);
  };
  
  const generateDesignacaoFiltros = (
    values: filterFormSchemaFiltroAtosAdministrativosData
  ) => {
    const periodoFrom = values.periodo?.from;
    const periodoTo = values.periodo?.to;

    return {
      ato_id: defaultValues.ato_id ?? undefined,      
      numero_sei: values.numero_sei,
      portaria: values.portaria,
      tipo: values.tipo,
      nome_titular_e_indicado: values.nome_titular_e_indicado,
      status_publicacao: values.status_publicacao,
      periodo_after: periodoFrom
        ? format(periodoFrom, "yyyy-MM-dd")
        : undefined,
      periodo_before: periodoTo
        ? format(periodoTo, "yyyy-MM-dd")
        : undefined,
      rf: values.rf,
      observacao: values.observacao,
    };
  };

  const buscarAtosAdministrativos = async (
    values: AtosAdministrativosFiltros,
    page?: number,
  ) => {
    const filtros = {
      ...generateDesignacaoFiltros(values),
    };

     return fetchAtosAdministrativos({ ...filtros, page: page ?? 1 });
  };

  const buscar = (values: AtosAdministrativosFiltros, page = 1) => {
    startTransition(async () => {
      const response = await buscarAtosAdministrativos(values, page);
      if (response.success) {        
        setPage(page);
        setResultado(response.data);
      } else {
        console.error(response.error);
      }
    });
  };

   

  const handleClear = () => {

    filterForm.reset(defaultValues);

    buscar(defaultValues);
  };


  const onSubmitFilterForm = (values: filterFormSchemaFiltroAtosAdministrativosData) => {
    buscar(values, 1);
  };

  useEffect(() => {
    buscar(filterForm.getValues());
  }, []);


  return {
    handleClear,
    onPageChange,
    page,
    resultado,
    salvando,
    setSalvando,
    tabelaKey,
    setTabelaKey,
    isPending,
    filterForm,
    buscar,
    buscarAtosAdministrativos,
    onSubmitFilterForm,

  };
}