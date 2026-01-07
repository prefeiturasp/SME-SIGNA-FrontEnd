import FormDesignacao from "@/components/dashboard/Designacao/FormDesignacao";
import StepperDesignacao from "@/components/dashboard/Designacao/StepperDesignacao";
import FundoBranco from "@/components/dashboard/FundoBranco/QuadroBranco";
import QuadroUsuario from "@/components/dashboard/MeusDados/QuadroUsuario";
import PageHeader from "@/components/dashboard/PageHeader/PageHeader";
import QuadroBranco from "@/components/dashboard/QuadroBranco/QuadroBranco";

export default function Designacoes() {
  return (
    <>
      <PageHeader title="Designação" />

      <div className="flex flex-col md:flex-row gap-8 items-stretch">
        <div className="w-full md:w-2/3 flex flex-col self-stretch">
        <FundoBranco >           
            <h1 className="text-[#42474a] text-[24px] font-bold m-0">
      Pesquisa de unidade
            </h1>
          
            <FormDesignacao/>
          </FundoBranco>
        </div>

        <div className="w-full md:w-1/3 flex flex-col self-stretch">
          <FundoBranco>
            <StepperDesignacao />
          </FundoBranco>
        </div>
      </div>
    </>
  );
}
