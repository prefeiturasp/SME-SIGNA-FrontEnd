import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";

import { getDesignacaoUnidadeAction } from "@/actions/designacao-unidade";

import { DesignacaoUnidadeResponse } from "@/types/designacao-unidade";
import useFetchDesignacaoUnidadeMutation from "./useDesignacaoUnidade";

vi.mock("@/actions/designacao-unidade", () => ({
    getDesignacaoUnidadeAction: vi.fn(),
}));
 

const getDesignacaoUnidadeActionMock = getDesignacaoUnidadeAction as Mock;

describe("use DesignacaoUnidade", () => {
    let queryClient: QueryClient;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
    });


    it("trata erro quando a Action lança erro", async () => {
        (getDesignacaoUnidadeActionMock as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
            new Error("Erro ")
        );

        const { result } = renderHook(() => useFetchDesignacaoUnidadeMutation(), { wrapper });

        result.current.mutate("123456");

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
    });


    it("deve buscar os dados da unidade em caso de sucesso", async () => {
        const fakeFuncionario: DesignacaoUnidadeResponse = {
            codigo_hierarquico: "109300013692",
            "funcionarios_unidade": {
                "3360": {
                    "codigo_cargo": 3360,
                    "nome_cargo": "DIRETOR DE ESCOLA",
                    "modulo": "1",
                    "servidores": [
                        {
                            "rf": "7726694",
                            "nome_servidor": "DANIELA MARIA FIGUEIREDO PADOVAN",
                            "vinculo": 1,
                            "lotacao": "JOSE BORGES ANDRADE",
                            "cd_cargo_base": 1,
                            "cargo_base": "AUXILIAR TECNICO DE EDUCACAO - v1",
                            "cd_cargo_sobreposto_funcao_atividade": 2,
                            "cargo_sobreposto_funcao_atividade": "COORDENADOR PEDAGOGICO - v1",
                            "cursos_titulos": "string",
                            "laudo_medico": "Não possui",
                            "local_de_servico": "013692",
                            "local_de_exercicio": "013692",
                        }
                    ]
                }
            },
            cargos: [{ nomeCargo: "Professor", codigoCargo: "123" } ],
            turmas: { total: 10, turnos: [] },
            spi: { tipo: "", total: 0, turnos: [] },
        };

        getDesignacaoUnidadeActionMock.mockResolvedValue({ success: true, data: fakeFuncionario });

        const { result } = renderHook(() => useFetchDesignacaoUnidadeMutation(), { wrapper });
        const response = await result.current.mutateAsync("123456");

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(getDesignacaoUnidadeActionMock).toHaveBeenCalledWith("123456");
        expect(response).toEqual({ success: true, data: fakeFuncionario });
        expect(result.current.data).toEqual({ success: true, data: fakeFuncionario });
        
    });

    it("deve resolver com success: false (sem lançar exceção) quando a action retorna erro", async () => {
        getDesignacaoUnidadeActionMock.mockResolvedValue({
            success: false,
            error: "Falha simulada",
        });

        const { result } = renderHook(() => useFetchDesignacaoUnidadeMutation(), { wrapper });
        const response = await result.current.mutateAsync("123456");
        await waitFor(() => expect(result.current.isSuccess).toBe(true));


        expect(response).toEqual({ success: false, error: "Falha simulada" });
        expect(result.current.isError).toBe(false);
        expect(result.current.data).toEqual({ success: false, error: "Falha simulada" });
    });

    it("deve normalizar mensagem padrão quando success: false e response.error é undefined", async () => {
        getDesignacaoUnidadeActionMock.mockResolvedValue({
            success: false,
            error: undefined,
        });

        const { result } = renderHook(() => useFetchDesignacaoUnidadeMutation(), { wrapper });
        const response = await result.current.mutateAsync("123456");
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(response).toEqual({
            success: false,
            error: "Não foi possível buscar os dados da unidade",
        });
        expect(result.current.isError).toBe(false);
        expect(result.current.data).toEqual({
            success: false,
            error: "Não foi possível buscar os dados da unidade",
        });
    });

    it("deve tratar o erro quando getDesignacaoUnidadeAction lança uma exceção", async () => {
        const error = new Error("Erro de rede");
        getDesignacaoUnidadeActionMock.mockRejectedValue(error);

        const { result } = renderHook(() => useFetchDesignacaoUnidadeMutation(), { wrapper });
        result.current.mutate("123456");

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error).toBe(error);
    });
});
