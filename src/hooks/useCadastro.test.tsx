import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useCadastro from "./useCadastro";
import * as cadastroActions from "@/actions/cadastro";
import type { CadastroRequest, CadastroResult } from "@/types/cadastro";

describe("useCadastro", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={new QueryClient()}>
            {children}
        </QueryClientProvider>
    );

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("deve retornar sucesso ao cadastrar", async () => {
        const mockResponse: CadastroResult = { success: true };
        vi.spyOn(cadastroActions, "cadastroAction").mockResolvedValueOnce(
            mockResponse
        );

        const { result } = renderHook(() => useCadastro(), { wrapper });

        const cadastroRequest: CadastroRequest = {
            dre: "DRE 1",
            ue: "UE Teste",
            fullName: "Maria Teste",
            cpf: "123.456.789-10",
            email: "teste@sme.prefeitura.sp.gov.br",
        };

        await act(async () => {
            const res = await result.current.mutateAsync(cadastroRequest);
            expect(res).toEqual(mockResponse);
        });
    });

    it("deve retornar erro ao cadastrar", async () => {
        const mockResponse: CadastroResult = { success: false, error: "Erro" };
        vi.spyOn(cadastroActions, "cadastroAction").mockResolvedValueOnce(
            mockResponse
        );

        const { result } = renderHook(() => useCadastro(), { wrapper });

        const cadastroRequest: CadastroRequest = {
            dre: "DRE 1",
            ue: "UE Teste",
            fullName: "Maria Teste",
            cpf: "123.456.789-10",
            email: "teste@sme.prefeitura.sp.gov.br",
        };

        await act(async () => {
            const res = await result.current.mutateAsync(cadastroRequest);
            expect(res).toEqual(mockResponse);
        });
    });

    it("deve atualizar estado de loading corretamente", async () => {
        const mockResponse: CadastroResult = { success: true };
        vi.spyOn(cadastroActions, "cadastroAction").mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(() => resolve(mockResponse), 50)
                )
        );

        const { result } = renderHook(() => useCadastro(), { wrapper });

        const cadastroRequest: CadastroRequest = {
            dre: "DRE 1",
            ue: "UE Teste",
            fullName: "Maria Teste",
            cpf: "123.456.789-10",
            email: "teste@sme.prefeitura.sp.gov.br",
        };

        await act(async () => {
            await result.current.mutateAsync(cadastroRequest);
        });

        expect(result.current.isPending).toBe(false);
    });
});
