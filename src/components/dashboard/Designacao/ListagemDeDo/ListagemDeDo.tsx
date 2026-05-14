'use client'
import React, { useState } from 'react';
import { Table, Tag } from 'antd';
import type { TableProps } from 'antd';

import { Button } from '@/components/ui/button';
import { ListagemPortariasResponse, StatusDesignacao } from '@/types/designacao';
import { CheckOutlined } from '@ant-design/icons';
import Check from '@/assets/icons/Check';
import CloseCheck from '@/assets/icons/CloseCheck';
import SimpleCheck from '@/assets/icons/SimpleCheck';
import { format, parseISO } from 'date-fns';
import { PORTARIAS_SEM_DATA_DE_PUBLICACAO, PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA } from '../MainDOForm/MainDOForm';

const NameColorStatusDesignacao = {
  [StatusDesignacao.PENDENTE]: { color: '#B22B2A', name: 'PENDENTE' },
  [StatusDesignacao.AGUARD_PUBLICACAO]: { color: '#764FC3', name: 'AGUARD. PUBLICAÇÃO' },
  [StatusDesignacao.PUBLICADO_COM_PENDENCIA]: { color: '#FE9239', name: 'PÚBLICADO COM PENDÊNCIA' },
  [StatusDesignacao.PUBLICADO]: { color: '#10A957', name: 'PUBLICADO' },
};

const TagStatusDesignacao = (status: StatusDesignacao | undefined, key: string) => {
  const config = status === undefined ? undefined : NameColorStatusDesignacao[status];

  if (!config) {
    return (
      <Tag key={key} color='#9E9E9E' className='rounded-full'>
        INDISPONÍVEL
      </Tag>
    );
  }

  return (
    <Tag color={config.color} key={key} className='rounded-full'>
      {config.name}
    </Tag>
  );
};

interface ListagemDeDoProps {
  value: number;
  data_considerada_portaria?: Date;
  data_publicacao?: Date;
  data: ListagemPortariasResponse[];
  isLoading?: boolean;
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onClickButton?: (rows: ListagemPortariasResponse[]) => void;
  labelButton?: string;
}

const ListagemDeDo: React.FC<ListagemDeDoProps> = ({
  value,
  data_considerada_portaria,
  data_publicacao,
  data,
  isLoading = false,
  onClickButton = () => { },
  labelButton = 'Alterar data',
}) => {
  const [selectedRows, setSelectedRows] = useState<ListagemPortariasResponse[]>([]);

  let filtredRows: ListagemPortariasResponse[] = [];

  if (value === PORTARIAS_SEM_DATA_DE_PUBLICACAO) {
    filtredRows = selectedRows.filter((row) => row.data_designacao === "" || row.data_cessacao === "");      
  }
  
  if (value === PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA) {
    const data_considerada_portaria_string = data_considerada_portaria ? format(data_considerada_portaria, "yyyy-MM-dd") : "";
    filtredRows = selectedRows.filter((row) => ["",data_considerada_portaria_string].includes(row.data_designacao) || ["",data_considerada_portaria_string].includes(row.data_cessacao));      
  }
  
  const handleAlterarDataDo = () => {
      onClickButton(filtredRows);
   
  };

  const rowSelection: TableProps<ListagemPortariasResponse>['rowSelection'] = {
    onChange: (_, selectedRowsValue) => {
      setSelectedRows(selectedRowsValue);
    },
  };
  const columns: TableProps<ListagemPortariasResponse>['columns'] = [
    { title: 'PORTARIA', dataIndex: 'portaria_designacao', key: 'portaria_designacao' },
    { title: 'DOC', dataIndex: 'doc', key: 'doc' },
    { title: 'TIPO DE ATO', dataIndex: 'tipo_ato', key: 'tipo_ato' },
    { title: 'NOME', dataIndex: 'titular_nome_servidor', key: 'titular_nome_servidor' },
    { title: 'CARGO', dataIndex: 'cargo_vaga_display', key: 'cargo_vaga_display' },
    { title: 'D.O', dataIndex: 'do', key: 'do' },
    { title: 'DATA DA DESIGNAÇÃO', dataIndex: 'data_designacao', key: 'data_designacao', render: (text: string) => text === "" ? "-" : format(parseISO(text), "dd/MM/yyyy")  },
    { title: 'DATA DA CESSAÇÃO', dataIndex: 'data_cessacao', key: 'data_cessacao', render: (text: string) => text === "" ? "-" : format(parseISO(text), "dd/MM/yyyy")  },
    { title: 'Nº SEI', dataIndex: 'sei_numero', key: 'sei_numero' }   
  ];
  return (
    <>
      <div className="flex flex-col gap-1 bg-white  ">
        <div className="py-8">

          <p className="text-[20px] font-bold pt-1 pb-1">Lista de portarias</p>
          <p className="text-[14px] font-normal pt-1 ">Você pode selecionar uma ou mais portarias disponíveis e baixar a lauda.</p>

        </div>
 
        <div className="w-full pb-2">
          <Table<ListagemPortariasResponse>
            className="tabela-principal w-full"
            scroll={{ x: '100%' }}
            loading={isLoading}
            columns={columns}
            dataSource={data}
            rowSelection={rowSelection}
            rowKey={(record) => record.id.toString()}
            pagination={false}
          />

          <div className="flex items-start justify-start gap-16 pl-2 pt-3">
            <span className="text-sm text-[#555]">
              Portarias selecionadas: <strong>{selectedRows.length}</strong>
            </span>
          </div>

          <div className="flex items-start justify-start gap-16 pl-2  pt-1">
            <span className="text-sm text-[#555]">
              Das portarias selecionadas, serão atualizadas: <strong>{filtredRows.length}</strong>
            </span>
          </div>
          <div className="w-[100%] flex justify-end items-end">

          <div className="w-[200px] py-[2rem]">
            <Button
              type="submit"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              variant="destructive"
              disabled={filtredRows.length === 0 || data_publicacao === undefined}
              onClick={handleAlterarDataDo}
              data-testid="botao-proximo"
            >
              <p className="text-[16px] font-bold">{labelButton}</p>
              <SimpleCheck className="text-[16px] font-bold" />
            </Button>
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListagemDeDo;