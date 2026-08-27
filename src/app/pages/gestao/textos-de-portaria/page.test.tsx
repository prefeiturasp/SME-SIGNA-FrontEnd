import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BaseSyntheticEvent, ButtonHTMLAttributes, ReactNode } from "react";
import type { TabsProps } from "antd";
import type { SubmitHandler, UseFormHandleSubmit, UseFormReturn } from "react-hook-form";
import TextosDePortaria from "./page";
import { filterFormSchemaTextosPortariaData } from "@/components/dashboard/Gestao/FiltroDeTextosPortaria/filterFormSchemaTextosPortaria";
import { TextosDePortariasPaginada, TextosDePortariasResponse } from "@/types/gestao";

interface PageHeaderMockProps {
  showBackButton: boolean;
  title: ReactNode;
  breadcrumbs: Array<{ title: string; href: string }>;
}

interface FundoBrancoMockProps {
  children: ReactNode;
  className?: string;
}

interface SimpleTableHeaderMockProps {
  title: string;
  subtitle: string;
}

interface SimpleHeaderWithBorderMockProps extends SimpleTableHeaderMockProps {
  buttonRight?: ReactNode;
}

interface ButtonMockProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "lg";
  variant?: "destructive";
}

interface ListagemMockProps {
  data: TextosDePortariasResponse[];
  total: number;
  page: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

interface FiltroMockProps {
  onClear?: () => void;
}

interface ModalSelecaoMockProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HookMockReturn {
  isPending: boolean;
  resultado: TextosDePortariasPaginada | null;
  onPageChange: (page: number) => void;
  page: number;
  filterForm: Partial<UseFormReturn<filterFormSchemaTextosPortariaData>> &
    Pick<UseFormReturn<filterFormSchemaTextosPortariaData>, "handleSubmit">;
  onSubmitFilterForm: SubmitHandler<filterFormSchemaTextosPortariaData>;
  handleClear: () => void;
}

const pageHeaderSpy = vi.fn<(props: PageHeaderMockProps) => void>();
const fundoBrancoSpy = vi.fn<(props: FundoBrancoMockProps) => void>();
const simpleTableHeaderSpy = vi.fn<(props: SimpleTableHeaderMockProps) => void>();
const simpleHeaderWithBorderSpy = vi.fn<(props: SimpleHeaderWithBorderMockProps) => void>();
const tabsSpy = vi.fn<(props: TabsProps) => void>();
const listagemSpy = vi.fn<(props: ListagemMockProps) => void>();
const filtroSpy = vi.fn<(props: FiltroMockProps) => void>();
const modalSelecaoSpy = vi.fn<(props: ModalSelecaoMockProps) => void>();
const formProviderSpy = vi.fn();
const useVisualizarTextosPortariaMock = vi.fn<() => HookMockReturn>();

const textos: TextosDePortariasResponse[] = [
  {
    id: 1,
    tipo_portaria: "Portaria",
    nome_modelo: "Modelo 1",
    status: "ATIVO",
    criado_em: "2026-06-11T08:05:00",
    atualizado_em: "2026-06-11T10:00:00",
    tipo_ato_pai: "Portaria",
    texto_portaria: "Texto 1",
    variaveis: ["VARIAVEL 1"],
    tipo_cargo: "CARGO 1",
    observacoes: "Observações 1",
  },
    {
    id: 2,
    tipo_portaria: "Portaria",
    nome_modelo: "Modelo 2",
    status: "INATIVO",
    criado_em: "2026-06-28T11:12:00",
    atualizado_em: "2026-06-28T11:40:00",
    tipo_ato_pai: "Portaria",
    texto_portaria: "Texto 2",
    variaveis: ["VARIAVEL 2"],
    tipo_cargo: "CARGO 2",
    observacoes: "Observações 2",
  },
];

const resultado: TextosDePortariasPaginada = {
  count: 2,
  next: null,
  previous: null,
  results: textos,
};

const handleClearMock = vi.fn();
const onPageChangeMock = vi.fn();
const onSubmitFilterFormMock = vi.fn();
const submittedValues: filterFormSchemaTextosPortariaData = {
  tipo_portaria: "Portaria",
  nome_modelo: "Modelo",
  status: "ATIVO",
};
const handleSubmitMock = vi.fn(
  (callback: SubmitHandler<filterFormSchemaTextosPortariaData>) => async (event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    await callback(submittedValues, event);
  },
);

vi.mock("@/hooks/useVisualizarTextosPortaria", () => ({
  useVisualizarTextosPortaria: () => useVisualizarTextosPortariaMock(),
}));

vi.mock("react-hook-form", () => ({
  FormProvider: ({
    children,
    ...formProps
  }: Partial<UseFormReturn<filterFormSchemaTextosPortariaData>> & { children: ReactNode }) => {
    formProviderSpy(formProps);
    return <>{children}</>;
  },
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: (props: PageHeaderMockProps) => {
    pageHeaderSpy(props);
    return <header data-testid="page-header">{props.title}</header>;
  },
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: (props: FundoBrancoMockProps) => {
    fundoBrancoSpy(props);
    return <section data-testid="fundo-branco">{props.children}</section>;
  },
}));

vi.mock("@/components/dashboard/SimpleTableHeader/SimpleTableHeader", () => ({
  default: (props: SimpleTableHeaderMockProps) => {
    simpleTableHeaderSpy(props);
    return (
      <div>
        <h2>{props.title}</h2>
        <p>{props.subtitle}</p>
      </div>
    );
  },
  SimpleHeaderWithBorder: (props: SimpleHeaderWithBorderMockProps) => {
    simpleHeaderWithBorderSpy(props);
    return (
      <div>
        <h3>{props.title}</h3>
        <p>{props.subtitle}</p>
        {props.buttonRight}
      </div>
    );
  },
}));

vi.mock("antd", () => ({
  Tabs: (props: TabsProps) => {
    tabsSpy(props);
    return (
      <div data-testid="tabs">
        {props.items?.map((item) => (
          <section key={item.key} data-testid={`tab-${item.key}`}>
            <span>{item.label}</span>
            {item.children}
          </section>
        ))}
      </div>
    );
  },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...rest }: ButtonMockProps) => <button {...rest}>{children}</button>,
}));

vi.mock("lucide-react", () => ({
  Plus: () => <span data-testid="icon-plus" />,
}));

vi.mock("@/components/dashboard/Gestao/FiltroDeTextosPortaria/FiltroDeTextosPortaria", () => ({
  default: (props: FiltroMockProps) => {
    filtroSpy(props);
    return (
      <div>
        <button type="submit">buscar</button>
        <button type="button" onClick={props.onClear}>
          limpar
        </button>
      </div>
    );
  },
}));

vi.mock("@/components/dashboard/Gestao/ListagemDeTextosDePortarias/ListagemDeTextosDePortarias", () => ({
  default: (props: ListagemMockProps) => {
    listagemSpy(props);
    return (
      <div data-testid="listagem-textos">
        <span>{props.data.length}</span>
        <button type="button" onClick={() => props.onPageChange(4)}>
          mudar pagina
        </button>
      </div>
    );
  },
}));

vi.mock("@/components/dashboard/Gestao/ModalSelecaoDeTipoDeTexto/ModalSelecaoDeTipoDeTexto", () => ({
  default: (props: ModalSelecaoMockProps) => {
    modalSelecaoSpy(props);
    return props.isOpen ? (
      <div data-testid="modal-selecao-tipo-texto">
        <button type="button" onClick={props.onClose}>
          fechar modal
        </button>
      </div>
    ) : null;
  },
}));

describe("Página Textos de Portaria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useVisualizarTextosPortariaMock.mockReturnValue({
      isPending: true,
      resultado,
      onPageChange: onPageChangeMock,
      page: 3,
      filterForm: {
        handleSubmit: handleSubmitMock as unknown as UseFormHandleSubmit<filterFormSchemaTextosPortariaData>,
      },
      onSubmitFilterForm: onSubmitFilterFormMock,
      handleClear: handleClearMock,
    });
  });

  it("renderiza header, breadcrumbs e container principal", () => {
    render(<TextosDePortaria />);

    expect(screen.getByTestId("page-header")).toHaveTextContent("Textos de portarias");
    expect(screen.getByTestId("fundo-branco")).toBeInTheDocument();

    const pageHeaderProps = pageHeaderSpy.mock.calls[0][0];
    expect(pageHeaderProps.showBackButton).toBe(false);
    expect(pageHeaderProps.breadcrumbs).toEqual([
      { title: "Início", href: "/" },
      { title: "Gestão", href: "/" },
      { title: "Textos de portaria", href: "" },
    ]);
    expect(fundoBrancoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        className: "mb-4 mt-8",
      }),
    );
  });

  it("renderiza abas, filtro e listagem com dados vindos do hook", () => {
    render(<TextosDePortaria />);

    expect(simpleTableHeaderSpy).toHaveBeenCalledWith({
      title: "Parametrização dos textos de portaria",
      subtitle:
        "Gerencie os modelos de textos utilizados na emissão de Portarias e configure as regras que definem sua composição.",
    });
    expect(simpleHeaderWithBorderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Crie um novo texto de portaria",
        subtitle:
          "Cadastre um novo modelo de texto para ser utilizado na geração automática de portarias e outros atos administrativos.",
      }),
    );

    expect(screen.getByTestId("tab-1")).toHaveTextContent("Textos de portaria");
    expect(screen.getByTestId("tab-2")).toHaveTextContent("Regras");
    expect(screen.getByTestId("tab-2")).toHaveTextContent("TBD");
    expect(screen.getByTestId("botao-proximo")).toHaveTextContent("Cadastrar novo texto");
    expect(screen.getByTestId("icon-plus")).toBeInTheDocument();

    const tabsProps = tabsSpy.mock.calls[0][0];
    expect(tabsProps.defaultActiveKey).toBe("1");
    expect(tabsProps.type).toBe("card");
    expect(tabsProps.size).toBe("medium");
    expect(formProviderSpy).toHaveBeenCalledWith(expect.objectContaining({ handleSubmit: handleSubmitMock }));
    expect(filtroSpy).toHaveBeenCalledWith({ onClear: handleClearMock });
    expect(listagemSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: textos,
        total: 2,
        page: 3,
        isLoading: true,
        onPageChange: onPageChangeMock,
      }),
    );
  });

  it("executa ações do formulário, paginação e botão de cadastro", () => {
    render(<TextosDePortaria />);

    fireEvent.submit(screen.getByRole("button", { name: "buscar" }).closest("form") as HTMLFormElement);
    expect(handleSubmitMock).toHaveBeenCalledWith(onSubmitFilterFormMock);
    expect(onSubmitFilterFormMock).toHaveBeenCalledWith(submittedValues, expect.any(Object));

    fireEvent.click(screen.getByRole("button", { name: "limpar" }));
    expect(handleClearMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "mudar pagina" }));
    expect(onPageChangeMock).toHaveBeenCalledWith(4);
  });

  it("abre e fecha o modal de seleção de tipo de texto", () => {
    render(<TextosDePortaria />);

    expect(screen.queryByTestId("modal-selecao-tipo-texto")).not.toBeInTheDocument();
    expect(modalSelecaoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: false,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Cadastrar novo texto" }));

    expect(screen.getByTestId("modal-selecao-tipo-texto")).toBeInTheDocument();
    expect(modalSelecaoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "fechar modal" }));

    expect(screen.queryByTestId("modal-selecao-tipo-texto")).not.toBeInTheDocument();
    expect(modalSelecaoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: false,
      }),
    );
  });

  it("renderiza listagem vazia quando não há resultado", () => {
    useVisualizarTextosPortariaMock.mockReturnValue({
      isPending: false,
      resultado: null,
      onPageChange: onPageChangeMock,
      page: 1,
      filterForm: {
        handleSubmit: handleSubmitMock as unknown as UseFormHandleSubmit<filterFormSchemaTextosPortariaData>,
      },
      onSubmitFilterForm: onSubmitFilterFormMock,
      handleClear: handleClearMock,
    });

    render(<TextosDePortaria />);

    expect(listagemSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [],
        total: 0,
        page: 1,
        isLoading: false,
      }),
    );
  });
});
