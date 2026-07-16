import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AtosAdministrativos from "./page";

const pageHeaderSpy = vi.fn();
const listagemSpy = vi.fn();
const filtroSpy = vi.fn();
const hookSpy = vi.fn();
const backMock = vi.fn();
const searchParamsGetMock = vi.fn();
const onSubmitFilterFormMock = vi.fn();
const onPageChangeMock = vi.fn();
const handleClearMock = vi.fn();
const handleSubmitMock = vi.fn((callback: (...args: unknown[]) => void) => (event?: Event) => {
  callback();
  event?.preventDefault();
});

type GenericProps = Record<string, unknown>;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: backMock }),
  useSearchParams: () => ({
    get: searchParamsGetMock,
  }),
}));

vi.mock("react-hook-form", () => ({
  FormProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/useAtosAdministrativos", () => ({
  useAtosAdministrativos: (...args: unknown[]) => hookSpy(...args),
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: (props: GenericProps) => {
    pageHeaderSpy(props);
    return <header data-testid="page-header">{props.title as React.ReactNode}</header>;
  },
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="quadro-branco">{children}</section>
  ),
}));

vi.mock("@/components/dashboard/Designacao/FiltroDeAtosAdministrativos/FiltroDeHistoricoDeAtosAdministrativos", () => ({
  default: ({ onClear }: { onClear?: () => void }) => {
    filtroSpy({ onClear });
    return (
      <button type="button" data-testid="filtro-clear" onClick={onClear}>
        limpar filtro
      </button>
    );
  },
}));

vi.mock("@/components/dashboard/Designacao/ListagemDeAtosAdministrativos/ListagemDeAtosAdministrativos", () => ({
  default: (props: GenericProps) => {
    listagemSpy(props);
    const onPageChange = props.onPageChange as ((page: number) => void) | undefined;
    return (
      <div data-testid="listagem">
        <span data-testid="list-data-length">{((props.data as unknown[]) ?? []).length}</span>
        <span data-testid="list-total">{String(props.total)}</span>
        <span data-testid="list-page">{String(props.page)}</span>
        <span data-testid="list-loading">{String(props.isLoading)}</span>
        <span data-testid="list-show-campos-extras">{String(props.showCamposExtras)}</span>
        <button type="button" onClick={() => onPageChange?.(9)}>
          mudar pagina
        </button>
      </div>
    );
  },
}));

describe("Página de histórico de ato administrativo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsGetMock.mockImplementation((key: string) => {
      const params: Record<string, string> = {
        id: "42",
        tipo: "DESIGNACAO",
        ato_raiz_id: "11",
        tipo_display: "Designação",
      };
      return params[key] ?? null;
    });

    hookSpy.mockReturnValue({
      isPending: false,
      tabelaKey: 1,
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

  it("monta header com título dinâmico e breadcrumb de detalhes com retorno", () => {
    render(<AtosAdministrativos />);

    expect(pageHeaderSpy).toHaveBeenCalledTimes(1);
    const props = pageHeaderSpy.mock.calls[0][0];
    expect(props.title).toBe("Histórico da Designação");
    expect(props.showBackButton).toBe(true);
    expect(props.breadcrumbs).toHaveLength(3);
    expect(props.breadcrumbs[1].title).toBe("Detalhes Designação");

    const event = { preventDefault: vi.fn() } as unknown as React.MouseEvent<HTMLAnchorElement>;
    props.breadcrumbs[1].onClick(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(backMock).toHaveBeenCalledTimes(1);
  });

  it("repassa dados do hook para listagem com fallback e showCamposExtras=false", () => {
    render(<AtosAdministrativos />);

    expect(screen.getByTestId("list-data-length")).toHaveTextContent("0");
    expect(screen.getByTestId("list-total")).toHaveTextContent("0");
    expect(screen.getByTestId("list-page")).toHaveTextContent("1");
    expect(screen.getByTestId("list-loading")).toHaveTextContent("false");
    expect(screen.getByTestId("list-show-campos-extras")).toHaveTextContent("false");
  });

  it("propaga paginação e clear quando os componentes filhos disparam callbacks", () => {
    render(<AtosAdministrativos />);

    fireEvent.click(screen.getByText("mudar pagina"));
    expect(onPageChangeMock).toHaveBeenCalledWith(9);

    fireEvent.click(screen.getByTestId("filtro-clear"));
    expect(handleClearMock).toHaveBeenCalledTimes(1);
  });

  it("submete formulário usando handleSubmit do react-hook-form", () => {
    hookSpy.mockReturnValue({
      isPending: true,
      tabelaKey: 2,
      resultado: { count: 2, results: [{ id: 1 }, { id: 2 }] },
      onPageChange: onPageChangeMock,
      page: 4,
      filterForm: {
        handleSubmit: handleSubmitMock,
      },
      onSubmitFilterForm: onSubmitFilterFormMock,
      handleClear: handleClearMock,
    });

    render(<AtosAdministrativos />);
    const formElement = document.querySelector("form");
    expect(formElement).not.toBeNull();
    fireEvent.submit(formElement as HTMLFormElement);

    expect(handleSubmitMock).toHaveBeenCalledWith(onSubmitFilterFormMock);
    expect(onSubmitFilterFormMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("list-data-length")).toHaveTextContent("2");
    expect(screen.getByTestId("list-total")).toHaveTextContent("2");
    expect(screen.getByTestId("list-page")).toHaveTextContent("4");
    expect(screen.getByTestId("list-loading")).toHaveTextContent("true");
  });
});
