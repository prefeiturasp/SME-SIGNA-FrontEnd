"use client";
 import FieldsBase, { InputFieldType, TextareaFieldType } from "./FieldsBase";

interface Props {
  isLoading?: boolean;
}

const PortariaApostilaFields = ({ isLoading }: Props) => {

  const inputFields: InputFieldType[] = [
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
      disabled: true,
      type: "number",
    },
  ];

  const textareaFields: TextareaFieldType[] = [
    {
      name: "apostila.observacao",
      label: "Observações",
      placeholder: "Texto",
      required: false,
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

export default PortariaApostilaFields;