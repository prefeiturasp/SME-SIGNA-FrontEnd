"use client";
import FieldsBase, {  InputFieldType, TextareaFieldType } from "./FieldsBase";

interface Props {
  isLoading?: boolean;
  tipo_portaria: "designacao" | "cessacao";
  showTextoParaApostila?: boolean;
  labelPortaria?: string;
}

const PortariaAnularApostilaFields = ({ isLoading, tipo_portaria, showTextoParaApostila=true, labelPortaria }: Props) => {

  const inputFields: InputFieldType[] = [
    {
      name: "apostila_insubsistencia.portaria",
      label: labelPortaria ?? "Portaria da apostila da "+tipo_portaria,
      placeholder: "0000",
      type: "number",
      disabled: false,
     },
    {
      name: "apostila_insubsistencia.ano",
      label: "Ano Vigente",
      placeholder: "Exemplo: 2026",
      type: "number",
      disabled: false,
      maxLength: 4,
    },
    {
      name: "apostila_insubsistencia.numero_sei",
      label: "Nº SEI",
      placeholder: "0000.0000/0000000-0",
      type: "string",
      mask: "9999.9999/9999999-9",
      disabled: false,
    },
 
  ];

  const dateFields: InputFieldType[] = [
    {
      name: "apostila_insubsistencia.doc",
      label: "D.O",
      placeholder: "Selecione a data",
      type: "date",
      disabled: false,
    },
  ];

  

  const textareaFields: TextareaFieldType[] = [
    ...(showTextoParaApostila ? [ 
      {
        name: "apostila_insubsistencia.texto_para_apostila",
        label: "Texto para apostila",
        placeholder: "Digite um texto da apostila...",
      },
    ] : []),
    {
      name: "apostila_insubsistencia.observacao",
      label: "Observações",
      placeholder: "Digite as informações adicionais...",
    },
  ];

  return (    
      <FieldsBase 
        isLoading={isLoading}
        inputFields={inputFields}
        textareaFields={textareaFields}
        dateFields={dateFields}
      />
  );
};

export default PortariaAnularApostilaFields;