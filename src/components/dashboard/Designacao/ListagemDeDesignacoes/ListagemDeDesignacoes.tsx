'use client'
import React from 'react';
import { Dropdown, Table, Tag } from 'antd';
import type { PaginationProps, TableProps } from 'antd';
import { LeftOutlined, MoreOutlined, RightOutlined, } from '@ant-design/icons';

import { Button } from '@/components/ui/button';
import Download from '@/assets/icons/Download';
import DocumentoAlerta from '@/assets/icons/DocumentoAlerta';
import Cancelar from '@/assets/icons/Cancelar';
import Apostilar from '@/assets/icons/Apostilar';
import Lixeira from '@/assets/icons/Lixeira';
import Eye from '@/assets/icons/Eye';
import { ListagemDesignacoesResponse, StatusDesignacao } from '@/types/designacao';
import { downloadCSV } from '@/utils/export/exportCSV';
import { useRouter } from 'next/navigation';



const NameColorStatusDesignacao = {
  [StatusDesignacao.PENDENTE]: { color: '#B22B2A', name: 'PENDENTE' },
  [StatusDesignacao.AGUARD_PUBLICACAO]: { color: '#764FC3', name: 'AGUARD. PUBLICAÇÃO' },
  [StatusDesignacao.PUBLICADO_COM_PENDENCIA]: { color: '#FE9239', name: 'PÚBLICADO COM PENDÊNCIA' },
  [StatusDesignacao.PUBLICADO]: { color: '#10A957', name: 'PUBLICADO' },
}
const TagStatusDesignacao = (status: StatusDesignacao, key: string) => {

  const color = NameColorStatusDesignacao[status].color;
  const name = NameColorStatusDesignacao[status].name;

  return (
    <Tag color={color} key={key} variant='outlined' className='rounded-full'>
      {name}
    </Tag>
  )
}


const items = [
  {
    key: '1', label: 'Apostilar', icon: <Apostilar />, onClick: () => {
      console.log('Apostilar');
    }
  },
  {
    key: '2', label: 'Cessar', icon: <Cancelar />, onClick: () => {
      console.log('Cessar');
    }
  },
  {
    key: '3', label: 'Tornar Insubsistente', icon: <DocumentoAlerta />, onClick: () => {
      console.log('Tornar Insubsistente');
    }
  },
  {
    key: '4', label: 'Deletar', icon: <Lixeira />, onClick: () => {
      console.log('Deletar');
    }
  },
];





const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
  if ((type === 'prev' || type === 'next') && React.isValidElement(originalElement)) {
    const label =
      type === 'prev'
        ? (
          <div className='flex items-center gap-1'>
            <LeftOutlined />
            Anterior
          </div>
        )
        : (
          <div className='flex items-center gap-1'>
            Próximo
            <RightOutlined />
          </div>
        );

    return React.cloneElement(originalElement, {}, label);
  }

  return originalElement;
};



const ListagemDeDesignacoes: React.FC<{ data: ListagemDesignacoesResponse[] }> = ({ data }) => {
  const router = useRouter();

  const handleVisualizarDesignacao = (record: ListagemDesignacoesResponse) => {
    router.push(
      `/pages/listagem-designacoes/visualizar-designacao?id=${record.key}`
    );
  }
  
  const columns: TableProps<ListagemDesignacoesResponse>['columns'] = [
    {
      title: 'RF',
      dataIndex: 'rf_servidor_indicado',
      key: 'rf_servidor_indicado',
      sorter: (a, b) => a.rf_servidor_indicado - b.rf_servidor_indicado,
    },
    {
      title: 'SERVIDOR INDICADO',
      dataIndex: 'servidor_indicado',
      key: 'servidor_indicado',
  
    },
  
    {
      title: 'RF',
      dataIndex: 'rf_servidor_titular',
      key: 'rf_servidor_titular',
      sorter: (a, b) => a.rf_servidor_titular - b.rf_servidor_titular,
    },
    {
      title: 'SERVIDOR TITULAR',
      dataIndex: 'servidor_titular',
      key: 'servidor_titular',
  
    },
  
    {
      title: 'SEI',
      dataIndex: 'sei_titular',
      key: 'sei_titular',
      sorter: (a, b) => a.sei_titular - b.sei_titular,
  
    },
    {
      title: 'PORTARIA DESIGNAÇÃO',
      dataIndex: 'portaria_designacao',
      key: 'portaria_designacao',
      sorter: (a, b) => a.portaria_designacao - b.portaria_designacao,
    },
    {
      title: 'ANO DESIGNAÇÃO',
      dataIndex: 'ano_designacao',
      key: 'ano_designacao',
      sorter: (a, b) => a.ano_designacao - b.ano_designacao,
    },
    {
      title: 'SEI',
      dataIndex: 'sei_designacao',
      key: 'sei_designacao',
      sorter: (a, b) => a.sei_designacao - b.sei_designacao,
    },
    {
      title: 'PORTARIA CESSAÇÃO',
      dataIndex: 'portaria_cessacao',
      key: 'portaria_cessacao',
      sorter: (a, b) => a.portaria_cessacao - b.portaria_cessacao,
    },
    {
      title: 'ANO DA CESSAÇÃO',
      dataIndex: 'ano_cessacao',
      key: 'ano_cessacao',
      sorter: (a, b) => a.ano_cessacao - b.ano_cessacao,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => TagStatusDesignacao(record.status, record.key + '_status'),
    },
  
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className='space-x-2 flex items-center'>
  
          <div>
            <Eye className='w-4 h-4 fill-[#86858D]' onClick={() => handleVisualizarDesignacao(record)}/>
          </div>
          <Dropdown menu={{ items }}>
            <div>
              <MoreOutlined />
            </div>
          </Dropdown>
        </div>
      ),
    },
  ];
  
  const handleDownloadCSV = () => {

    // to-do adicionar a integração pra buscar os dados filtrados 
    
    downloadCSV(data, columns)
  }
  return (
    <>
      <div className="flex flex-col gap-1 bg-white p-4 rounded-t-lg border border-[#DCDCDC]">
        <div className="flex justify-between items-center pb-0 pt-0 ">
          <span className="text-[#333] text-lg font-medium">
            Lista de designações
          </span>
          <div className="flex gap-2"   >
            <Button variant="tertiary" size={"sm"} className="gap-2" onClick={() => handleDownloadCSV()}>
              <>
                <Download />
                <p className="text-[14px] ">Exportar CSV</p>
              </>
            </Button>
            <Button variant="tertiary" size={"sm"} className="gap-2" >
              <>
                <Download />
                <p className="text-[14px] ">Exportar PDF</p>
              </>
            </Button>
          </div>
        </div>
      </div>
      <div className=" bg-white  rounded--b-lg border border-[#DCDCDC]  ">
        <div className="flex justify-center items-center p-2 ">

          <Table<ListagemDesignacoesResponse>
            className="tabela-designacoes"

            columns={columns}
            dataSource={data}
            pagination={{
              // current: listRequest.pagination.page,
              pageSize: 10,
              defaultPageSize: 10,
              placement: ["bottomCenter"],
              itemRender: itemRender,
            }}
          />
        </div>
      </div>

    </>
  );
}

export default ListagemDeDesignacoes;