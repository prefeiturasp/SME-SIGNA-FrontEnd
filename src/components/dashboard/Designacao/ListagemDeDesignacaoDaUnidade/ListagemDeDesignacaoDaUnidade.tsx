'use client'
 
import { ListagemAtosAdministrativosResponse } from '@/types/designacao';
import { SimpleTag } from '../ListagemDeAtosAdministrativos/ListagemDeAtosAdministrativos';
import DesignacaoCard from '@/app/pages/historico-ato-administrativo/components/DesignacaoCard';
 

 
 
 
interface ListagemDeAtosAdministrativosProps {
  data: ListagemAtosAdministrativosResponse[];
  isLoading?: boolean;
  ue?: string;
  titulo?: string;
  subtitulo?: string;
}

const ListagemDeDesignacaoDaUnidade: React.FC<ListagemDeAtosAdministrativosProps> = ({
  ue,
  titulo,
  subtitulo,
  data,
  isLoading = false,
}) => {

  const atos = [
    {
      id: 1,
      data: "03/04/2026",
      portaria: "7625148/2026",
      titulo: "Apostila",
      descricao: "Alteração de período informado na portaria.",
      principal: true,
    },
    {
      id: 2,
      data: "03/04/2026",
      portaria: "7625148/2026",
      titulo: "Apostila",
      descricao: "Alteração de período informado na portaria.",
      principal: false,
    },
  ];

  return (
    <div className="listagem-designacao-unidade">
      <div className="listagem-designacao-unidade-cabecalho">
        <div>
          <p className="listagem-designacao-unidade-titulo">{titulo}</p>
          <p className="listagem-designacao-unidade-subtitulo">{subtitulo}</p>
        </div>

        <div className="listagem-designacao-unidade-ue">
          {ue && (
            <SimpleTag titulo="Unidade Educacional" valor={ue} />
          )}
        </div>
      </div>

      <div className="listagem-designacao-unidade-corpo">
        {data && (
          <DesignacaoCard atos={atos} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default ListagemDeDesignacaoDaUnidade;