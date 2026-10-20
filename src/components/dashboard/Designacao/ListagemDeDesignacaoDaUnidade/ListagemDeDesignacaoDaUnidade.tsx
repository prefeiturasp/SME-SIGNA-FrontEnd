'use client'
 
import { ListagemAtosAdministrativosResponse } from '@/types/designacao';
import { SimpleTag } from '../ListagemDeAtosAdministrativos/ListagemDeAtosAdministrativos';
import AtosRelacionados from '@/app/pages/historico-ato-administrativo/components/AtosRelacionados';
 

 
 
 
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
    <div className="flex flex-col gap-1 bg-white  ">
      <div className="flex flex-row justify-between gap-2 pb-8">
        <div>
          <p className="text-[20px] font-bold pt-1 pb-1">{titulo}</p>
          <p className="text-[14px] font-normal pt-1 ">{subtitulo}</p>
        </div>

        <div className='flex flex-col justify-end'>
          {ue && (
            <SimpleTag titulo="Unidade Educacional" valor={ue} />
          )}
        </div>
      </div>

      <div className="w-full pb-2">
        {data && (
          <AtosRelacionados atos={atos} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default ListagemDeDesignacaoDaUnidade;