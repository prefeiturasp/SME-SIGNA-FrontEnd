'use client'
import React, { useState } from 'react';
import { Dropdown, Pagination, Popconfirm, Table, Tag } from 'antd';
import type { MenuProps, PaginationProps, TableProps } from 'antd';
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
import { toast } from '@/components/ui/headless-toast';
import { useExcluirDesignacao } from '@/hooks/useExcluirDesignacao';

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


const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
  if ((type === 'prev' || type === 'next') && React.isValidElement(originalElement)) {
    const label =
      type === 'prev' ? (
        <div className='flex items-center gap-1'>
          <LeftOutlined />
          Anterior
        </div>
      ) : (
        <div className='flex items-center gap-1'>
          Próximo
          <RightOutlined />
        </div>
      );

    return React.cloneElement(originalElement, {}, label);
  }
  return originalElement;
};

interface ListagemDeDesignacoesProps {
  data: ListagemDesignacoesResponse[];
  isLoading?: boolean;
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
}

const ListagemDeDesignacoes: React.FC<ListagemDeDesignacoesProps> = ({
  data,
  isLoading = false,
  total = 0,
  page = 1,
  onPageChange = () => {},
}) => {
  const router = useRouter();
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<number | null>(null);

  const handleVisualizarDesignacao = (record: ListagemDesignacoesResponse) => {
    router.push(
      `/pages/listagem-designacoes/visualizar-designacao/${record.id}`
    );
  }

  const getItems = (record: ListagemDesignacoesResponse): MenuProps['items'] => [
    {
      key: '1', label: 'Apostilar', icon: <Apostilar  />, onClick: () => {
        console.log('Apostilar');
      },
      disabled: true,
    },
    {
      key: '2', label: 'Cessar', icon: <Cancelar />, onClick: () => {
        console.log('Cessar');
      },
      disabled: true
    },
    {
      key: '3', label: 'Tornar Insubsistente', icon: <DocumentoAlerta />, onClick: () => {
        console.log('Tornar Insubsistente');
      },
      disabled: true
    },
    {
      key: '4',
      icon: <Lixeira />,
      label: 'Deletar',
      onClick: () => {
        setConfirmDeleteKey(record.id);
      }
    },
  ];




  const columns: TableProps<ListagemDesignacoesResponse>['columns'] = [
    { title: 'RF INDICADO', dataIndex: 'indicado_rf', key: 'indicado_rf' },
    { title: 'SERVIDOR INDICADO', dataIndex: 'indicado_nome_servidor', key: 'indicado_nome_servidor' },
    { title: 'RF TITULAR', dataIndex: 'titular_rf', key: 'titular_rf' },
    { title: 'SERVIDOR TITULAR', dataIndex: 'titular_nome_servidor', key: 'titular_nome_servidor' },
    { title: 'SEI', dataIndex: 'sei_numero', key: 'sei_numero' },
    { title: 'PORTARIA DESIGNAÇÃO', dataIndex: 'numero_portaria', key: 'numero_portaria' },
    { title: 'ANO DESIGNAÇÃO', dataIndex: 'ano_vigente', key: 'ano_vigente' },
    { title: 'DRE', dataIndex: 'dre_nome', key: 'dre_nome' },
    { title: 'UNIDADE', dataIndex: 'unidade_proponente', key: 'unidade_proponente' },
    { title: 'CARGO', dataIndex: 'cargo_vaga_display', key: 'cargo_vaga_display' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) =>
        TagStatusDesignacao(record.status, String(record.id) + '_status'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className='space-x-2 flex items-center'>

          <div>
            <Eye
              className='w-4 h-4 fill-[#86858D] cursor-pointer'
              onClick={() => handleVisualizarDesignacao(record)}
            />
          </div>
          <Popconfirm
            title="Excluir designação"
            description="Tem certeza que deseja excluir esta designação?"
            open={confirmDeleteKey === record.id}
            onConfirm={() => {
              handleExcluir(Number(record.id));
              setConfirmDeleteKey(null);
            }}
            onCancel={() => setConfirmDeleteKey(null)}
            okText="Sim"
            cancelText="Não"
          >
            <Dropdown
              menu={{
                items: getItems(record),
              }}
              trigger={['click']}
            >
              <div>
                <MoreOutlined />
              </div>
            </Dropdown>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const { mutateAsync } = useExcluirDesignacao();

  async function handleExcluir(id: number) {
    const response = await mutateAsync(id);
    if (!response.success) {
       toast({
        variant: "error",
        title: "Erro ao excluir a designação.",
        description: response.error,
      });
      return onPageChange(page);
    }

    toast({
      variant: "success",
      title: "Tudo certo por aqui!",
      description: "A designação foi excluída com sucesso!",
    });
    
  }



  const handleDownloadCSV = () => {
    downloadCSV(data, columns)
  }
  return (
    <>
      <div className="flex flex-col gap-1 bg-white p-4 rounded-t-lg border border-[#DCDCDC]">
        <div className="flex justify-between items-center">
          <span className="text-[#333] text-lg font-medium">
            Lista de designações
          </span>
          <Button variant="tertiary" size="sm" className="gap-2" onClick={handleDownloadCSV}>
            <Download />
            <p className="text-[14px]">Exportar CSV</p>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-b-lg border border-[#DCDCDC] overflow-x-auto">
        <div className="w-full min-w-0 p-2">
          <Table<ListagemDesignacoesResponse>
            className="tabela-designacoes w-full"
            scroll={{ x: 'max-content' }}
            loading={isLoading}
            columns={columns}
            dataSource={data}
            rowKey={(record) => record.id.toString()}
            pagination={false}
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
              itemRender={itemRender}
              onChange={onPageChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ListagemDeDesignacoes;