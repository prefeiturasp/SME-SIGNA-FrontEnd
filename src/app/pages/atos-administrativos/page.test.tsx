import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AtosAdministrativos from "./page";

const listagemSpy = vi.fn();
const pageHeaderSpy = vi.fn();
const hookSpy = vi.fn();
const filtroSpy = vi.fn();
const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

const onPageChangeMock = vi.fn();
const onSubmitFilterFormMock = vi.fn();
const handleClearMock = vi.fn();
const handleSubmitMock = vi.fn((callback: (...args: any[]) => unknown) => (event?: Event) => {
  callback();
  event?.preventDefault();
});

vi.mock("@/hooks/useAtosAdministrativos", () => ({
  useAtosAdministrativos: () => hookSpy(),
}));

vi.mock("react-hook-form", () => ({
  FormProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: (props: any) => {
    pageHeaderSpy(props);
    return (
      <header>
        <span data-testid="page-header-title">{props.title}</span>
        {props.createButton}
      </header>
    );
  },
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="quadro-branco">{children}</section>
  ),
}));

vi.mock("@/components/dashboard/Designacao/ListagemDeAtosAdministrativos/ListagemDeAtosAdministrativos", () => ({
  default: (props: any) => {
    listagemSpy(props);
    return (
      <div>
        <span data-testid="list-data-length">{props.data.length}</span>
        <span data-testid="list-total">{props.total}</span>
        <span data-testid="list-page">{props.page}</span>
        <span data-testid="list-loading">{String(props.isLoading)}</span>
        <button onClick={() => props.onPageChange?.(9)}>mudar pagina</button>
      </div>
    );
  },
}));

vi.mock("@/components/dashboard/Designacao/FiltroDeATosAdministrativos/FiltroDeATosAdministrativos.tsx", () => ({
  default: ({ onClear }: { onClear: () => void }) => {
    filtroSpy({ onClear });
    return <button onClick={onClear}>limpar filtro</button>;
  },
}));

vi.mock("antd", () => ({
  Dropdown: ({
    children,
    menu,
  }: {
    children: React.ReactNode;
    menu?: { items?: Array<{ key: string; label?: React.ReactNode; onClick?: () => void }> };
  }) => (
    <div>
      {children}
      {menu?.items?.map((item) => (
        <button key={item.key} data-testid={`menu-item-${item.key}`} onClick={item.onClick}>
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...rest
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...rest}>{children}</button>,
}));

vi.mock("@/assets/icons/Designacao", () => ({ default: () => <span data-testid="icon-designacao" /> }));
vi.mock("@/assets/icons/Cancelar", () => ({ default: () => <span data-testid="icon-cancelar" /> }));
vi.mock("@/assets/icons/DocumentoErro", () => ({ default: () => <span data-testid="icon-documento-erro" /> }));
vi.mock("@/assets/icons/Editar", () => ({ default: () => <span data-testid="icon-editar" /> }));
vi.mock("@/assets/icons/Delete", () => ({ default: () => <span data-testid="icon-delete" /> }));
vi.mock("@/assets/icons/Plus", () => ({ default: () => <span data-testid="icon-plus" /> }));

describe("Página de atos administrativos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookSpy.mockReturnValue({
      isPending: false,
      tabelaKey: 0,
      resultado: undefined,
      onPageChange: onPageChangeMock,
      page: 1,
      filterForm: {
        handleSubmit: handleSubmitMock,
      },
      onSubmitFilterForm: onSubmitFilterFormMock,
      handleClear: handleClearMock,
    });
  });

  it("renderiza com fallback quando resultado não existe", () => {
    render(<AtosAdministrativos />);

    expect(screen.getByTestId("page-header-title")).toHaveTextContent("Atos administrativos");
    expect(screen.getByTestId("botao-proximo")).toHaveTextContent("Novo ato");
    expect(screen.getByTestId("icon-plus")).toBeInTheDocument();
    expect(screen.getAllByTestId("quadro-branco")).toHaveLength(2);

    expect(screen.getByTestId("list-data-length")).toHaveTextContent("0");
    expect(screen.getByTestId("list-total")).toHaveTextContent("0");
    expect(screen.getByTestId("list-page")).toHaveTextContent("1");
    expect(screen.getByTestId("list-loading")).toHaveTextContent("false");

    expect(pageHeaderSpy).toHaveBeenCalledTimes(1);
    const props = pageHeaderSpy.mock.calls[0][0];
    expect(props.showBackButton).toBe(false);
    expect(props.breadcrumbs).toEqual([{ title: "Início", href: "/" }]);
  });

  it("passa dados do hook para a listagem e mantém callback de paginação", () => {
    hookSpy.mockReturnValue({
      isPending: true,
      tabelaKey: 7,
      resultado: {
        count: 2,
        results: [{ id: 1 }, { id: 2 }],
      },
      onPageChange: onPageChangeMock,
      page: 4,
      filterForm: {
        handleSubmit: handleSubmitMock,
      },
      onSubmitFilterForm: onSubmitFilterFormMock,
      handleClear: handleClearMock,
    });

    render(<AtosAdministrativos />);

    expect(screen.getByTestId("list-data-length")).toHaveTextContent("2");
    expect(screen.getByTestId("list-total")).toHaveTextContent("2");
    expect(screen.getByTestId("list-page")).toHaveTextContent("4");
    expect(screen.getByTestId("list-loading")).toHaveTextContent("true");

    fireEvent.click(screen.getByText("mudar pagina"));
    expect(onPageChangeMock).toHaveBeenCalledWith(9);

    expect(listagemSpy).toHaveBeenCalledTimes(1);
  });

  it("executa ações dos itens do menu de novo ato", () => {
    render(<AtosAdministrativos />);

    fireEvent.click(screen.getByTestId("menu-item-1"));
    fireEvent.click(screen.getByTestId("menu-item-2"));
    fireEvent.click(screen.getByTestId("menu-item-3"));
    fireEvent.click(screen.getByTestId("menu-item-4"));
    fireEvent.click(screen.getByTestId("menu-item-5"));

    expect(consoleLogSpy).toHaveBeenCalledWith("Nova designação");
    expect(consoleLogSpy).toHaveBeenCalledWith("Nova cessação");
    expect(consoleLogSpy).toHaveBeenCalledWith("Tornar insubsistente");
    expect(consoleLogSpy).toHaveBeenCalledWith("Nova apostila");
    expect(consoleLogSpy).toHaveBeenCalledWith("Anular apostila");
  });
});
