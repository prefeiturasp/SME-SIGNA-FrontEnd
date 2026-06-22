import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtosAdministrativosPaginada, ListagemPortariasResponse, PortariasDOFiltros } from "@/types/designacao";
import filterFormSchemaFiltroDO, { filterFormSchemaFiltroDOData } from "../components/dashboard/Designacao/FiltroDeDo/filterFormSchemaFiltroDO";
import { fetchAtosAdministrativos, fetchPortariasDO } from "@/actions/designacao";



export function useAtosAdministrativos() {

  const [resultado, setResultado] = useState<AtosAdministrativosPaginada | null>(null);
  const [salvando, setSalvando] = useState(false); 
  const [tabelaKey, setTabelaKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  console.log("resultado", resultado);
  const [page, setPage] = useState(1);


  const onPageChange = (newPage: number) => {
    buscar(filterForm.getValues(), newPage);
  };
  const filterForm = useForm<filterFormSchemaFiltroDOData>({
    resolver: zodResolver(filterFormSchemaFiltroDO),
    defaultValues: {
      numero_sei: "",
      portaria_inicial: "",
      portaria_final: "",
      ano: new Date().getFullYear().toString(),
      tipo: "",
    },
    mode: "onChange",
  });


  const portariaInicial = filterForm.watch("portaria_inicial");
  const portariaFinal = filterForm.watch("portaria_final");

  useEffect(() => {
    filterForm.trigger(["portaria_inicial", "portaria_final"]);
  }, [portariaInicial, portariaFinal, filterForm]);

  const generateDesignacaoFiltros = (
    values: filterFormSchemaFiltroDOData
  ) => {

    return {
      numero_sei: values.numero_sei,
      portaria_inicial: values.portaria_inicial,
      portaria_final: values.portaria_final,
      ano: values.ano,
      tipo: values.tipo,
    };
  };

  const buscarPortarias = async (
    values: PortariasDOFiltros,
    page?: number,
  ) => {
    const filtros = {
      ...generateDesignacaoFiltros(values),
    };
     return fetchAtosAdministrativos({ ...filtros, page: page ?? 1 });
  };

  const buscar = (values: PortariasDOFiltros, page = 1) => {
    startTransition(async () => {
      const response = await buscarPortarias(values, page);
      if (response.success) {
        setResultado(response.data);
        setPage(page);
      } else {
        console.error(response.error);
      }
    });
  };

   

  const handleClear = () => {
    filterForm.reset({
      numero_sei: "",
      portaria_inicial: "",
      portaria_final: "",
      ano: new Date().getFullYear().toString(),
      tipo: "",
    });

    buscar(
      {
        numero_sei: "",
        portaria_inicial: "",
        portaria_final: "",
        ano: new Date().getFullYear().toString(),
        tipo: "",
      },

    );
  };


  useEffect(() => {
    buscar(filterForm.getValues());
  }, []);

  const onSubmitFilterForm = (values: filterFormSchemaFiltroDOData) => {
    buscar(values, 1);
  };

  return {
    resultado,
    salvando,
    setSalvando,
    tabelaKey,
    setTabelaKey,
    isPending,
    filterForm,
    buscar,
    buscarPortarias,
    onSubmitFilterForm,
    handleClear,
    onPageChange,
    page,
  };
}