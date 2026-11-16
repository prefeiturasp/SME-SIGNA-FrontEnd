"use client";

import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import SimpleTableHeader from "@/components/dashboard/SimpleTableHeader/SimpleTableHeader";

export default function GestaoDeAcessos() {
  return (
    <>
      <PageHeader
        showBackButton={false}
        title="Gestão de acessos"
        breadcrumbs={[
          { title: "Início", href: "/" },
          { title: "Gestão", href: "/" },
          { title: "Gestão de acessos", href: "" },
        ]}
      />

      <FundoBranco className="mb-4 mt-8">
        <SimpleTableHeader
          title="Gestão de acessos"
          subtitle="Consulte e gerencie os acessos dos usuários ao sistema."
        />
      </FundoBranco>
    </>
  );
}
