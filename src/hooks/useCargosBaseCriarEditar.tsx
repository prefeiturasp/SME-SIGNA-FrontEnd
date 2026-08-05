import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { filterFormSchemaFiltroCargosBaseData } from "@/components/dashboard/Gestao/FiltroDeCargosBase/filterFormSchemaCargosBase";
import { CargosBaseCriarEditar } from "@/types/gestao";
import createFormSchemaCargosBase, { createFormSchemaCargosBaseData } from "@/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase";
 


const defaultValuesCreateEdit: CargosBaseCriarEditar = {
  grupamento: "",
  codigo_cargo_eol: "",
  descricao_resumida: "",
  descricao_completa: "",
  situacao_funcional: "",
  status: "",
  utilizado_para_funcoes: false,
  utilizado_para_designacoes: false,
  utilizado_para_outros: false,
  utilizado_para_ste: false,
  utilizado_para_permutas: false,
  cargo_base_ficticio: false,
};

export function useCargosBaseCriarEditar(defaultValues: CargosBaseCriarEditar = defaultValuesCreateEdit) {
  
  const CargosBaseOpcoes = [
    { codigo: '1', nome: '1234567 - Professor do Ensino Fundamental I' },
    { codigo: '2', nome: '1234568 - Professor do Ensino Fundamental II' },
    { codigo: '3', nome: '1234569 - Professor do Ensino Fundamental III' },
    { codigo: '4', nome: '1234570 - Professor do Ensino Fundamental IV' },
    { codigo: '5', nome: '1234571 - Professor do Ensino Fundamental V' },
    { codigo: '6', nome: '1234572 - Professor do Ensino Fundamental VI' },
    { codigo: '7', nome: '1234573 - Professor do Ensino Fundamental VII' },
    { codigo: '8', nome: '1234574 - Professor do Ensino Fundamental VIII' },
    { codigo: '9', nome: '1234575 - Professor do Ensino Fundamental IX' },
    { codigo: '10', nome: '1234576 - Professor do Ensino Fundamental X' },
  ]
  
  const isPending = false;

  const form = useForm<createFormSchemaCargosBaseData>({
    resolver: zodResolver(createFormSchemaCargosBase),
    defaultValues: { ...defaultValues },
    mode: "onChange",
  });
 

  const onSubmitForm = (values: createFormSchemaCargosBaseData) => {
    console.log(values);
  }; 

  return {
    CargosBaseOpcoes,
    isPending,
    form,  
    onSubmitForm,    
  };
} 