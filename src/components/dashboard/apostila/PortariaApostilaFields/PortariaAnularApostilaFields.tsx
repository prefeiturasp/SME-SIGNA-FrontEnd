"use client";
import FieldsBase, {  InputFieldType, TextareaFieldType } from "./FieldsBase";

interface Props {
  isLoading?: boolean;
  tipo_portaria: "designacao" | "cessacao";
}

const PortariaAnularApostilaFields = ({ isLoading, tipo_portaria }: Props) => {

  const inputFields: InputFieldType[] = [
    {
      name: "apostila.portaria",
      label: "Portaria da apostila da "+tipo_portaria,
      placeholder: "0000/2026",
      type: "number",
      disabled: false,
     },
    {
      name: "apostila.ano",
      label: "Ano Vigente",
      placeholder: "Ano Vigente",
      type: "number",
      disabled: false,
      maxLength: 4,
    },
    {
      name: "apostila.numero_sei",
      label: "Nº SEI",
      placeholder: "Número SEI",
      type: "string",
      mask: "9999.9999/9999999-9",
      disabled: false,
    },
    {
      name: "apostila.doc",
      label: "D.O",
      placeholder: "D.O",
      disabled: false,
      type: "number",
    },
  ];

  const textareaFields: TextareaFieldType[] = [
    {
      name: "apostila.texto_para_apostila",
      label: "Texto para apostila",
      placeholder: "Digite um texto da apostila...",
    },
    {
      name: "apostila.observacao",
      label: "Observações",
      placeholder: "Digite as informações adicionais...",
    },
  ];

  return (    
      <FieldsBase 
        isLoading={isLoading}
        inputFields={inputFields}
        textareaFields={textareaFields}
      />
  );
};

export default PortariaAnularApostilaFields;