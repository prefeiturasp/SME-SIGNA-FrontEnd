'use client'

import { MoreOutlined } from '@ant-design/icons';
import { itemRender, MostrarRegistros } from '@/components/pagination/utils';
import {  Dropdown, Pagination, Table } from 'antd';
import type { TableProps } from 'antd';
import Editar from '@/assets/icons/Editar';
import { useRouter } from 'next/navigation';
import { CargosBaseResponse, StatusCargosBase } from '@/types/gestao';
import SimpleTableHeader from '../../SimpleTableHeader/SimpleTableHeader';
import { BadgeStatusCargosBase } from '../ListagemDeCargos/ListagemDeCargos';






 


interface ListagemDeTextosDePortariasProps {
  data: CargosBaseResponse[];
  isLoading?: boolean;
  total: number;
  page: number;
  onPageChange?: (page: number) => void;
  titulo?: string;
  subtitulo?: string;
}

const ListagemDeTextosDePortarias: React.FC<ListagemDeTextosDePortariasProps> = ({
  total,
  page,
  data,
  isLoading = false,
  onPageChange,
}) => {

  const router = useRouter();

  const columnsBase: TableProps<CargosBaseResponse>['columns'] = [
    { title: 'Tipo de portaria', dataIndex: 'grupamento', key: 'grupamento', },
    { title: 'Nome do modelo', dataIndex: 'descricao_resumida', key: 'descricao_resumida', },
    {
      title: 'Status', dataIndex: 'status', key: 'status', render: (status: StatusCargosBase, record: CargosBaseResponse) => {
        return (
          BadgeStatusCargosBase(status, String(record.id) + '_status')
        );
      },
    },
    { title: 'Atualizado por', dataIndex: 'descricao_completa', key: 'descricao_completa', },
    { title: 'Atualizado em', dataIndex: 'situacao_funcional', key: 'situacao_funcional', },
    
  ];





  return (
    <div className="flex flex-col gap-1 bg-white  ">

    <SimpleTableHeader
      title="Lista de cargos base"
      subtitle="Aqui você encontra todos os cargos base cadastrados no sistema."
    />


      <div className="w-full pb-2">
        <Table<CargosBaseResponse>
          className="tabela-principal w-full"
          scroll={{ x: '100%' }}
          loading={isLoading}
          columns={columnsBase}
          dataSource={data}
          rowKey={(record) => record.id.toString()}
          pagination={false}
          rowClassName={(record: CargosBaseResponse) => record.status === StatusCargosBase.INATIVO ? "disabled-row" : ""}
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

export default ListagemDeTextosDePortarias;