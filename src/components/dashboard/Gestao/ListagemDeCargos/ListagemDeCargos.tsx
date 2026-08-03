'use client'

import { MoreOutlined } from '@ant-design/icons';
import { itemRender, MostrarRegistros } from '@/components/pagination/utils';
import { Badge, Dropdown, Pagination, Table } from 'antd';
import type { TableProps } from 'antd';
import Editar from '@/assets/icons/Editar';
import { useRouter } from 'next/navigation';
import { CargosBaseResponse } from '@/types/gestao';





const NameColorStatusCargosBase = {
  [0]: {
    color: '#9CA3B9',
    name: 'Inativo'
  },
  [1]: {
    color: '#008809',
    name: 'Ativo',
  },
  [2]: {
    color: '#B22B2A',
    name: 'Extinto',
  },
  
}; 

const BadgeStatusCargosBase = (status: number, key: string) => {
  
  const config = NameColorStatusCargosBase[status as keyof typeof NameColorStatusCargosBase];
  return (
    <div className='flex items-center gap-2'>
      <Badge
        className='rounded-full text-center'
        key={key}
        color={config?.color ?? '#9CA3B9'}
 
      />
      {config?.name}
      </div>
  )
};


interface ListagemDeCargosProps {
  data: CargosBaseResponse[];
  isLoading?: boolean;
  total: number;
  page: number;
  onPageChange?: (page: number) => void;
  titulo?: string;
  subtitulo?: string;
}

const ListagemDeCargos: React.FC<ListagemDeCargosProps> = ({
  total,
  page,
  data,
  isLoading = false,
  onPageChange,
}) => {

  const router = useRouter();







  const columnsBase: TableProps<CargosBaseResponse>['columns'] = [
    { title: 'Grupamento', dataIndex: 'grupamento', key: 'grupamento', },
    { title: 'Descrição resumida', dataIndex: 'descricao_resumida', key: 'descricao_resumida', },
    { title: 'Descrição completa', dataIndex: 'descricao_completa', key: 'descricao_completa', },
    { title: 'Situação funcional', dataIndex: 'situacao_funcional', key: 'situacao_funcional', },
    {
      title: 'Usado em funções', dataIndex: 'usado_em_funcoes', key: 'usado_em_funcoes',
      render: (_, record) => {
        return (<>{record.usado_em_funcoes ? 'Sim' : 'Não'}</>);
      },
    },
    {
      title: 'Usado em designações', dataIndex: 'usado_em_designacoes', key: 'usado_em_designacoes',
      render: (_, record) => {
        return (<>{record.usado_em_designacoes ? 'Sim' : 'Não'}</>);
      },
    },
    {
      title: 'Usado em STE', dataIndex: 'usado_em_ste', key: 'usado_em_ste',
      render: (_, record) => {
        return (<>{record.usado_em_ste ? 'Sim' : 'Não'}</>);
      },
    },
    {
      title: 'Usado em permutas', dataIndex: 'usado_em_permutas', key: 'usado_em_permutas',
      render: (_, record) => {
        return (<>{record.usado_em_permutas ? 'Sim' : 'Não'}</>);
      },
    },
    {
      title: 'Cargo base fictício', dataIndex: 'cargo_base_ficticio', key: 'cargo_base_ficticio',
      render: (_, record) => {
        return (<>{record.cargo_base_ficticio ? 'Sim' : 'Não'}</>);
      },
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', render: (status: number, record: CargosBaseResponse) => {
        return (
          BadgeStatusCargosBase(status, String(record.id) + '_status')
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (record: CargosBaseResponse) => (
        <Dropdown
          menu={{
            items: [{
              key: '4',
              label: 'Editar',
              icon: <Editar width={20} height={20} color="#9CA3B9" />,
              onClick: () => {
                router.push(`/pages/gestao/cargos-base/editar-cargo-base/${record.id}`);
              },
            }],
          }}
          trigger={['click']}
        >
          <div >
            <MoreOutlined color='#000000' />
          </div>
        </Dropdown>

      ),
    },
  ];





  return (
    <div className="flex flex-col gap-1 bg-white  ">
      <div className="pb-8">
        <p className="text-[20px] font-bold pt-1 pb-1">Lista de cargos base</p>
        <p className="text-[14px] font-normal pt-1 ">Aqui você encontra todos os cargos base cadastrados no sistema.</p>
      </div>



      <div className="w-full pb-2">
        <Table<CargosBaseResponse>
          className="tabela-principal w-full"
          scroll={{ x: '100%' }}
          loading={isLoading}
          columns={columnsBase}
          dataSource={data}
          rowKey={(record) => record.id.toString()}
          pagination={false}
          rowClassName={(record: CargosBaseResponse) => record.status === 0 ? "disabled-row" : ""}
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

export default ListagemDeCargos;