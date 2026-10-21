import { Card, Typography, Tag, Badge, Descriptions } from "antd";
import AtosRelacionados, { IAtosAdministrativosType } from "./AtosRelacionados";
import Calendar from "@/assets/icons/CustomCalendar";

const { Text } = Typography;

const NameColorStatusDesignacao = {
  EM_VIGENCIA: {
    color: '#008809',
    name: 'Em vigência',
    background: 'rgba(0, 136, 9, 0.10)',
  },
  CESSADA: {
    color: '#B22B2A',
    name: 'Cessada',
    background: 'rgba(178, 43, 42, 0.10)',
  },
};

export type StatusDesignacao = keyof typeof NameColorStatusDesignacao;

interface TagStatusDesignacaoProps {
  readonly status: StatusDesignacao;
  readonly dataCessacao?: string;
}

export function TagStatusDesignacao({ status, dataCessacao }: TagStatusDesignacaoProps) {
  const config = NameColorStatusDesignacao[status];

  const texto =
    status === 'CESSADA' && dataCessacao ? `${config.name} em ${dataCessacao}` : config.name;

  return (
    <Tag className="designacao-status-tag" style={{ background: config.background }}>
      <Badge color={config.color} />
      {texto}
    </Tag>
  );
}

interface Props {
  readonly atos: IAtosAdministrativosType[];
  readonly isLoading: boolean;
  readonly status?: StatusDesignacao;
  readonly dataCessacao?: string;
}

export default function DesignacaoCard({
  atos,
  isLoading,
  status = 'EM_VIGENCIA',
  dataCessacao,
}: Props) {
  const items = [
    {
      key: "1",
      label: "Nº de portaria",
      children: <Text className="designacao-card-valor">1234567/2026</Text>,
    },
    {
      key: "2",
      label: "Cargo",
      children: <Text className="designacao-card-valor">DIRETOR DE ESCOLA</Text>,
    },
    {
      key: "3",
      label: "Servidor indicado",
      children: <Text className="designacao-card-valor">TATIANE CRISTINA MARQUES</Text>,
    },
  ];

  return (
    <>
      <div className="rounded-t-md border-l-2 border-l-[#B22B2A] 
       border-r border-[#D0D0D0] border-b border-[#D0D0D0]      
       
       

      ">        
      

        <div className="designacao-card-cabecalho">
          <div className="designacao-card-info">
            <Text strong className="designacao-card-titulo">
              Designação
            </Text>

            <div className="designacao-card-realizacao">
              <Calendar />
              <Text className="designacao-card-data">
                Realizada em 15/02/2026
              </Text>
            </div>
          </div>

          <TagStatusDesignacao status={status} dataCessacao={dataCessacao} />
        </div>

        <div className="designacao-card-divisor" />

        <div className="designacao-card-detalhes">
          <Descriptions
            layout="vertical"
            column={{ xs: 1, sm: 3 }}
            size="small"
            colon={false}
            items={items}
          />
        </div>
      </div>
      <div className="designacao-card-atos">
        <AtosRelacionados atos={atos} isLoading={isLoading} />
      </div>   
    </>
  );
}
