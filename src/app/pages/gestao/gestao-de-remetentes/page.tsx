"use client";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import SimpleTableHeader from "@/components/dashboard/SimpleTableHeader/SimpleTableHeader";

export default function GestaoDeRemetentes() {
  return (
    <>
      <PageHeader
        showBackButton={false}
        title="Gestão de remetentes"
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Gestão", href: "/" },
          { title: "Gestão de remetentes", href: "" },
        ]}
      />

      <FundoBranco className="mb-4 mt-8">
        <SimpleTableHeader
          title="Gestão de remetentes"
          subtitle="Consulte e gerencie os remetentes utilizados no sistema."
        />
      </FundoBranco>
    </>
  );
}
