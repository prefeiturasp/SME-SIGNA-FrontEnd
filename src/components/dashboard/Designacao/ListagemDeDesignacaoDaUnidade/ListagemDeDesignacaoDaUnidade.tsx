'use client'
 
import { ListagemAtosAdministrativosResponse } from '@/types/designacao';
import { SimpleTag } from '../ListagemDeAtosAdministrativos/ListagemDeAtosAdministrativos';
import DesignacaoCard from '@/app/pages/historico-ato-administrativo/components/DesignacaoCard';
import { IAtosAdministrativosPrincipalType } from '@/app/pages/historico-ato-administrativo/components/AtosRelacionados';
 

 
 
 
interface ListagemDeAtosAdministrativosProps {
  data?: ListagemAtosAdministrativosResponse[];
  isLoading?: boolean;
  ue?: string;
  titulo?: string;
  subtitulo?: string;
}

const ListagemDeDesignacaoDaUnidade: React.FC<ListagemDeAtosAdministrativosProps> = ({
  ue,
  titulo,
  subtitulo,  
  isLoading = false,
}) => {

  
  const mockListaDeAtosPrincipais: IAtosAdministrativosPrincipalType[] = [
    {
      id: 1,
      tipo_ato_display: "Apostila",
      realizada_em: "03/04/2026",
      data_cessacao: null,
      status: "EM_VIGENCIA",
      numero_portaria: "7625148/2026",
      cargo_display: "Professor",
      nome_servidor_indicado: "João da Silva",
      nome_social_servidor_indicado: "",
      
      atos_relacionados: [
        {
          id: 1,
          data: "03/04/2026",
          portaria: "7625148/2026",
          titulo: "Apostila",
          descricao: "Alteração de período informado na portaria.",
          principal: true,
          esta_vigente: true,
        },
        {
          id: 2,
          data: "03/04/2026",
          portaria: "7625148/2026",
          titulo: "Apostila",
          descricao: "Alteração de período informado na portaria.",
          principal: false,
          esta_vigente: false,
        },
      ]         

    },
    {
      id: 2,
      tipo_ato_display: "Apostila",
      realizada_em: "03/04/2026",
      data_cessacao: "03/04/2026",
      status: "CESSADA",
      numero_portaria: "7625148/2026",
      cargo_display: "Professor",
      nome_servidor_indicado: "João da Silva",
      nome_social_servidor_indicado: "",
      atos_relacionados: [
        {
          id: 5,
          data: "03/04/2026",
          portaria: "7625148/2026",
          titulo: "Apostila",
          descricao: "Alteração de período informado na portaria.",
          principal: true,
          esta_vigente: true,
        },
        {
          id: 6,
          data: "03/04/2026",
          portaria: "7625148/2026",
          titulo: "Apostila",
          descricao: "Alteração de período informado na portaria.",
          principal: false,
          esta_vigente: false,
        },
      ],

    }
  ]

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
        {mockListaDeAtosPrincipais.length > 0
         && (
          mockListaDeAtosPrincipais.map((ato) => (
            <DesignacaoCard key={ato.id} ato={ato} isLoading={isLoading} />
          ))          
        )}
      </div>
    </div>
  );
};

export default ListagemDeDesignacaoDaUnidade;