import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CargosBase from "./page";

const pushMock = vi.fn();
const pageHeaderSpy = vi.fn();
const filtroSpy = vi.fn();
const handleClearMock = vi.fn();
const onSubmitFilterFormMock = vi.fn();
const listagemSpy = vi.fn();
const handleSubmitMock = vi.fn((callback: (...args: unknown[]) => unknown) => (event?: Event) => {
  callback({ submitted: true });
  event?.preventDefault();
});
const useCargosBaseMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useVisualizarCargosBase", () => ({
  useVisualizarCargosBase: () => useCargosBaseMock(),
}));

vi.mock("react-hook-form", () => ({
  FormProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: (props: Record<string, unknown>) => {
    pageHeaderSpy(props);
    return (
      <header>
        <span data-testid="page-title">{props.title as React.ReactNode}</span>
        {props.createButton as React.ReactNode}
      </header>
    );
  },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
    <button {...rest}>{children}</button>
  ),
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="quadro-branco">{children}</section>
  ),
}));

vi.mock("@/components/dashboard/Gestao/FiltroDeCargosBase/FiltroDeCargosBase", () => ({
  default: ({ onClear }: { onClear: () => void }) => {
    filtroSpy({ onClear });
    return (
      <button type="button" data-testid="mock-filtro-clear" onClick={onClear}>
        limpar
      </button>
    );
  },
}));

vi.mock("@/components/dashboard/Gestao/ListagemDeCargos/ListagemDeCargos", () => ({
  default: (props: Record<string, unknown>) => {
    listagemSpy(props);
    return <div>listagem de cargos base</div>;
  },
}));

vi.mock("@/assets/icons/Plus", () => ({
  default: () => <span data-testid="icon-plus" />,
}));

describe("Página Gestão de cargos base", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCargosBaseMock.mockReturnValue({
      isPending: false,
      resultado: null,
      onPageChange: vi.fn(),
      page: 1,
      filterForm: {
        handleSubmit: handleSubmitMock,
      },
      onSubmitFilterForm: onSubmitFilterFormMock,
      handleClear: handleClearMock,
    });
  });

  it("renderiza header, breadcrumbs e conteúdo base", () => {
    render(<CargosBase />);

    expect(screen.getByTestId("page-title")).toHaveTextContent("Gestão de cargos base");
    expect(screen.getByTestId("botao-proximo")).toHaveTextContent("Cadastrar novo cargo");
    expect(screen.getByTestId("icon-plus")).toBeInTheDocument();
    expect(screen.getAllByTestId("quadro-branco")).toHaveLength(2);
    expect(screen.getByText("listagem de cargos base")).toBeInTheDocument();

    const headerProps = pageHeaderSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(headerProps.showBackButton).toBe(false);
    expect(headerProps.breadcrumbs).toEqual([
      { title: "Início", href: "/" },
      { title: "Gestão", href: "/" },
      { title: "Cargos base", href: "" },
    ]);

    expect(listagemSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [],
        total: 0,
        page: 1,
        isLoading: false,
      }),
    );
  });

  it("submete o formulário e chama callback de limpeza de filtros", () => {
    render(<CargosBase />);

    fireEvent.submit(screen.getByRole("button", { name: "limpar" }).closest("form") as HTMLFormElement);
    expect(handleSubmitMock).toHaveBeenCalledWith(onSubmitFilterFormMock);
    expect(onSubmitFilterFormMock).toHaveBeenCalledWith({ submitted: true });

    fireEvent.click(screen.getByTestId("mock-filtro-clear"));
    expect(handleClearMock).toHaveBeenCalledTimes(1);
    expect(filtroSpy).toHaveBeenCalledWith({ onClear: handleClearMock });
  });

  it("repassa dados e estado de loading para a listagem quando houver resultado", () => {
    const onPageChangeMock = vi.fn();
    useCargosBaseMock.mockReturnValue({
      isPending: true,
      resultado: {
        count: 2,
        results: [{ id: 10 }, { id: 20 }],
      },
      onPageChange: onPageChangeMock,
      page: 3,
      filterForm: {
        handleSubmit: handleSubmitMock,
      },
      onSubmitFilterForm: onSubmitFilterFormMock,
      handleClear: handleClearMock,
    });

    render(<CargosBase />);

    expect(listagemSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ id: 10 }, { id: 20 }],
        total: 2,
        page: 3,
        isLoading: true,
        onPageChange: onPageChangeMock,
      }),
    );
  });

  it("navega para cadastro de cargo base ao clicar no botão do header", () => {
    render(<CargosBase />);

    fireEvent.click(screen.getByTestId("botao-proximo"));
    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/criar-editar-cargo-base");
  });
});
