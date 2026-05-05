"use client";
import React, { useState } from "react";
import { InfoItem } from "@/components/ui/info-item";
import { Button } from "@/components/ui/button";
import Edit from "@/assets/icons/Edit";
import ModalEditarServidor from "./ModalEditarServidor/ModalEditarServidor";
import { FormEditarServidorData } from "./ModalEditarServidor/schema";
import { Servidor } from "@/types/designacao-unidade";


const ResumoTitular: React.FC<{
  data: Servidor;
  onSubmitEditarServidor: (data: FormEditarServidorData) => void;
  showLocalDeServico?: boolean;
}> = ({ data, onSubmitEditarServidor, showLocalDeServico = false }) => {
  const [openModalEditar, setOpenModalEditar] = useState(false);
  function handleSubmitEditarServidor(data: FormEditarServidorData) {
    onSubmitEditarServidor(data);
  }
  return (
    <div className="w-full bg-[#FAFAFA] p-4 flex flex-col gap-6">
      <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <InfoItem label="Nome Servidor" value={data.nome_servidor} />
        <InfoItem label="Nome Civil" value={data.nome_civil} />
        <InfoItem label="RF" value={data.rf} />
        <InfoItem label="Vínculo" value={String(data.vinculo)} />
        <InfoItem label="Cargo Base" value={data.cargo_base} />
        <InfoItem label="Lotação" value={data.lotacao} />
        <InfoItem label="Laudo Médico" value={data.laudo_medico} />
        {showLocalDeServico && (
          <InfoItem
            label="Local de serviço"
            value={data.local_de_servico}
          />
        )}
        <InfoItem label="Cargo Sobreposto/Função Atividade" value={data.cargo_sobreposto_funcao_atividade} />
        <InfoItem label="Local de Exercício" value={data.local_de_exercicio} />
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
        defaultValues={data}
        handleSubmitEditarServidor={handleSubmitEditarServidor}
      />
    </div>
  );
};

export default ResumoTitular;