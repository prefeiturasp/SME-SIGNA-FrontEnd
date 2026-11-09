"use client";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";

export default function GestaoDeAcessos() {
  return (
    <>
      <PageHeader
        showBackButton={false}
        title="Gestão de acessos"
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Gestão", href: "/pages/gestao/gestao-de-acessos" },
          { title: "Gestão de acessos" },
        ]}
      />

      <FundoBranco className="mb-4 mt-8">
        <p className="text-[20px] font-bold pt-1 pb-1">Gestão de acessos</p>
        <p className="text-[14px] font-normal pt-1">
          Consulte e gerencie os acessos dos usuários ao sistema.
        </p>
      </FundoBranco>
    </>
  );
}
