'use client'
 
import { SimpleTag } from '../ListagemDeAtosAdministrativos/ListagemDeAtosAdministrativos';
import DesignacaoCard from '@/app/pages/historico-ato-administrativo/components/DesignacaoCard';
import { IAtosAdministrativosPrincipalType } from '@/app/pages/historico-ato-administrativo/components/AtosRelacionados';
 
interface ListagemDeDesignacaoDaUnidadeProps {
  data?: IAtosAdministrativosPrincipalType[];
  isLoading?: boolean;
  ue?: string;
  titulo?: string;
  subtitulo?: string;
}

const ListagemDeDesignacaoDaUnidade: React.FC<ListagemDeDesignacaoDaUnidadeProps> = ({
  data = [],
  ue,
  titulo,
  subtitulo,  
  isLoading = false,
}) => {
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
        {isLoading && data.length === 0 && (
          <p className="listagem-designacao-unidade-vazio">Carregando designações…</p>
        )}

        {!isLoading && data.length === 0 && (
          <p className="listagem-designacao-unidade-vazio">Nenhuma designação encontrada para esta unidade.</p>
        )}

        {data.map((ato) => (
          <DesignacaoCard key={ato.id} ato={ato} isLoading={isLoading} />
        ))}
      </div>
    </div>
  );
};

export default ListagemDeDesignacaoDaUnidade;
