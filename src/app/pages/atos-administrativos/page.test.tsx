import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AtosAdministrativos from "./page";

const listagemSpy = vi.fn();
const pageHeaderSpy = vi.fn();
const hookSpy = vi.fn();
const novoAtoHookSpy = vi.fn();
const modalBuscaPortariaSpy = vi.fn();
const filtroSpy = vi.fn();
const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

const onPageChangeMock = vi.fn();
const onSubmitFilterFormMock = vi.fn();
const handleClearMock = vi.fn();
const buscarMock = vi.fn();
const limparErroMock = vi.fn();
const pushMock = vi.fn();
const handleSubmitMock = vi.fn((callback: (...args: unknown[]) => unknown) => (event?: Event) => {
  callback();
  event?.preventDefault();
});

type GenericProps = Record<string, unknown>;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useAtosAdministrativos", () => ({
  useAtosAdministrativos: () => hookSpy(),
}));

vi.mock("@/hooks/useNovoAto", () => ({
  useNovoAto: () => novoAtoHookSpy(),
}));

vi.mock("@/components/dashboard/Designacao/ModalBuscaPortaria/ModalBuscaPortaria", () => ({
  default: (props: GenericProps) => {
    modalBuscaPortariaSpy(props);
    return (
      <div data-testid="modal-busca-portaria">
        <span data-testid="modal-title">{props.title as React.ReactNode}</span>
        <span data-testid="modal-field-label">{props.fieldLabel as React.ReactNode}</span>
        <span data-testid="modal-ano-field-label">{props.anoFieldLabel as React.ReactNode}</span>
        <button
          data-testid="modal-fechar"
          onClick={() => (props.onOpenChange as (open: boolean) => void)(false)}
        >
          fechar
        </button>
        <button
          data-testid="modal-buscar"
          onClick={() => (props.onSubmit as (portaria: string, ano: string) => void)("100/2026", "2026")}
        >
          buscar
        </button>
      </div>
    );
  },
}));

vi.mock("react-hook-form", () => ({
  FormProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: (props: GenericProps) => {
    pageHeaderSpy(props);
    return (
      <header>
        <span data-testid="page-header-title">{props.title as React.ReactNode}</span>
        {props.createButton as React.ReactNode}
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
  default: (props: GenericProps) => {
    listagemSpy(props);
    const data = (props.data as unknown[]) ?? [];
    const total = props.total as React.ReactNode;
    const page = props.page as React.ReactNode;
    const isLoading = props.isLoading as boolean;
    const onPageChange = props.onPageChange as ((page: number) => void) | undefined;

    return (
      <div>
        <span data-testid="list-data-length">{data.length}</span>
        <span data-testid="list-total">{total}</span>
        <span data-testid="list-page">{page}</span>
        <span data-testid="list-loading">{String(isLoading)}</span>
        <button onClick={() => onPageChange?.(9)}>mudar pagina</button>
      </div>
    );
  },
}));

vi.mock("@/components/dashboard/Designacao/FiltroDeAtosAdministrativos/FiltroDeAtosAdministrativos", () => ({
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
vi.mock("@/assets/icons/DocumentoAlerta", () => ({ default: () => <span data-testid="icon-documento-alerta" /> }));
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
    novoAtoHookSpy.mockReturnValue({
      buscar: buscarMock,
      isLoading: false,
      errorMessage: null,
      limparErro: limparErroMock,
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

  it("não exibe o modal de busca por padrão", () => {
    render(<AtosAdministrativos />);

    expect(screen.queryByTestId("modal-busca-portaria")).not.toBeInTheDocument();
  });

  it.each([
    ["3", "Nova cessação", "Portaria de designação", "Ano da designação"],
    ["4", "Nova insubsistência", "Portaria de designação ou cessação", "Ano da designação ou cessação"],
    ["6", "Novo ato de tornar sem efeito", "Portaria da insubsistência", "Ano da insubsistência"],
    ["2", "Nova apostila", "Portaria de designação ou cessação", "Ano da designação ou cessação"],
    ["1", "Nova anulação de apostila", "Portaria de designação ou cessação", "Ano da designação ou cessação"],
  ])("abre o modal correto ao clicar no item de menu %s", (key, title, fieldLabel, anoFieldLabel) => {
    render(<AtosAdministrativos />);

    fireEvent.click(screen.getByTestId(`menu-item-${key}`));

    expect(screen.getByTestId("modal-busca-portaria")).toBeInTheDocument();
    expect(screen.getByTestId("modal-title")).toHaveTextContent(title);
    expect(screen.getByTestId("modal-field-label")).toHaveTextContent(fieldLabel);
    expect(screen.getByTestId("modal-ano-field-label")).toHaveTextContent(anoFieldLabel);
  });

  it("navega direto para o fluxo de nova designação, sem abrir modal de busca", () => {
    render(<AtosAdministrativos />);

    fireEvent.click(screen.getByTestId("menu-item-5"));

    expect(pushMock).toHaveBeenCalledWith("/pages/designacoes/designacoes-passo-1");
    expect(screen.queryByTestId("modal-busca-portaria")).not.toBeInTheDocument();
  });

  it("chama buscar do useNovoAto com o tipo, a portaria e o ano informados", () => {
    render(<AtosAdministrativos />);

    fireEvent.click(screen.getByTestId("menu-item-3"));
    fireEvent.click(screen.getByTestId("modal-buscar"));

    expect(buscarMock).toHaveBeenCalledWith("cessacao", "100/2026", "2026");
  });

  it("fecha o modal e limpa o erro ao chamar onOpenChange(false)", () => {
    render(<AtosAdministrativos />);

    fireEvent.click(screen.getByTestId("menu-item-1"));
    expect(screen.getByTestId("modal-busca-portaria")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("modal-fechar"));

    expect(screen.queryByTestId("modal-busca-portaria")).not.toBeInTheDocument();
    expect(limparErroMock).toHaveBeenCalled();
  });

  it("repassa isLoading e errorMessage do useNovoAto para o modal", () => {
    novoAtoHookSpy.mockReturnValue({
      buscar: buscarMock,
      isLoading: true,
      errorMessage: "Nenhum registro foi encontrado para essa portaria.",
      limparErro: limparErroMock,
    });

    render(<AtosAdministrativos />);
    fireEvent.click(screen.getByTestId("menu-item-2"));

    const props = modalBuscaPortariaSpy.mock.calls[0][0];
    expect(props.isLoading).toBe(true);
    expect(props.errorMessage).toBe("Nenhum registro foi encontrado para essa portaria.");
  });
});
