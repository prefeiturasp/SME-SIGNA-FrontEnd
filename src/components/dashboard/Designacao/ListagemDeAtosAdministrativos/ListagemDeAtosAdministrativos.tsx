'use client'
import { MenuProps } from 'antd/lib/menu';
import { MoreOutlined } from '@ant-design/icons';
import { ListagemAtosAdministrativosResponse, StatusAtosAdministrativos } from '@/types/designacao';
import { formatarDataHora } from '@/lib/utils';
import { itemRender, MostrarRegistros } from '@/components/pagination/utils';
import { Dropdown, Pagination, Table, Tag } from 'antd';
import type { TableProps } from 'antd';

import Editar from '@/assets/icons/Editar';
import Apostilar from '@/assets/icons/Apostilar';
import Cancelar from '@/assets/icons/Cancelar';
import DocumentoErro from '@/assets/icons/DocumentoErro';
import Delete from '@/assets/icons/Delete';

const NameColorStatusAtosAdministrativos = {
  [StatusAtosAdministrativos.NAO_PUBLICADO]:
  {
    color: '#9E9E9E',
    name: 'Aguardando publicação'
  },
  [StatusAtosAdministrativos.PUBLICADO]: {
    color: '#10A957',
    name: 'Publicado'
  },
};

const TagStatusAtosAdministrativos = (status: StatusAtosAdministrativos | undefined, key: string) => {
  const config = status === undefined ? undefined : NameColorStatusAtosAdministrativos[status];

  if (!config) {
    return (
      <Tag
        className='rounded-full'
        key={key}
        color='#9E9E9E' >
        INDISPONÍVEL
      </Tag>
    );
  }

  return (
    <Tag
      className='rounded-full  w-[148px] h-[24px] text-center'
      color={config.color}
      key={key} >
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
  total,
  page,
  data,
  isLoading = false,
  onPageChange,
}) => {


  const getItems = (): MenuProps['items'] => [

    {
      key: '1',
      label: 'Editar',
      icon: <Editar width={20} height={20} color="#9CA3B9" />,
      onClick: () => {
        console.log("clicar");
      },
    },
    {
      key: '2',
      label: 'Apostilar',
      icon: <Apostilar width={20} height={20} color="#9CA3B9" />,
      onClick: () => {
        console.log("clicar");
      },
    },
    {
      key: '3',
      label: 'Cessar',
      icon: <Cancelar width={20} height={20} color="#9CA3B9" />,
      onClick: () => {
        console.log("clicar");
      },
    },
    {
      key: '4',
      label: 'Tornar insubsistente',
      icon: <DocumentoErro width={20} height={20} color="#9CA3B9" />,
      onClick: () => {
        console.log("clicar");
      },
    },

    {
      key: '5',
      label: 'Excluir',
      icon: <Delete width={20} height={20} color="#9CA3B9" />,
      onClick: () => {
        console.log("clicar");
      },
    },
  ];


  const columns: TableProps<ListagemAtosAdministrativosResponse>['columns'] = [
    { title: 'Tipo', dataIndex: 'tipo_de_ato', key: 'tipo_de_ato', },
    { title: 'Data/hora', dataIndex: 'criado_em', key: 'criado_em', render: (text: string) => formatarDataHora(text) },
    { title: 'Observações', dataIndex: 'observacoes', key: 'observacoes', width: '20%' },
    { title: 'Portaria de designação', dataIndex: 'portaria', key: 'portaria' },
    { title: 'Servidor indicado', dataIndex: 'nome', key: 'nome' },
    { title: 'Responsável', dataIndex: 'responsavel', key: 'responsavel', render: () => <span >-</span> },
    {
      title: 'Status', dataIndex: 'status_publicacao', key: 'status_publicacao', render: (_, record) =>
        TagStatusAtosAdministrativos(record.status_publicacao as StatusAtosAdministrativos, String(record.id) + '_status'),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: () => (
        <div>
          <Dropdown
            menu={{
              items: getItems(),
            }}
            trigger={['click']}
          >
            <div>
              <MoreOutlined color='#000000' />
            </div>
          </Dropdown>
        </div>
      ),
    },
  ];





  return (
    <div className="flex flex-col gap-1 bg-white  ">
      <div className="pb-8">

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