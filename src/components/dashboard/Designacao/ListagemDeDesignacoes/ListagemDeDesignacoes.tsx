import React from 'react';
import { Dropdown, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import {   MoreOutlined, } from '@ant-design/icons';

import { Button } from '@/components/ui/button';
import Download from '@/assets/icons/Download';
import DocumentoAlerta from '@/assets/icons/DocumentoAlerta';
import Concelar from '@/assets/icons/Cancelar';
import Apostilar from '@/assets/icons/Apostilar';
import Lixeira from '@/assets/icons/Lixeira';
import Eye from '@/assets/icons/Eye';


enum StatusDesignacao {
  PENDENTE = 0,
  AGUARD_PUBLICACAO = 1,
  PUBLICADO_COM_PENDENCIA = 2,
  PUBLICADO = 3,
}

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


interface DataType {
  key: string;
  servidor_indicado: string;
  rf_servidor_indicado: number;
  servidor_titular: string;
  rf_servidor_titular: number;

  sei_titular: number,
  portaria_designacao: number,
  ano_designacao: number,
  sei_designacao: number,
  portaria_cessacao: number,
  ano_cessacao: number,
  status: StatusDesignacao,
}

const items = [
  {
    key: '1', label: 'Apostilar', icon: <Apostilar />, onClick: () => {
      console.log('Apostilar');
    }
  },
  {
    key: '2', label: 'Cessar', icon: <Concelar />, onClick: () => {
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


const columns: TableProps<DataType>['columns'] = [
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

    render: (text) => <a>{text}</a>,
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

    render: (text) => <a>{text}</a>,
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

        <a>
          <Eye className='w-4 h-4 fill-[#86858D]' />
        </a>
        <Dropdown menu={{ items }}>
          <a>
          <MoreOutlined />            
          </a>
        </Dropdown>
      </div>
    ),
  },
];


const data: DataType[] = Array.from({ length: 20 }).map((_, index) => ({
  key: index.toString(),
  servidor_indicado: 'Mateus Antônio Miranda',
  rf_servidor_indicado: 987654,
  servidor_titular: 'Mateus Antônio Miranda',
  rf_servidor_titular: 654321,
  sei_titular: 123,
  portaria_designacao: 123,
  ano_designacao: 2025,
  sei_designacao: 123,
  portaria_cessacao: 123,
  ano_cessacao: 123,
  status: Math.floor(Math.random() * 4),
}))




const ListagemDeDesignacoes: React.FC = () => {
  return (
    <>
      <div className="flex flex-col gap-1 bg-white p-4 rounded-t-lg border border-[#DCDCDC]">
        <div className="flex justify-between items-center pb-0 pt-0 ">
          <span className="text-[#333] text-lg font-medium">
            Lista de designações
          </span>
          <div className="flex gap-2"   >
            <Button variant="secondary" size={"sm"} className="gap-2" >
              <>
                <Download />
                <p className="text-[14px] ">Exportar CSV</p>
              </>
            </Button>
            <Button variant="secondary" size={"sm"} className="gap-2" >
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

          <Table<DataType>
            className="tabela-designacoes"

            columns={columns}
            dataSource={data}
            pagination={{
              // current: listRequest.pagination.page,
              pageSize: 10,
              defaultPageSize: 10,
              placement: ["bottomCenter"],
            }}
          />
        </div>
      </div>

    </>
  );
}

export default ListagemDeDesignacoes;