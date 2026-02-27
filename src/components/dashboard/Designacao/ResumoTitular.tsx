"use client";
import React, { useState } from "react";
import { InfoItem } from "./ResumoDesignacaoServidorIndicado";
import { Button } from "@/components/ui/button";
import Edit from "@/assets/icons/Edit";
import ModalEditarServidor from "./ModalEditarServidor/ModalEditarServidor";

export interface TitularData {
  nome: string;
  nome_civil?: string;
  rf: string;
  vinculo_cargo_sobreposto: number;
  cargo_sobreposto: string;
  lotacao_cargo_sobreposto: string;
  codigo_hierarquia: string;
  funcao_atividade?: string;
  laudo_medico?: string;
  cargo_base?: string;
  lotacao_cargo_base: string;
  codigo_estrutura_hierarquica?: string;
}

const ResumoTitular: React.FC<{ data: TitularData; onEdit: () => void }> = ({ data, onEdit }) => {
  const [openModalEditar, setOpenModalEditar] = useState(false);

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
        <Button type="button" variant="outline" onClick={() => setOpenModalEditar(true)} className="gap-2">
          <span className="font-bold">Editar</span>
          <Edit />
        </Button>
      </div>

      <ModalEditarServidor
        isLoading={false}
        open={openModalEditar}
        onOpenChange={setOpenModalEditar}
        defaultValues={data as any}
      />
    </div>
  );
};

export default ResumoTitular;