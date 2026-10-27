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

vi.mock("@/hooks/useHistoricoDeDesignacoes", () => ({
  useHistoricoDeDesignacoes: (...args: unknown[]) => hookSpy(...args),
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

vi.mock("@/components/dashboard/Designacao/ListagemDeDesignacaoDaUnidade/ListagemDeDesignacaoDaUnidade", () => ({
  default: (props: GenericProps) => {
    listagemSpy(props);
    return (
      <div data-testid="listagem">
        <span data-testid="list-data-length">{((props.data as unknown[]) ?? []).length}</span>
        <span data-testid="list-loading">{String(props.isLoading)}</span>
        <span data-testid="list-ue">{String(props.ue)}</span>
        <span data-testid="list-titulo">{String(props.titulo)}</span>
        <span data-testid="list-subtitulo">{String(props.subtitulo)}</span>
      </div>
    );
  },
}));

const designacaoHistorico = {
  id: 1,
  status: "insubsistente",
  numero_portaria: 12,
  ano_vigente: "2021",
  portaria: "12/2021",
  sei_numero: "12",
  doc: null,
  ue: "014591",
  dre: "108100",
  dre_nome: "DIRETORIA REGIONAL DE EDUCACAO BUTANTA",
  unidade_proponente: "EMEI - BENEDICTO CASTRUCCI, PROF.",
  codigo_hierarquico: "162100000140000",
  cargo: "DIRETOR DE ESCOLA",
  servidor_indicado: "VANESSA GUSTAVO DA SILVA",
  indicado_rf: "7914229",
  data_inicio: "2012-09-30",
  data_fim: null,
  vigente: false,
  cessada_em: null,
  atos_relacionados: [],
};

describe("Página de histórico de ato administrativo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsGetMock.mockImplementation((key: string) => {
      const params: Record<string, string> = {
        ue: "014591",
      };
      return params[key] ?? null;
    });

    hookSpy.mockReturnValue({
      isPending: false,
      tabelaKey: 1,
      resultado: null,
      filterForm: {
        handleSubmit: handleSubmitMock,
      },
      onSubmitFilterForm: onSubmitFilterFormMock,
      handleClear: handleClearMock,
    });
  });

  it("monta header com título da unidade e breadcrumb de detalhes com retorno", () => {
    render(<AtosAdministrativos />);

    expect(pageHeaderSpy).toHaveBeenCalledTimes(1);
    const props = pageHeaderSpy.mock.calls[0][0];
    expect(props.title).toBe("Histórico da unidade proponente");
    expect(props.showBackButton).toBe(true);
    expect(props.breadcrumbs).toHaveLength(3);
    expect(props.breadcrumbs[1].title).toBe("Detalhes designação");

    const event = { preventDefault: vi.fn() } as unknown as React.MouseEvent<HTMLAnchorElement>;
    props.breadcrumbs[1].onClick(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(backMock).toHaveBeenCalledTimes(1);
  });

  it("repassa dados do hook e a unidade para a listagem", () => {
    render(<AtosAdministrativos />);

    expect(screen.getByTestId("list-data-length")).toHaveTextContent("0");
    expect(screen.getByTestId("list-loading")).toHaveTextContent("false");
    expect(screen.getByTestId("list-ue")).toHaveTextContent("014591");
    expect(screen.getByTestId("list-titulo")).toHaveTextContent("Histórico");
    expect(screen.getByTestId("list-subtitulo")).toHaveTextContent(
      "Consulte as designações e os atos administrativos relacionados a esta unidade educacional."
    );
  });

  it("usa o código da unidade informado na query string", () => {
    searchParamsGetMock.mockImplementation((key: string) =>
      key === "ue" ? "123456" : null
    );

    render(<AtosAdministrativos />);

    expect(hookSpy.mock.calls[0][0]).toBe("123456");
    expect(screen.getByTestId("list-ue")).toHaveTextContent("123456");
  });

  it("usa o código padrão quando a query string não informa ue", () => {
    searchParamsGetMock.mockReturnValue(null);

    render(<AtosAdministrativos />);

    expect(hookSpy.mock.calls[0][0]).toBe("014591");
    expect(screen.getByTestId("list-ue")).toHaveTextContent("014591");
  });

  it("exibe o nome da unidade proponente retornado pela API", () => {
    hookSpy.mockReturnValue({
      isPending: false,
      tabelaKey: 1,
      resultado: [designacaoHistorico],
      filterForm: {
        handleSubmit: handleSubmitMock,
      },
      onSubmitFilterForm: onSubmitFilterFormMock,
      handleClear: handleClearMock,
    });

    render(<AtosAdministrativos />);

    expect(screen.getByTestId("list-ue")).toHaveTextContent(
      "EMEI - BENEDICTO CASTRUCCI, PROF."
    );
  });

  it("monta os filtros iniciais para o hook de histórico", () => {
    render(<AtosAdministrativos />);

    expect(hookSpy).toHaveBeenCalledTimes(1);
    expect(hookSpy.mock.calls[0][0]).toBe("014591");
    expect(hookSpy.mock.calls[0][1]).toEqual({
      tipo: "TODOS",
      portaria: "",
      numero_sei: "",
      nome_titular_e_indicado: "",
      status_publicacao: "",
      periodo_before: "",
      rf: "",
      observacao: "",
    });
  });

  it("aciona handleClear quando o filtro dispara onClear", () => {
    render(<AtosAdministrativos />);

    fireEvent.click(screen.getByTestId("filtro-clear"));

    expect(handleClearMock).toHaveBeenCalledTimes(1);
  });

  it("submete formulário usando handleSubmit do react-hook-form", () => {
    hookSpy.mockReturnValue({
      isPending: true,
      tabelaKey: 2,
      resultado: [designacaoHistorico, { ...designacaoHistorico, id: 2 }],
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
    expect(screen.getByTestId("list-loading")).toHaveTextContent("true");
  });
});
