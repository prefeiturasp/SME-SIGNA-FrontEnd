import { CustomAccordionItem } from "@/components/dashboard/Designacao/CustomAccordionItem";
import ResumoDesignacaoServidorIndicado from "@/components/dashboard/Designacao/ResumoDesignacaoServidorIndicado";
import ResumoPortariaDesigacao from "@/components/dashboard/Designacao/ResumoPortariaDesigacao";
import ResumoPortariaCessacao from "@/components/dashboard/Designacao/ResumoPortariaCessacao";
import { Servidor } from "@/types/designacao-unidade";
import { Cessacao } from "@/types/designacao";
import { PortariaDesignacao } from "@/types/portaria-designacao";
import { FormEditarServidorData } from "@/components/dashboard/Designacao/ModalEditarServidor/schema";

type Props = {
  dadosIndicado: Servidor | null;
  dadosPortaria: PortariaDesignacao | null;
  dadosPortariaCessacao: Cessacao | null;
  onSubmitEditarServidor?: (data: FormEditarServidorData) => void;
  showExtraFields?: boolean;
  showCursosTitulos?: boolean;
  showLotacao?: boolean;
  showCategoria?: boolean;
  showCessacao?: boolean;
  showCessacaoExtraFields?: boolean;
};

function BlocosDesignacao({
  dadosIndicado,
  dadosPortaria,
  dadosPortariaCessacao,
  onSubmitEditarServidor,
  showExtraFields = false,
  showCursosTitulos = false,
  showLotacao = false,
  showCategoria = true,
  showCessacao = true,
  showCessacaoExtraFields = false,
}: Readonly<Props>) {
  return (
    <>
      <CustomAccordionItem
        title="Dados do servidor indicado"
        value="servidor-indicado"
        color="gold"
      >
        {dadosIndicado && (
          <ResumoDesignacaoServidorIndicado
            defaultValues={dadosIndicado}
            onSubmitEditarServidor={
              onSubmitEditarServidor ?? (() => {})
            }
            showCursosTitulos={showCursosTitulos}
            showLotacao={showLotacao}
            showCategoria={showCategoria}
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
            showExtraFields={showExtraFields}
          />
        )}
      </CustomAccordionItem>

      {showCessacao && (  
      <CustomAccordionItem
        title="Portarias de Cessação"
        value="portarias-cessacao"
        color="green"
      >
        {dadosPortariaCessacao ? (
          <ResumoPortariaCessacao
            defaultValues={dadosPortariaCessacao}
            showExtraFields={showCessacaoExtraFields}
          />
        ) : (
          <div className="text-center text-[#777] p-4">
            Não há portaria de cessão
          </div>
        )}
      </CustomAccordionItem>
     )}
    </>
  );
}

export default BlocosDesignacao;