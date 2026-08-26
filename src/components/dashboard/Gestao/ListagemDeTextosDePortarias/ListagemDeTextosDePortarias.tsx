'use client'

import { itemRender, MostrarRegistros } from '@/components/pagination/utils';
import { Pagination, Table } from 'antd';
import type { TableProps } from 'antd';;
import { StatusCargosBase, TextosDePortariasResponse } from '@/types/gestao';
import SimpleTableHeader from '../../SimpleTableHeader/SimpleTableHeader';
import { BadgeStatusCargosBase } from '../ListagemDeCargos/ListagemDeCargos';
import { formatDateAndHour } from '@/utils/formatDate';

interface ListagemDeTextosDePortariasProps {
  data: TextosDePortariasResponse[];
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


  const columnsBase: TableProps<TextosDePortariasResponse>['columns'] = [
    { title: 'Tipo de portaria', dataIndex: 'tipo_portaria', key: 'tipo_portaria', },
    { title: 'Nome do modelo', dataIndex: 'nome_modelo', key: 'nome_modelo', },
    {
      title: 'Status', dataIndex: 'status', key: 'status', render: (status: StatusCargosBase, record: TextosDePortariasResponse) => {
        return (
          BadgeStatusCargosBase(status, String(record.id) + '_status')
        );
      },
      width: '100px',
    },
    { title: 'Criado em', dataIndex: 'criado_em', key: 'criado_em', width: '150px', render: (text: string | null) => formatDateAndHour(text) },
    { title: 'Atualizado em', dataIndex: 'atualizado_em', key: 'atualizado_em', width: '150px', render: (text: string | null) => formatDateAndHour(text) },
  ];





  return (
    <div className="flex flex-col gap-1 bg-white  ">

      <SimpleTableHeader
        title="Lista de textos de portarias"
        subtitle="Consulte os modelos de texto de Portaria cadastrados no sistema. Selecione um modelo para conferir seus detalhes ou escolha a opção “editar” para fazer alterações."
      />

      <div className="w-full pb-2">
        <Table<TextosDePortariasResponse>
          className="tabela-principal w-full"
          scroll={{ x: '100%' }}
          loading={isLoading}
          columns={columnsBase}
          dataSource={data}
          rowKey={(record) => record.id.toString()}
          pagination={false}
          rowClassName={(record: TextosDePortariasResponse) => record.status === StatusCargosBase.INATIVO ? "disabled-row" : ""}
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