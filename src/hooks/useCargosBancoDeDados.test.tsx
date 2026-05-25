import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import {
    useFetchCargosBase,
    useFetchCargosSobrepostos,
} from "./useCargosBancoDeDados";
import * as cargosActions from "@/actions/cargos-banco-de-dados";
import { ICargoType } from "@/types/cargos";

describe("useFetchCargosBancoDeDados", () => {
    let queryClient: QueryClient;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
    });

    describe("useFetchCargosBase", () => {
        const fakeCargosBase: ICargoType[] = [
            { codigoCargo: 1, nomeCargo: "Cargo Base 1" },
            { codigoCargo: 2, nomeCargo: "Cargo Base 2" },
        ];

        it("retorna os cargos base com sucesso", async () => {
            vi.spyOn(
                cargosActions,
                "getCargosBaseBancoDeDados"
            ).mockResolvedValueOnce(fakeCargosBase);

            const { result } = renderHook(() => useFetchCargosBase(), {
                wrapper,
            });

            await waitFor(() => {
                expect(result.current.data).toEqual(fakeCargosBase);
            });
        });

        it("retorna loading enquanto busca cargos base", () => {
            vi.spyOn(
                cargosActions,
                "getCargosBaseBancoDeDados"
            ).mockImplementation(() => new Promise(() => { }));

            const { result } = renderHook(() => useFetchCargosBase(), {
                wrapper,
            });

            expect(result.current.isLoading).toBe(true);
            expect(result.current.data).toBeUndefined();
        });

        it("retorna erro quando falha ao buscar cargos base", async () => {
            const error = new Error("Erro ao buscar cargos base");

            vi.spyOn(
                cargosActions,
                "getCargosBaseBancoDeDados"
            ).mockRejectedValueOnce(error);

            const { result } = renderHook(() => useFetchCargosBase(), {
                wrapper,
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toEqual(error);
        });
    });

    describe("useFetchCargosSobrepostos", () => {
        const fakeCargosSobrepostos: ICargoType[] = [
            { codigoCargo: 10, nomeCargo: "Cargo Sobreposto 1" },
            { codigoCargo: 20, nomeCargo: "Cargo Sobreposto 2" },
        ];

        it("retorna os cargos sobrepostos com sucesso", async () => {
            vi.spyOn(
                cargosActions,
                "getCargosSobrepostosBancoDeDados"
            ).mockResolvedValueOnce(fakeCargosSobrepostos);

            const { result } = renderHook(() => useFetchCargosSobrepostos(), {
                wrapper,
            });

            await waitFor(() => {
                expect(result.current.data).toEqual(fakeCargosSobrepostos);
            });
        });

        it("retorna loading enquanto busca cargos sobrepostos", () => {
            vi.spyOn(
                cargosActions,
                "getCargosSobrepostosBancoDeDados"
            ).mockImplementation(() => new Promise(() => { }));

            const { result } = renderHook(
                () => useFetchCargosSobrepostos(),
                { wrapper }
            );

            expect(result.current.isLoading).toBe(true);
            expect(result.current.data).toBeUndefined();
        });

        it("retorna erro quando falha ao buscar cargos sobrepostos", async () => {
            const error = new Error("Erro ao buscar cargos sobrepostos");

            vi.spyOn(
                cargosActions,
                "getCargosSobrepostosBancoDeDados"
            ).mockRejectedValueOnce(error);

            const { result } = renderHook(
                () => useFetchCargosSobrepostos(),
                { wrapper }
            );

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toEqual(error);
        });
    });
});