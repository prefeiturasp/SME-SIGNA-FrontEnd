'use client'
import { MenuProps } from 'antd/lib/menu';
import { MoreOutlined } from '@ant-design/icons';
import { ListagemAtosAdministrativosResponse, StatusAtosAdministrativos } from '@/types/designacao';
import { formatarDataHora } from '@/lib/utils';
import { itemRender, MostrarRegistros } from '@/components/pagination/utils';
import { Dropdown, Pagination, Table, Tag, Tooltip } from 'antd';
import type { TableProps } from 'antd';

import Editar from '@/assets/icons/Editar';
import Apostilar from '@/assets/icons/Apostilar';
import Cancelar from '@/assets/icons/Cancelar';
import DocumentoErro from '@/assets/icons/DocumentoErro';
import Delete from '@/assets/icons/Delete';
import { ItemType } from 'antd/es/menu/interface';
import { useRouter } from 'next/navigation';



const SimpleTag = ({ titulo, valor }: { titulo: string, valor: string }) => {
  return (
    <div className="flex flex-row gap-1 border border-[#B22B2A] rounded-md  px-2 w-fit">
      <span className="text-[14px] font-bold text-[#B22B2A] pt-1 ">{titulo}:</span>
      <span className="text-[14px] font-normal text-[#B22B2A] pt-1 ">{valor}</span>
    </div>
  );
}

const NameColorStatusAtosAdministrativos = {
  [StatusAtosAdministrativos.NAO_PUBLICADO]:
  {
    color: '#9E9E9E',
    name: 'Aguardando publicação',
    background: 'rgba(89, 89, 89, 0.10)'
  },
  [StatusAtosAdministrativos.PUBLICADO]: {
    color: '#008809',
    name: 'Publicado',
    background: 'rgba(0, 136, 9, 0.10)'
  },
};


const TagStatusAtosAdministrativos = (status: StatusAtosAdministrativos | undefined, key: string) => {
  const config = status === undefined ? undefined : NameColorStatusAtosAdministrativos[status];

  if (!config) {
    return (
      <Tag
        className='rounded-full'
        key={key}
        color='#9E9E9E' >
        INDISPONÍVEL
      </Tag>
    );
  }



  return (
    <Tag
      className='rounded-full  w-[148px] h-[24px] text-center'
      color={config.color}
      style={{ background: config.background }}
      key={key} >
      {config.name}
    </Tag>
  );
};

const getColumnContent = (content: unknown) => {
  if (
    content &&
    typeof content === 'object' &&
    'children' in content
  ) {
    return (content as { children?: React.ReactNode }).children ?? '-';
  }

  return (content as React.ReactNode) ?? '-';
};



interface ListagemDeAtosAdministrativosProps {
  data: ListagemAtosAdministrativosResponse[];
  isLoading?: boolean;
  total: number;
  page: number;
  onPageChange?: (page: number) => void;
  showCamposExtras?: boolean;
  portaria?: string;
  servidor_indicado?: string;
  titulo?: string;
  subtitulo?: string;
}

const ListagemDeAtosAdministrativos: React.FC<ListagemDeAtosAdministrativosProps> = ({
  portaria,
  servidor_indicado,
  titulo = 'Lista de atos administrativos',
  subtitulo = 'Aqui você encontra todos os atos administrativos realizados no sistema. Clique sobre ele para consultar mais detalhes e realize alterações ou novos registros vinculados a um ato já existente.',
  showCamposExtras = true,
  total,
  page,
  data,
  isLoading = false,
  onPageChange,
}) => {

  const router = useRouter();

  const designacaoPublicadaItems = [
    {
      key: '1',
      label: 'Apostilar',
      icon: <Apostilar width={20} height={20} color="#9CA3B9" />,

    },
    {
      key: '2',
      label: 'Cessar',
      icon: <Cancelar width={20} height={20} color="#9CA3B9" />,

    },
    {
      key: '3',
      label: 'Tornar insubsistente',
      icon: <DocumentoErro width={20} height={20} color="#9CA3B9" />,

    },
  ]

  const desigacaoNaoPublicadaItems = [
    {
      key: '4',
      label: 'Editar',
      icon: <Editar width={20} height={20} color="#9CA3B9" />,

    },
    ...designacaoPublicadaItems,
    {
      key: '5',
      label: 'Excluir',
      icon: <Delete width={20} height={20} color="#9CA3B9" />,

    },
  ]

  const cessacaoItems = [
    {
      key: '1',
      label: 'Apostilar',
      icon: <Apostilar width={20} height={20} color="#9CA3B9" />,

    },
    {
      key: '3',
      label: 'Tornar insubsistente',
      icon: <DocumentoErro width={20} height={20} color="#9CA3B9" />,

    },
  ]


  const apostilaItems = (record: ListagemAtosAdministrativosResponse): ItemType[] => {
    const items: ItemType[] = [
      {
        key: '6',
        label: 'Anular Apostila',
        icon: <Cancelar width={20} height={20} color="#9CA3B9" />,
        onClick: (e) => {
          e.domEvent.preventDefault();
          router.push(`/pages/anular-apostila?id=${record.id}`);
        },
      }
    ]
    return items;
  };

  const insubsistenciaItems = (record: ListagemAtosAdministrativosResponse): ItemType[] => {
    return [
      {
        key: '7',
        label: 'Tornar sem efeito',
        icon: <DocumentoErro width={20} height={20} color="#9CA3B9" />,
        onClick: () => {
          router.push(`/pages/tornar-sem-efeito?id=${record.id}`);
        },
      },
    ];
  };




  const getItems = (record: ListagemAtosAdministrativosResponse): MenuProps['items'] => {

    let items: ItemType[] = [];

    if (record.tipo === 'DESIGNACAO' && record.status_publicacao === StatusAtosAdministrativos.PUBLICADO) {
      items.push(...designacaoPublicadaItems);
    }

    if (record.tipo === 'DESIGNACAO' && record.status_publicacao === StatusAtosAdministrativos.NAO_PUBLICADO) {
      items.push(...desigacaoNaoPublicadaItems);
    }


    if (record.tipo === 'CESSACAO') {
      items.push(...cessacaoItems);
    }


    if (record.tipo === 'APOSTILA') {
      items.push(...apostilaItems(record));
    }

    if (record.tipo === 'INSUBSISTENCIA' && record.tipo_insubsistencia && ["DESIGNACAO", "CESSACAO"].includes(record.tipo_insubsistencia)) {
      items.push(...insubsistenciaItems(record));
    }

    // remove as funções que ja foram executadas e não podem ser duplicadas
    // não pode cessar 2 vezes o mesmo ato
    if (record.cessacao) {
      items = items.filter((item) =>
        item?.key !== '2'
      )
    }

    //não pode insubsistir 2 vezes o mesmo ato 
    // 3 'Tornar insubsistente',
    // 6 'Anular Apostila',
    // 7 'Tornar sem efeito',
    if (record.insubsistencia) {
      items = items.filter((item) =>
        item?.key !== '3' && item?.key !== '6' && item?.key !== '7'
      )
    }

    return items;

  };

  const getTooltipContent = (record: ListagemAtosAdministrativosResponse) => {
    const [data, hora] = formatarDataHora(record.criado_em).split(', ');

    return (
      <div>
        <div>{record.criado_por_nome ?? 'Não informado'}</div>
        <div>Data: {data}</div>
        <div>Hora: {hora}</div>
      </div>
    );
  };


  const columnsBase: TableProps<ListagemAtosAdministrativosResponse>['columns'] = [
    { title: 'Tipo', dataIndex: 'tipo_de_ato', key: 'tipo_de_ato', },
    { title: 'Nº SEI', dataIndex: 'sei_numero', key: 'sei_numero' },
    { title: 'Observações', dataIndex: 'observacoes', key: 'observacoes', width: '20%' },
    ...(
      showCamposExtras ?
        [{ title: 'Portaria de designação', dataIndex: 'portaria', key: 'portaria' },
        { title: 'Servidor indicado', dataIndex: 'nome', key: 'nome' }]
        : []),
    { title: 'Registro Funcional (RF)', dataIndex: 'rf', key: 'rf', render: (rf: string | null) => <span>{rf ?? '-'}</span> },
    {
      title: 'Status', dataIndex: 'status_publicacao', key: 'status_publicacao', render: (_, record) => {
        return (
          TagStatusAtosAdministrativos(record.status_publicacao as StatusAtosAdministrativos, String(record.id) + '_status')
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (record: ListagemAtosAdministrativosResponse) => (
        <div data-no-row-click="true">
          <Dropdown
            menu={{
              items: getItems(record),
            }}
            trigger={['click']}
          >
            <div data-no-row-click="true">
              <MoreOutlined color='#000000' />
            </div>
          </Dropdown>
        </div>
      ),
    },
  ];

  const columns = columnsBase.map((column) => {
    if (column.key === 'action') {
      return column;
    }

    return {
      ...column,
      render: (value: unknown, record: ListagemAtosAdministrativosResponse, index: number) => {
        const columnContent = column.render
          ? column.render(value, record, index)
          : value;

        return (
          <Tooltip title={getTooltipContent(record)}>
            <div>{getColumnContent(columnContent)}</div>
          </Tooltip>
        );
      },
    };
  });

  const handleRowClick = (record: ListagemAtosAdministrativosResponse) => {
    const rotasPorTipo: Record<string, string> = {
      DESIGNACAO: 'listagem-designacoes/visualizar-designacao',
      CESSACAO: 'listagem-cessacoes/visualizar-cessacao',
      APOSTILA: 'listagem-apostilas/visualizar-apostila',
      INSUBSISTENCIA: 'listagem-insubsistencias/visualizar-insubsistencia',
    };

    const path = rotasPorTipo[record.tipo];

    if (path) {
      router.push(`/pages/${path}/${record.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-1 bg-white  ">
      <div className="pb-8">

        <p className="text-[20px] font-bold pt-1 pb-1">{titulo}</p>
        <p className="text-[14px] font-normal pt-1 ">{subtitulo}</p>



      </div>

      <div className="flex flex-row gap-2 pb-4">
        {portaria && (
          <SimpleTag titulo="Nº da portaria" valor={portaria} />
        )}
        {servidor_indicado && (
          <SimpleTag titulo="Servidor indicado" valor={servidor_indicado} />
        )}
      </div>

      <div className="w-full pb-2">
        <Table<ListagemAtosAdministrativosResponse>
          className="tabela-principal w-full"
          scroll={{ x: '100%' }}
          loading={isLoading}
          columns={columns}
          dataSource={data}
          rowKey={(record) => record.id.toString()}
          pagination={false}
          onRow={(record) => {
            return {
              onClick: (event) => {
                const target = event.target as HTMLElement;
                if (target.closest('[data-no-row-click="true"]')) {
                  return;
                }
                handleRowClick(record);
              },
            };
          }}
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

export default ListagemDeAtosAdministrativos;