'use client'
import React, { useState } from 'react';
import { Table, Tag } from 'antd';
import type { TableProps } from 'antd';

import { Button } from '@/components/ui/button';
import { ListagemAlterarDataDoResponse, StatusDesignacao } from '@/types/designacao';
import { CheckOutlined } from '@ant-design/icons';
import Check from '@/assets/icons/Check';
import CloseCheck from '@/assets/icons/CloseCheck';
import SimpleCheck from '@/assets/icons/SimpleCheck';
import { format, parseISO } from 'date-fns';

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
  data: ListagemAlterarDataDoResponse[];
  isLoading?: boolean;
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onClickButton?: (rows: ListagemAlterarDataDoResponse[]) => void;
  labelButton?: string;
}

const ListagemDeDo: React.FC<ListagemDeDoProps> = ({
  data,
  isLoading = false,
  onClickButton = () => { },
  labelButton = 'Alterar data',
}) => {
  const [selectedRows, setSelectedRows] = useState<ListagemAlterarDataDoResponse[]>([]);

  const handleAlterarDataDo = () => {
    onClickButton(selectedRows);
  };

  const rowSelection: TableProps<ListagemAlterarDataDoResponse>['rowSelection'] = {
    onChange: (_, selectedRowsValue) => {
      setSelectedRows(selectedRowsValue);
    },
  };
  const columns: TableProps<ListagemAlterarDataDoResponse>['columns'] = [
    { title: 'PORTARIA', dataIndex: 'portaria_designacao', key: 'portaria_designacao' },
    { title: 'DOC', dataIndex: 'doc', key: 'doc' },
    { title: 'TIPO DE ATO', dataIndex: 'tipo_ato', key: 'tipo_ato' },
    { title: 'NOME', dataIndex: 'titular_nome_servidor', key: 'titular_nome_servidor' },
    { title: 'CARGO', dataIndex: 'cargo_vaga_display', key: 'cargo_vaga_display' },
    { title: 'D.O', dataIndex: 'do', key: 'do' },
    { title: 'DATA DA DESIGNAÇÃO', dataIndex: 'data_designacao', key: 'data_designacao', render: (text: string) => format(parseISO(text), "dd/MM/yyyy")  },
    { title: 'DATA DA CESSAÇÃO', dataIndex: 'data_cessacao', key: 'data_cessacao', render: (text: string) => format(parseISO(text), "dd/MM/yyyy")  },
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
          <Table<ListagemAlterarDataDoResponse>
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
              Das portarias selecionadas, serão atualizadas: <strong>{selectedRows.length}</strong>
            </span>
          </div>
          <div className="w-[100%] flex justify-end items-end">

          <div className="w-[200px] py-[2rem]">
            <Button
              type="submit"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              variant="destructive"
              disabled={selectedRows.length === 0}
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