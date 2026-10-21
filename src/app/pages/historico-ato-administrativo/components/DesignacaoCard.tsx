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
    <Tag
      className="
      !m-0
      !flex
      !items-center
      !gap-1.5
      !rounded-md
      !border-0
      !px-2
      !py-0.5
      !text-xs
    "
      style={{ background: config.background }}
    >
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
      children: <Text className="text-[#313131]">1234567/2026</Text>,
    },
    {
      key: "2",
      label: "Cargo",
      children: <Text className="text-[#313131]">DIRETOR DE ESCOLA</Text>,
    },
    {
      key: "3",
      label: "Servidor indicado",
      children: <Text className="text-[#313131]">TATIANE CRISTINA MARQUES</Text>,
    },
  ];

  return (
    <>
      <Card
        className="
        !bg-[#F1F5F9]
        !border-l-2
        !border-l-[#B22B2A]        
        !border-t-[#D0D0D0]
        !border-r-[#D0D0D0]                       
        !rounded-t-lg !rounded-b-none               
      "
       
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div className="flex items-start justify-between p-4">
          <div className="flex flex-col gap-1">
            <Text strong className="!text-lg">
              Designação
            </Text>

            <div className="flex items-center gap-1.5">
              
              <Calendar className="text-[#313131]" />
              <Text className="!text-xs">
                Realizada em 15/02/2026
              </Text>
            </div>
          </div>

          <TagStatusDesignacao status={status} dataCessacao={dataCessacao} />
        </div>

        <div className="border-t border-[#C8C8C8]" />

        <div className="px-3 py-2.5">
          <Descriptions
            layout="vertical"
            column={{ xs: 1, sm: 3 }}
            size="small"
            colon={false}
            items={items}
          />
        </div>
      </Card>
      <div 
      className="
        !border-b
        !border-x        
        !border-[#D0D0D0]              
        !rounded-b-md        
        p-4
        pt-8
      ">
        <AtosRelacionados atos={atos} isLoading={isLoading} />
      </div>
    </>
  );
}
