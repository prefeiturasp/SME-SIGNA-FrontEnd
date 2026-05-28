import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ListagemPortariasResponse, PortariasDOFiltros } from "@/types/designacao";
import filterFormSchemaFiltroDO, { filterFormSchemaFiltroDOData } from "../components/dashboard/Designacao/FiltroDeDo/filterFormSchemaFiltroDO";
import { fetchPortariasDO } from "@/actions/designacao";



export function usePortariasDO() {

  const [resultado, setResultado] = useState<ListagemPortariasResponse[]>([]);
  const [salvando, setSalvando] = useState(false); 
  const [tabelaKey, setTabelaKey] = useState(0);
  const [isPending, startTransition] = useTransition();

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
  ) => {
    const filtros = {
      ...generateDesignacaoFiltros(values),
    };
     return fetchPortariasDO(filtros);
  };
  const buscar = (values: PortariasDOFiltros) => {
    startTransition(async () => {
      const response = await buscarPortarias(values);
      if (response.success) {
        setResultado(response.data);
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
    buscar(values);
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
  };
}