'use client'
import React, { useState } from 'react';
import { Dropdown, Pagination, Table } from 'antd';
import type { TableProps } from 'antd';
import { Button } from '@/components/ui/button';
import { ListagemPortariasResponse } from '@/types/designacao';
import SimpleCheck from '@/assets/icons/SimpleCheck';
import { format } from 'date-fns';
import { PORTARIAS_SEM_DATA_DE_PUBLICACAO, PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA } from '../MainDOForm/MainDOForm';
import { formatDate } from '@/utils/formatDate';
import DownloadFiles from '@/assets/icons/DownloadFiles';





interface ListagemDeAtosAdministrativosProps {  
  data: ListagemPortariasResponse[];
  isLoading?: boolean;  
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
}

const ListagemDeAtosAdministrativos: React.FC<ListagemDeAtosAdministrativosProps> = ({
  data,
  isLoading = false,
  total,
  page,
  onPageChange,
}) => {


  const columns: TableProps<ListagemPortariasResponse>['columns'] = [
    { title: 'PORTARIA', dataIndex: 'portaria', key: 'portaria' },
    { title: 'TIPO DE ATO', dataIndex: 'tipo_de_ato', key: 'tipo_de_ato', },
    { title: 'NOME', dataIndex: 'nome', key: 'nome' },
    { title: 'CARGO', dataIndex: 'cargo', key: 'cargo' },
    { title: 'D.O', dataIndex: 'doc', key: 'doc', render: (text: string | null) => formatDate(text) },
    { title: 'DATA DA DESIGNAÇÃO', dataIndex: 'data_designacao', key: 'data_designacao', render: (text: string | null) => formatDate(text) },
    { title: 'DATA DA CESSAÇÃO', dataIndex: 'data_cessacao', key: 'data_cessacao', render: (text: string | null) => formatDate(text) },
    { title: 'Nº SEI', dataIndex: 'numero_sei', key: 'numero_sei' }
  ];
  return (
    <div className="flex flex-col gap-1 bg-white  ">
      <div className="py-8">

        <p className="text-[20px] font-bold pt-1 pb-1">Lista de atos administrativos</p>
        <p className="text-[14px] font-normal pt-1 ">Aqui você encontra todos os atos administrativos realizados no sistema. Clique sobre ele para consultar mais detalhes e realize alterações ou novos registros vinculados a um ato já existente.</p>

      </div>

      <div className="w-full pb-2">
        <Table<ListagemPortariasResponse>
          className="tabela-principal w-full"
          scroll={{ x: '100%' }}
          loading={isLoading}
          columns={columns}
          dataSource={data}
          rowKey={(record) => record.id.toString()}
          pagination={{
            current: 1,
            pageSize: 10,
            total: data.length,
            showSizeChanger: false,                        
          }}
        />

<div className="flex items-center justify-center gap-16 py-3">
            <span className="text-sm text-[#555]">
              Total: <strong>{total}</strong>
            </span>

            <Pagination
              current={page}
              pageSize={10}
              total={total}
              showSizeChanger={false}
              onChange={onPageChange}
            />
          </div>

 
      
      </div>
    </div>
  );
};

export default ListagemDeAtosAdministrativos;