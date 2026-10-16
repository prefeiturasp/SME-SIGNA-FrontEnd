import { Timeline, Typography, Button, Flex } from "antd";
import { RightOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface IAtosAdministrativosType {
    readonly id: number;
    readonly data: string;
    readonly portaria: string;
    readonly titulo: string;
    readonly descricao: string;
    readonly principal: boolean;
}



interface Props {
    readonly atos: IAtosAdministrativosType[];
    readonly isEditing: boolean;
    readonly isLoading: boolean;
  }
  
export default function AtosRelacionados({ atos=[], isEditing=false, isLoading=false }: Props) {



 

  return (
    <>
      <Flex gap={8} align="center">
      <p className="text-[20px] font-bold pt-1 pb-1">Atos relacionados</p>

        <Text type="secondary">2 registros</Text>
      </Flex>
      <Timeline
        variant="filled"

        style={{ marginTop: 20 }}
        items={atos.map((ato) => ({
          key: ato.id,
          className: ato.principal
            ? 'ato-relacionado-principal'
            : 'ato-relacionado-secundario',
          content: (
            <Flex justify="space-between" align="center">
              <Flex gap={16}>
                <div>
                  <Text strong>Data do ato</Text>
                  <br />
                  <Text>{ato.data}</Text>
                </div>
                <div>
                  <Text strong>Portaria</Text>
                  <br />
                  <Text>{ato.portaria}</Text>
                </div>
                <div>
                  <Text strong>{ato.titulo}</Text>
                  <br />
                  <Text type="secondary">
                    {ato.descricao}
                  </Text>
                </div>
              </Flex>

              <Button
                type="link"
                danger
                icon={<RightOutlined />}
                iconPlacement="end"
              >
                Detalhes
              </Button>
            </Flex>
          ),
        }))}
      />
    </>
  );
}