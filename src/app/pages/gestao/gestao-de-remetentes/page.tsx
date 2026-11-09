"use client";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";

export default function GestaoDeRemetentes() {
  return (
    <>
      <PageHeader
        showBackButton={false}
        title="Gestão de remetentes"
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Gestão", href: "/pages/gestao/gestao-de-remetentes" },
          { title: "Gestão de remetentes" },
        ]}
      />

      <FundoBranco className="mb-4 mt-8">
        <p className="text-[20px] font-bold pt-1 pb-1">Gestão de remetentes</p>
        <p className="text-[14px] font-normal pt-1">
          Consulte e gerencie os remetentes utilizados no sistema.
        </p>
      </FundoBranco>
    </>
  );
}
