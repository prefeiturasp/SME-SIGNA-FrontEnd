import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCriarEditarCargosBase } from "@/hooks/useCriarEditarCargosBase";
import createFormSchemaCargosBase, {
  type createFormSchemaCargosBaseData,
} from "@/components/dashboard/Gestao/FormCargosBase/createFormSchemaCargosBase";
import { CargoDisplay } from "@/components/ui/CargoDisplay";
import CadastrarCargoBase from "./page";

const pushMock = vi.fn();
const stepsSpy = vi.fn();
const pageHeaderSpy = vi.fn();
const useCriarEditarCargosBaseMock = vi.fn();
const formPrincipalSpy = vi.fn();
const formSecundarioSpy = vi.fn();
const onSubmitFormMock = vi.fn();

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

vi.mock("@/components/dashboard/Gestao/FormCargosBase/FormCargosBasePrincipal", () => ({
  default: (props: Record<string, unknown>) => {
    formPrincipalSpy(props);
    return (
      <div data-testid="form-principal">
        <CargoDisplay
          codigoCargo={props.codigoCargo as string}
          descricaoCompleta={props.descricaoCompleta as string}
          isLoading={props.isLoading as boolean}
        />
      </div>
    );
  },
}));

vi.mock("@/components/dashboard/Gestao/FormCargosBase/FormCargosBasePasso2", () => ({
  default: (props: Record<string, unknown>) => {
    formSecundarioSpy(props);
    return <div data-testid="form-secundario" />;
  },
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

// Valores que satisfazem todos os campos obrigatórios da etapa 1.
const valoresEtapa1Preenchida: Partial<createFormSchemaCargosBaseData> = {
  grupamento: "01",
  descricao_resumida: "PROFESSOR",
  situacao_funcional: "01",
  status: "01",
};

type FormularioMock = ReturnType<typeof useForm<createFormSchemaCargosBaseData>>;

function Harness({ onForm }: { onForm?: (form: FormularioMock) => void } = {}) {
  const form = useForm<createFormSchemaCargosBaseData>({
    resolver: zodResolver(createFormSchemaCargosBase),
    defaultValues: {
      ...defaultValues,
      codigo_cargo: searchParams.codigo_cargo ?? "",
    },
    mode: "onChange",
  });

  useCriarEditarCargosBaseMock.mockReturnValue({
    form,
    isLoadingCargosBase: false,
    isLoadingEditarCargosBase: false,
    isPending: false,
    CargosBaseOpcoes: cargosOpcoes,
    onSubmitForm: onSubmitFormMock,
  } as unknown as ReturnType<typeof useCriarEditarCargosBase>);

  const informarFormulario = React.useRef(onForm);
  informarFormulario.current = onForm;

  React.useEffect(() => {
    act(() => {
      const nomeCargo =
        cargosOpcoes.find((cargo) => String(cargo.codigoCargo) === form.getValues("codigo_cargo"))
          ?.nomeCargo ?? "";
      form.setValue("descricao_completa", nomeCargo);
      form.setValue("descricao_eol", nomeCargo);
      informarFormulario.current?.(form);
    });
  }, [form]);

  return <CadastrarCargoBase />;
}

const clicarProximo = async () => {
  await act(async () => {
    fireEvent.click(screen.getByTestId("botao-proximo"));
  });
};

// Renderiza a página e já preenche os obrigatórios da etapa 1 (quando `preencherEtapa1` é true).
async function renderizar({
  preencherEtapa1 = true,
}: { preencherEtapa1?: boolean } = {}) {
  let form!: FormularioMock;

  render(<Harness onForm={(formAtual) => (form = formAtual)} />);

  if (preencherEtapa1) {
    const descricao = form.getValues("descricao_completa");
    const descricaoEol = form.getValues("descricao_eol");

    await act(async () => {
      form.reset({
        ...defaultValues,
        ...valoresEtapa1Preenchida,
        codigo_cargo: searchParams.codigo_cargo ?? "1234567",
        descricao_completa: descricao || "Professor do Ensino Fundamental I",
        descricao_eol: descricaoEol || "Professor do Ensino Fundamental I",
      });
    });
  }

  return form;
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

  it("renderiza título e etapas", () => {
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
  });

  it("exibe o formulário principal na primeira etapa", () => {
    render(<Harness />);

    expect(screen.getByTestId("form-principal")).toBeInTheDocument();
    expect(screen.queryByTestId("form-secundario")).not.toBeInTheDocument();
    expect(formPrincipalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        CargosBaseOpcoes: cargosOpcoes,
        isEditing: false,
        isLoading: false,
      }),
    );
  });

  it("exibe os switches de utilização do cargo na segunda etapa", async () => {
    await renderizar();

    await clicarProximo();

    expect(stepsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ current: 1 }));
    expect(screen.getByTestId("form-secundario")).toBeInTheDocument();
    expect(formSecundarioSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        codigoCargo: "1234567",
        descricaoCompleta: "Professor do Ensino Fundamental I",
      }),
    );
    expect(screen.queryByTestId("form-principal")).not.toBeInTheDocument();
  });

  it("navega entre as etapas com Próximo e Anterior", async () => {
    await renderizar();

    expect(screen.getByTestId("btn-anterior")).toBeDisabled();

    await clicarProximo();
    expect(stepsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ current: 1 }));

    await clicarProximo();
    expect(stepsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ current: 2 }));
    expect(screen.getByTestId("etapa-modulo-do-cargo")).toBeInTheDocument();
    expect(screen.queryByTestId("botao-proximo")).not.toBeInTheDocument();
    expect(screen.getByTestId("botao-cadastrar-cargo")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("btn-anterior"));
    expect(stepsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ current: 1 }));
    expect(screen.getByTestId("form-secundario")).toBeInTheDocument();
  });

  it("preenche o formulário com o cargo vindo da tela anterior", () => {
    searchParams = { codigo_cargo: "1234567" };

    render(<Harness />);

    expect(useCriarEditarCargosBaseMock).toHaveBeenCalledWith(null, { codigo_cargo: "1234567" });
    expect(formPrincipalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        codigoCargo: "1234567",
        descricaoCompleta: "Professor do Ensino Fundamental I",
      }),
    );
    expect(screen.getByTestId("cargo-painel")).toHaveTextContent(
      "1234567 - Professor do Ensino Fundamental I",
    );
  });

  it("exibe apenas o código quando o cargo ainda não foi encontrado", () => {
    searchParams = { codigo_cargo: "999" };

    render(<Harness />);

    expect(screen.getByTestId("cargo-painel")).toHaveTextContent(/^999$/);
  });

  it("informa que o cargo está carregando", () => {
    function HarnessCarregando() {
      const form = useForm<createFormSchemaCargosBaseData>({ defaultValues });
      useCriarEditarCargosBaseMock.mockReturnValue({
        form,
        isLoadingCargosBase: true,
        isLoadingEditarCargosBase: false,
        CargosBaseOpcoes: [],
        onSubmitForm: onSubmitFormMock,
      });

      return <CadastrarCargoBase />;
    }

    render(<HarnessCarregando />);

    expect(formPrincipalSpy).toHaveBeenCalledWith(expect.objectContaining({ isLoading: true }));
    expect(screen.getByTestId("cargo-painel")).toHaveTextContent("Carregando cargo...");
  });

  it("volta para a listagem ao cancelar", () => {
    render(<Harness />);

    fireEvent.click(screen.getByTestId("btn-cancelar"));

    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/cargos-base");
  });

  it("envia o cargo selecionado para o passo 2", async () => {
    searchParams = { codigo_cargo: "3360" };

    await renderizar();

    await clicarProximo();

    expect(formSecundarioSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        codigoCargo: "3360",
        descricaoCompleta: "DIRETOR DE ESCOLA",
      }),
    );
  });

  it("exibe o botão de cadastrar apenas na última etapa", async () => {
    await renderizar();

    expect(screen.queryByTestId("botao-cadastrar-cargo")).not.toBeInTheDocument();

    await clicarProximo();
    expect(screen.queryByTestId("botao-cadastrar-cargo")).not.toBeInTheDocument();

    await clicarProximo();
    expect(screen.getByTestId("botao-cadastrar-cargo")).toHaveTextContent("Cadastrar cargo");
    expect(screen.getByTestId("botao-cadastrar-cargo")).toHaveAttribute("type", "submit");
  });

  it("não avança com campos obrigatórios da etapa vazios", async () => {
    await renderizar({ preencherEtapa1: false });

    await clicarProximo();

    expect(stepsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ current: 0 }));
    expect(screen.getByTestId("form-principal")).toBeInTheDocument();
    expect(screen.queryByTestId("form-secundario")).not.toBeInTheDocument();
  });

  it("não avança quando o código do cargo não foi selecionado", async () => {
    await renderizar({ preencherEtapa1: false });

    await clicarProximo();

    expect(stepsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ current: 0 }));
  });

  it("avança para a última etapa quando os obrigatórios do passo 2 estão válidos", async () => {
    const form = await renderizar();

    await clicarProximo();
    expect(stepsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ current: 1 }));

    await act(async () => {
      form.setValue("pesquisar_licencas_no_sigpec", true);
      form.setValue("quantidade_maxima_de_dias_de_licenca", "15");
    });

    await clicarProximo();

    expect(stepsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ current: 2 }));
    expect(screen.getByTestId("etapa-modulo-do-cargo")).toBeInTheDocument();
  });

  it("não avança do passo 2 quando o período fechado está sem data final", async () => {
    const form = await renderizar();

    await clicarProximo();
    expect(stepsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ current: 1 }));

    await act(async () => {
      form.setValue("possui_periodo_fechado", true);
      form.setValue("data_fim_periodo", null);
    });

    await clicarProximo();

    expect(stepsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ current: 1 }));
  });

  it("usa o id da query para o modo edição", async () => {
    searchParams = { id: "77" };

    const form = await renderizar({ preencherEtapa1: false });

    expect(useCriarEditarCargosBaseMock).toHaveBeenCalledWith(77, undefined);

    // Simula o carregamento do cargo base pelo hook de edição.
    await act(async () => {
      form.reset({
        ...defaultValues,
        id: 77,
        codigo_cargo: "1234567",
        descricao_completa: "Professor do Ensino Fundamental I",
        descricao_eol: "PROFESSOR",
        grupamento: "01",
        descricao_resumida: "PROFESSOR",
        situacao_funcional: "01",
        status: "01",
      } as unknown as createFormSchemaCargosBaseData);
    });

    expect(screen.getByTestId("page-title")).toHaveTextContent("Editar cargo base");
    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Editar cargo base",
        breadcrumbs: [
          { title: "Início", href: "/" },
          { title: "Gestão", href: "/pages/gestao/cargos-base" },
          { title: "Cargos base", href: "/pages/gestao/cargos-base" },
          { title: "Editar cargo base", href: "" },
        ],
      }),
    );
    expect(formPrincipalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        isEditing: true,
        codigoCargo: "1234567",
        descricaoCompleta: "Professor do Ensino Fundamental I",
      }),
    );

    await clicarProximo();
    expect(stepsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ current: 1 }));

    await clicarProximo();
    expect(screen.getByTestId("botao-cadastrar-cargo")).toHaveTextContent("Salvar");
  });

  it("mantém o título de cadastro quando não há id na query", () => {
    render(<Harness />);

    expect(screen.getByTestId("page-title")).toHaveTextContent("Cadastrar cargo base");
    expect(formPrincipalSpy).toHaveBeenCalledWith(expect.objectContaining({ isEditing: false }));
  });

  it("envia o formulário de edição ao clicar em Salvar", async () => {
    searchParams = { id: "77" };

    await renderizar();

    await clicarProximo();
    await clicarProximo();

    const botaoSalvar = screen.getByTestId("botao-cadastrar-cargo");
    expect(botaoSalvar).toHaveTextContent("Salvar");
    expect(botaoSalvar).toHaveAttribute("type", "submit");

    // jsdom não dispara submit ao clicar em type="submit", então dispara direto no form
    // e garante que o navigation não acontece (preventDefault) e o hook é chamado.
    const formElement = document.querySelector("form") as HTMLFormElement;

    await act(async () => {
      fireEvent.submit(formElement);
    });

    expect(onSubmitFormMock).toHaveBeenCalledTimes(1);
    expect(onSubmitFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        descricao_completa: "Professor do Ensino Fundamental I",
        grupamento: "01",
        descricao_resumida: "PROFESSOR",
        situacao_funcional: "01",
        status: "01",
      }),
      expect.anything(),
    );
  });
});
