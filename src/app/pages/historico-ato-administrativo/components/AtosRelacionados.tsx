import { Timeline, Typography, Flex } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/button";
import router from "next/router";

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

export default function AtosRelacionados({ atos = [], isEditing = false, isLoading = false }: Props) {




    const getAtoClassName = (item: IAtosAdministrativosType) => {
        if (!item.data) return 'ato-relacionado-vazio';
        if (item.principal) return 'ato-relacionado-principal';
        return 'ato-relacionado-secundario';
    };

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
                    className: getAtoClassName(ato),
                    content: (
                        <Flex justify="space-between" align="center">
                            {ato.data && (
                                <>
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
                                        size="lg"
                                        type="button"                                        
                                        className="gap-2 bg-transparent border-none"
                                        data-testid="btn-voltar"
                                        onClick={() => router.push(`/pages/visualizar-designacao/${ato.id}`)}
                                    >
                                        <span className="font-bold">Detalhes</span>
                                        <RightOutlined width={24} height={24} />
                                    </Button>
                                </>
                            )}
                        </Flex>

                    ),
                }))}
            />

        </>
    );
}