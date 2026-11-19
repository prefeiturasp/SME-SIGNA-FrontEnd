import type { TableProps } from 'antd';
import { ListagemPortariasResponse } from '@/types/designacao';
import { formatDate } from '@/utils/formatDate';
import { nomeDreSemPrefixo } from '@/utils/designacao/nomeDreSemPrefixo';

type ColunasListagemDeDo = NonNullable<TableProps<ListagemPortariasResponse>['columns']>;

export const colunasListagemDeDo: ColunasListagemDeDo = [
  { title: 'PORTARIA', dataIndex: 'numero_portaria', key: 'numero_portaria' },
  { title: 'TIPO DE ATO', dataIndex: 'tipo_de_ato', key: 'tipo_de_ato', },
  { title: 'NOME', dataIndex: 'nome', key: 'nome' },
  { title: 'CARGO', dataIndex: 'cargo', key: 'cargo' },
  { title: 'D.O', dataIndex: 'doc', key: 'doc', render: (text: string | null) => formatDate(text) },
  { title: 'DATA DA DESIGNAÇÃO', dataIndex: 'data_designacao', key: 'data_designacao', render: (text: string | null) => formatDate(text) },
  { title: 'DATA DA CESSAÇÃO', dataIndex: 'data_cessacao', key: 'data_cessacao', render: (text: string | null) => formatDate(text) },
  { title: 'Nº SEI', dataIndex: 'sei_numero', key: 'sei_numero' }
];

export const colunaDreListagemDeDo: ColunasListagemDeDo[number] = {
  title: 'DRE',
  key: 'dre',
  render: (_: unknown, record: ListagemPortariasResponse) => nomeDreSemPrefixo(record.designacao?.dre_nome),
};

export const montarColunasListagemDeDo = (exibirColunaDre = false): ColunasListagemDeDo => {
  if (!exibirColunaDre) return colunasListagemDeDo;

  const posicaoAposDoc = colunasListagemDeDo.findIndex((coluna) => coluna.key === 'doc') + 1;
  return [
    ...colunasListagemDeDo.slice(0, posicaoAposDoc),
    colunaDreListagemDeDo,
    ...colunasListagemDeDo.slice(posicaoAposDoc),
  ];
};
