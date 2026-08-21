import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { TabsProps } from "antd";
import TextosDePortaria from "./page";
import { TextosDePortariasResponse } from "@/types/gestao";

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
  onPageChange: () => void;
}

const pageHeaderSpy = vi.fn<(props: PageHeaderMockProps) => void>();
const fundoBrancoSpy = vi.fn<(props: FundoBrancoMockProps) => void>();
const simpleTableHeaderSpy = vi.fn<(props: SimpleTableHeaderMockProps) => void>();
const simpleHeaderWithBorderSpy = vi.fn<(props: SimpleHeaderWithBorderMockProps) => void>();
const tabsSpy = vi.fn<(props: TabsProps) => void>();
const listagemSpy = vi.fn<(props: ListagemMockProps) => void>();

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

vi.mock("@/components/dashboard/Gestao/ListagemDeTextosDePortarias/ListagemDeTextosDePortarias", () => ({
  default: (props: ListagemMockProps) => {
    listagemSpy(props);
    return (
      <div data-testid="listagem-textos">
        <span>{props.data.length}</span>
        <button type="button" onClick={props.onPageChange}>
          mudar pagina
        </button>
      </div>
    );
  },
}));

describe("Página Textos de Portaria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("renderiza abas, chamada de cadastro e listagem com dados mockados da página", () => {
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

    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.getByTestId("tab-1")).toHaveTextContent("Textos de portaria");
    expect(screen.getByTestId("tab-2")).toHaveTextContent("Regras");
    expect(screen.getByTestId("tab-2")).toHaveTextContent("TBD");
    expect(screen.getByTestId("botao-proximo")).toHaveTextContent("Cadastrar novo texto");
    expect(screen.getByTestId("icon-plus")).toBeInTheDocument();

    const tabsProps = tabsSpy.mock.calls[0][0];
    expect(tabsProps.defaultActiveKey).toBe("1");
    expect(tabsProps.type).toBe("card");
    expect(tabsProps.size).toBe("medium");

    expect(listagemSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          {
            id: 1,
            tipo_de_portaria: "Portaria",
            nome_do_modelo: "Modelo 1",
            status: "ATIVO",
            atualizado_por: "Usuario 1",
            atualizado_em: "30/06/2026 08:05",
          },
          {
            id: 2,
            tipo_de_portaria: "Portaria",
            nome_do_modelo: "Modelo 2",
            status: "ATIVO",
            atualizado_por: "Usuario 2",
            atualizado_em: "28/06/2026 11:12",
          },
          {
            id: 3,
            tipo_de_portaria: "Portaria",
            nome_do_modelo: "Modelo 3",
            status: "INATIVO",
            atualizado_por: "Usuario 3",
            atualizado_em: "15/06/2026 06:30",
          },
        ],
        total: 0,
        page: 1,
        isLoading: false,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Cadastrar novo texto" }));
    fireEvent.click(screen.getByRole("button", { name: "mudar pagina" }));
  });
});
