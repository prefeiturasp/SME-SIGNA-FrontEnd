'use client'
import React, { useState } from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import { Button } from '@/components/ui/button';
import { ListagemPortariasResponse } from '@/types/designacao';
import SimpleCheck from '@/assets/icons/SimpleCheck';
import { format, isValid, parseISO } from 'date-fns';
import { PORTARIAS_SEM_DATA_DE_PUBLICACAO, PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA } from '../MainDOForm/MainDOForm';

 

 

interface ListagemDeDoProps {
  value: number;
  data_considerada_portaria?: Date;
  data_publicacao?: Date;
  data: ListagemPortariasResponse[];
  isLoading?: boolean;
  onClickButton?: (rows: ListagemPortariasResponse[]) => void;
  labelButton?: string; 
  isDisabled?: boolean;
}

const ListagemDeDo: React.FC<ListagemDeDoProps> = ({
  isDisabled = false,
  value,
  data_considerada_portaria,
  data_publicacao,
  data,
  isLoading = false,
  onClickButton = () => { },
  labelButton = 'Alterar data',
}) => {
  const [selectedRows, setSelectedRows] = useState<ListagemPortariasResponse[]>([]);
  const isEmptyDate = (date?: string | null) => !date;
  const formatDateCell = (date?: string | null) => {
    if (!date) {
      return "-";
    }

    const parsedDate = parseISO(date);
    return isValid(parsedDate) ? format(parsedDate, "dd/MM/yyyy") : "-";
  };

  let filtredRows: ListagemPortariasResponse[] = [];

  if (value === PORTARIAS_SEM_DATA_DE_PUBLICACAO) {
    filtredRows = selectedRows.filter((row) => isEmptyDate(row.data_designacao) || isEmptyDate(row.data_cessacao));
  }
  
  if (value === PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA) {
    const data_considerada_portaria_string = data_considerada_portaria ? format(data_considerada_portaria, "yyyy-MM-dd") : "";
    filtredRows = selectedRows.filter((row) => [null, "", data_considerada_portaria_string].includes(row.data_designacao) || [null, "", data_considerada_portaria_string].includes(row.data_cessacao));
  }

  const semDataConsideradaPortaria =  data_considerada_portaria === undefined && value === PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA;  
  const isDisabledButton = filtredRows.length === 0 || data_publicacao === undefined || semDataConsideradaPortaria || isDisabled;
  
  const handleAlterarDataDo = () => {
      onClickButton(filtredRows);
   
  };

  const rowSelection: TableProps<ListagemPortariasResponse>['rowSelection'] = {
    onChange: (_, selectedRowsValue) => {
      setSelectedRows(selectedRowsValue);
    },
  };

   
  
   
  const columns: TableProps<ListagemPortariasResponse>['columns'] = [
    { title: 'PORTARIA', dataIndex: 'portaria', key: 'portaria' },
    { title: 'TIPO DE ATO', dataIndex: 'tipo_de_ato', key: 'tipo_de_ato' },
    { title: 'NOME', dataIndex: 'nome', key: 'nome' },
    { title: 'CARGO', dataIndex: 'cargo', key: 'cargo' },
    { title: 'D.O', dataIndex: 'doc', key: 'doc', render: (text: string) => text === "" ? "-" : text },
    { title: 'DATA DA DESIGNAÇÃO', dataIndex: 'data_designacao', key: 'data_designacao', render: (text: string | null) => formatDateCell(text) },
    { title: 'DATA DA CESSAÇÃO', dataIndex: 'data_cessacao', key: 'data_cessacao', render: (text: string | null) => formatDateCell(text) },
    { title: 'Nº SEI', dataIndex: 'numero_sei', key: 'numero_sei' }   
  ];
  return (
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
              disabled={isDisabledButton}
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
  );
};

export default ListagemDeDo;