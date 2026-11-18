import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";
import type { createFormSchemaCargosBaseData } from "@/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase";
import CadastrarCargoBase from "./page";

const pushMock = vi.fn();
const stepsSpy = vi.fn();
const pageHeaderSpy = vi.fn();
const useCriarEditarCargosBaseMock = vi.fn();

let searchParams: Record<string, string | null> = {};
let cargosOpcoes: { codigoCargo: number; nomeCargo: string }[] = [];

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({
    get: (key: string) => searchParams[key] ?? null,
  }),
}));

vi.mock("antd", () => ({
  Steps: (props: Record<string, unknown>) => {
    stepsSpy(props);
    return <div data-testid="etapas-cargo" />;
  },
  Tooltip: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
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

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="quadro-branco">{children}</section>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
    <button {...rest}>{children}</button>
  ),
}));

vi.mock("@/components/ui/Combobox", () => ({
  Combobox: ({
    options,
    value,
    onChange,
    placeholder,
    ...rest
  }: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    "data-testid"?: string;
  }) => (
    <select
      data-testid={rest["data-testid"]}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/hooks/useCriarEditarCargosBase", () => ({
  useCriarEditarCargosBase: (...args: unknown[]) => useCriarEditarCargosBaseMock(...args),
}));

const defaultValues: createFormSchemaCargosBaseData = {
  grupamento: "",
  codigo_cargo: "",
  descricao_resumida: "",
  descricao_completa: "",
  descricao_eol: "",
  provimento: "",
  situacao_funcional: "",
  status: "",
  utilizado_para_funcoes: false,
  utilizado_para_designacoes: false,
  utilizado_para_ste: false,
  utilizado_para_permutas: false,
  cargo_base_ficticio: false,
  testar_laudo: false,
  pesquisar_licencas_no_sigpec: false,
  quantidade_maxima_de_dias_de_licenca: "0",
  permite_substituicao: false,
  possui_periodo_fechado: false,
  data_fim_periodo: null,
};

const onConfirmarCargoSelecionado = (
  form: ReturnType<typeof useForm<createFormSchemaCargosBaseData>>,
) => {
  act(() => {
    const nomeCargo =
      cargosOpcoes.find((cargo) => String(cargo.codigoCargo) === form.getValues("codigo_cargo"))
        ?.nomeCargo ?? "";
    form.setValue("descricao_completa", nomeCargo);
  });
};

function Harness() {
  const form = useForm<createFormSchemaCargosBaseData>({
    defaultValues: {
      ...defaultValues,
      codigo_cargo: searchParams.codigo_cargo ?? "",
    },
  });

  useCriarEditarCargosBaseMock.mockReturnValue({
    form,
    isLoadingCargosBase: false,
    CargosBaseOpcoes: cargosOpcoes,
  });

  React.useEffect(() => {
    onConfirmarCargoSelecionado(form);
  }, [form]);

  return <CadastrarCargoBase />;
}

describe("Página de cadastro de cargo base (etapas)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParams = {};
    cargosOpcoes = [
      { codigoCargo: 1234567, nomeCargo: "Professor do Ensino Fundamental I" },
      { codigoCargo: 3360, nomeCargo: "DIRETOR DE ESCOLA" },
    ];
  });

  it("renderiza título, etapas e campos da primeira etapa", () => {
    render(<Harness />);

    expect(screen.getByTestId("page-title")).toHaveTextContent("Cadastrar cargo base");
    expect(stepsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        current: 0,
        items: [
          { title: "Informações do cargo" },
          { title: "Utilização do cargo" },
          { title: "Módulo do cargo" },
        ],
      }),
    );
    expect(screen.getByTestId("select-grupamento")).toBeInTheDocument();
    expect(screen.getByTestId("select-situacao-funcional")).toBeInTheDocument();
    expect(screen.getByTestId("select-status")).toBeInTheDocument();
    expect(screen.getByTestId("input-provimento")).toBeInTheDocument();
  });

  it("navega entre as etapas com Próximo e Anterior", () => {
    render(<Harness />);

    expect(screen.getByTestId("btn-anterior")).toBeDisabled();

    fireEvent.click(screen.getByTestId("botao-proximo"));
    expect(stepsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ current: 1 }));

    fireEvent.click(screen.getByTestId("botao-proximo"));
    expect(stepsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ current: 2 }));
    expect(screen.getByTestId("botao-proximo")).toBeDisabled();

    fireEvent.click(screen.getByTestId("btn-anterior"));
    expect(stepsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ current: 1 }));
  });

  it("preenche o formulário com o cargo vindo da tela anterior", () => {
    searchParams = { codigo_cargo: "1234567" };

    render(<Harness />);

    expect(useCriarEditarCargosBaseMock).toHaveBeenCalledWith(null, { codigo_cargo: "1234567" });
    expect(screen.getByTestId("cargo-selecionado")).toHaveTextContent(
      "Cargo: 1234567 - Professor do Ensino Fundamental I",
    );
  });

  it("exibe apenas o código quando o cargo ainda não foi encontrado", () => {
    searchParams = { codigo_cargo: "999" };

    render(<Harness />);

    expect(screen.getByTestId("cargo-selecionado")).toHaveTextContent("Cargo: 999");
  });

  it("informa que o cargo está carregando", () => {
    function HarnessCarregando() {
      const form = useForm<createFormSchemaCargosBaseData>({ defaultValues });
      useCriarEditarCargosBaseMock.mockReturnValue({
        form,
        isLoadingCargosBase: true,
        CargosBaseOpcoes: [],
      });

      return <CadastrarCargoBase />;
    }

    render(<HarnessCarregando />);

    expect(screen.getByTestId("cargo-selecionado")).toHaveTextContent("Carregando cargo...");
  });

  it("atualiza o grupamento pelo combobox", () => {
    render(<Harness />);

    fireEvent.change(screen.getByTestId("select-grupamento"), {
      target: { value: "DOCENTES" },
    });

    expect(screen.getByTestId("select-grupamento")).toHaveValue("DOCENTES");
  });

  it("volta para a listagem ao cancelar", () => {
    render(<Harness />);

    fireEvent.click(screen.getByTestId("btn-cancelar"));

    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/cargos-base");
  });

  it("usa o id da query para o modo edição", () => {
    searchParams = { id: "77" };

    render(<Harness />);

    expect(useCriarEditarCargosBaseMock).toHaveBeenCalledWith(77, undefined);
    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        breadcrumbs: [
          { title: "Início", href: "/" },
          { title: "Gestão", href: "/pages/gestao/cargos-base" },
          { title: "Cargos base", href: "/pages/gestao/cargos-base" },
          { title: "Cadastrar cargo base", href: "" },
        ],
      }),
    );
  });
});
