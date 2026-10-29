import { Card, Typography, Tag, Badge, Descriptions } from "antd";
import AtosRelacionados, { IAtosAdministrativosPrincipalType } from "./AtosRelacionados";
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
  INSUBSISTENTE: {
    color: '#B26A00',
    name: 'Insubsistente',
    background: 'rgba(178, 106, 0, 0.10)',
  },
};

export type StatusDesignacao = keyof typeof NameColorStatusDesignacao;

interface TagStatusDesignacaoProps {
  readonly status: StatusDesignacao;
  readonly dataCessacao?: string | null;
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
  readonly ato: IAtosAdministrativosPrincipalType;
  readonly isLoading: boolean;
}

export default function DesignacaoCard({
  ato,
  isLoading,  
}: Props) {
  const items = [
    {
      key: "1",
      label: "Nº de portaria",
      children: <Text className="designacao-card-valor">{ato.numero_portaria || "-"}</Text>,
    },
    {
      key: "2",
      label: "Cargo",
      children: <Text className="designacao-card-valor">{ato.cargo_display || "-"}</Text>,
    },
    {
      key: "3",
      label: "Servidor indicado",
      children: (
        <Text className="designacao-card-valor">
          {ato.nome_social_servidor_indicado?.trim() || ato.nome_servidor_indicado || "-"}
        </Text>
      ),
    },
  ];

  return (
    <div>
      <Card className="designacao-card ">
        <div className="designacao-card-cabecalho">
          <div className="designacao-card-info">
            <Text strong className="designacao-card-titulo">
              {ato.tipo_ato_display?.trim() || "Designação"}
            </Text>

            <div className="designacao-card-realizacao">
              <Calendar />
              <Text className="designacao-card-data">
                Realizada em {ato.realizada_em || "-"}
              </Text>
            </div>
          </div>

          <TagStatusDesignacao status={ato.status} dataCessacao={ato.data_cessacao} />
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
      </Card>
      <div className="designacao-card-atos">
        <AtosRelacionados atos={ato.atos_relacionados} isLoading={isLoading} />
      </div>
      
    </div>
  );
}
