'use client'
import { Pagination, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { ListagemAtosAdministrativosResponse, StatusAtosAdministrativos } from '@/types/designacao';
import { formatarDataHora } from '@/lib/utils';
import { itemRender, MostrarRegistros } from '@/components/pagination/utils';

const NameColorStatusAtosAdministrativos = {
  [StatusAtosAdministrativos.NAO_PUBLICADO]: { color: '#B22B2A', name: 'Não publicado' },
  [StatusAtosAdministrativos.PUBLICADO]: { color: '#10A957', name: 'Publicado' },
};

const TagStatusAtosAdministrativos = (status: StatusAtosAdministrativos | undefined, key: string) => {
  const config = status === undefined ? undefined : NameColorStatusAtosAdministrativos[status];

  if (!config) {
    return (
      <Tag className='rounded-full' key={key} color='#9E9E9E' >
        INDISPONÍVEL
      </Tag>
    );
  }

  return (
    <Tag className='rounded-full' color={config.color} key={key} >
      {config.name}
    </Tag>
  );
};



interface ListagemDeAtosAdministrativosProps {
  data: ListagemAtosAdministrativosResponse[];
  isLoading?: boolean;
  total: number;
  page: number;
  onPageChange?: (page: number) => void;
}

const ListagemDeAtosAdministrativos: React.FC<ListagemDeAtosAdministrativosProps> = ({
  data,
  isLoading = false,
  total,
  page,
  onPageChange,
}) => {

  const columns: TableProps<ListagemAtosAdministrativosResponse>['columns'] = [
    { title: 'TIPO', dataIndex: 'tipo_de_ato', key: 'tipo_de_ato', },
    { title: 'Data/hora', dataIndex: 'criado_em', key: 'criado_em', render: (text: string) => formatarDataHora(text) },
    { title: 'Observações', dataIndex: 'observacoes', key: 'observacoes', width: '20%' },
    { title: 'Portaria de designação', dataIndex: 'portaria', key: 'portaria' },
    { title: 'Servidor indicado', dataIndex: 'nome', key: 'nome' },
    { title: 'Responsável', dataIndex: 'responsavel', key: 'responsavel', render: () => <span >-</span> },
    {
      title: 'Status', dataIndex: 'status_publicacao', key: 'status_publicacao', render: (_, record) =>
        TagStatusAtosAdministrativos(record.status_publicacao as StatusAtosAdministrativos, String(record.id) + '_status'),
    }
  ];



  return (
    <div className="flex flex-col gap-1 bg-white  ">
      <div className="py-8">

        <p className="text-[20px] font-bold pt-1 pb-1">Lista de atos administrativos</p>
        <p className="text-[14px] font-normal pt-1 ">Aqui você encontra todos os atos administrativos realizados no sistema. Clique sobre ele para consultar mais detalhes e realize alterações ou novos registros vinculados a um ato já existente.</p>

      </div>

      <div className="w-full pb-2">
        <Table<ListagemAtosAdministrativosResponse>
          className="tabela-principal w-full"
          scroll={{ x: '100%' }}
          loading={isLoading}
          columns={columns}
          dataSource={data}
          rowKey={(record) => record.id.toString()}
          pagination={false}
        />
        <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-between py-3">


          <MostrarRegistros page={page} total={total} />

          <Pagination
            current={page}
            pageSize={10}
            total={total}
            showSizeChanger={false}
            onChange={onPageChange}
            itemRender={itemRender}
          />

        </div>

      </div>
    </div>
  );
};

export default ListagemDeAtosAdministrativos;