import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtosAdministrativosFiltros, AtosAdministrativosPaginada } from "@/types/designacao";
import filterFormSchemaFiltroDO, { filterFormSchemaFiltroDOData } from "../components/dashboard/Designacao/FiltroDeDo/filterFormSchemaFiltroDO";
import { fetchAtosAdministrativos } from "@/actions/designacao";



export function useAtosAdministrativos() {

  const [resultado, setResultado] = useState<AtosAdministrativosPaginada | null>(null);
  const [salvando, setSalvando] = useState(false); 
  const [tabelaKey, setTabelaKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);



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


  const onPageChange = (newPage: number) => {
    buscar(filterForm.getValues(), newPage);
  };
  
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
    const values = {
      ano: new Date().getFullYear().toString(),
      tipo: "",
      portaria_final: "",
      portaria_inicial: "",
      numero_sei: "",
    };
    filterForm.reset(values);

    buscar(values);
  };


  const onSubmitFilterForm = (values: filterFormSchemaFiltroDOData) => {
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