import FormDesignacao from "@/components/dashboard/Designacao/FormDesignacao";
import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import { Divider } from "antd";
import Designacao from "@/assets/icons/Designacao";

export default function Designacoes() {
  return (
    <>


      <PageHeader
        title="Designação"
        breadcrumbs={[{ title: "Início", href: "/" }, { title: "Designação" }]}
        icon={<Designacao width={24} height={24} fill="#B22B2A" />}
        showBackButton={false}
      />

      <div className="flex flex-col md:flex-row gap-8 items-stretch">
        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col self-stretch">
          <FundoBranco className="md:h-[80vh]">

            <h1 className="text-[#42474a] text-[18px] font-bold m-0">
              Pesquisa de unidade
            </h1>
            <Divider className="mt-2" />

            <FormDesignacao />
          </FundoBranco>
        </div>

        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col self-stretch h-auto md:h-[100vh]">
          <FundoBranco className="md:h-[80vh]">
            <StepperDesignacao  />
          </FundoBranco>
        </div>
      </div>
    </>
  );
}
