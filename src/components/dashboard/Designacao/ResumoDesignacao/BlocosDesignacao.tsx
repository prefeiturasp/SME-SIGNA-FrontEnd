import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import ResumoDesignacaoServidorIndicado from "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado";
import ResumoPortariaDesigacao from "@/components/dashboard/Designacao/ResumoPortariaDesigacao";
import ResumoPortariaCessacao from "@/components/dashboard/Designacao/ResumoPortariaCessacao";
import { Servidor } from "@/types/designacao-unidade";

type Props = {
  dadosIndicado: Servidor | null;
  dadosPortaria: any;
  dadosPortariaCessacao: any;
  onSubmitEditarServidor?: (data: any) => void;
};

function BlocosDesignacao({
  dadosIndicado,
  dadosPortaria,
  dadosPortariaCessacao,
  onSubmitEditarServidor,
}: Readonly<Props>) {
  return (
    <>
      <CustomAccordionItem
        title="Servidor indicado"
        value="servidor-indicado"
        color="gold"
      >
        {dadosIndicado && (
          <ResumoDesignacaoServidorIndicado
            defaultValues={dadosIndicado}
            onSubmitEditarServidor={
              onSubmitEditarServidor ?? (() => {})
            }
          />
        )}
      </CustomAccordionItem>

      <CustomAccordionItem
        title="Portaria de designação"
        value="portaria-designacao"
        color="purple"
      >
        {dadosPortaria && (
          <ResumoPortariaDesigacao
            defaultValues={dadosPortaria}
            showExtraFields={false}
          />
        )}
      </CustomAccordionItem>

      <CustomAccordionItem
        title="Portarias de Cessação"
        value="portarias-cessacao"
        color="green"
      >
        {dadosPortariaCessacao ? (
          <ResumoPortariaCessacao
            defaultValues={dadosPortariaCessacao}
          />
        ) : (
          <div className="text-center text-[#777] p-4">
            Não há portaria de cessão
          </div>
        )}
      </CustomAccordionItem>
    </>
  );
}

export default BlocosDesignacao;