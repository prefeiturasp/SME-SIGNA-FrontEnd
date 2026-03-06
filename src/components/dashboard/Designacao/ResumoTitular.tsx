"use client";
import React, { useState } from "react";
import { InfoItem } from "./ResumoDesignacaoServidorIndicado";
import { Button } from "@/components/ui/button";
import Edit from "@/assets/icons/Edit";
import ModalEditarServidor from "./ModalEditarServidor/ModalEditarServidor";
import { FormEditarServidorData } from "./ModalEditarServidor/schema";
import { Servidor } from "@/types/designacao-unidade";


const ResumoTitular: React.FC<{
  data: Servidor;
  onEdit: () => void;
  onSubmitEditarServidor: (data: FormEditarServidorData) => void;

}> = ({ data, onSubmitEditarServidor }) => {
  const [openModalEditar, setOpenModalEditar] = useState(false);
  function handleSubmitEditarServidor(data: FormEditarServidorData) {
    onSubmitEditarServidor(data);
  }
  return (
    <div className="w-full bg-[#FAFAFA] p-4 flex flex-col gap-6">
      <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <InfoItem label="Nome" value={data.nome} />
        <InfoItem label="Nome Civil" value={data.nome_civil} />
        <InfoItem label="RF" value={data.rf} />
        <InfoItem label="Vínculo" value={String(data.vinculo_cargo_sobreposto)} />
        <InfoItem label="Cargo Base" value={data.cargo_sobreposto} />
        <InfoItem label="Lotação" value={data.lotacao_cargo_sobreposto} />
        <InfoItem label="Laudo Médico" value={data.laudo_medico} />
        <InfoItem label="Local de Serviço" value={data.lotacao_cargo_sobreposto} />
        <InfoItem label="Cargo Sobreposto/Função Atividade" value={data.cargo_sobreposto} />
        <InfoItem label="Local de Exercício" value={data.lotacao_cargo_sobreposto} />
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={() => setOpenModalEditar(true)} className="gap-2" >
          <span className="font-bold">Editar</span>
          <Edit />
        </Button>
      </div>

      <ModalEditarServidor
        isLoading={false}
        open={openModalEditar}
        onOpenChange={setOpenModalEditar}
        defaultValues={data }
        handleSubmitEditarServidor={handleSubmitEditarServidor}
      />
    </div>
  );
};

export default ResumoTitular;