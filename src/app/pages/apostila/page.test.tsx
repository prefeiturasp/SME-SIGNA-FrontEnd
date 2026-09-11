import type { ReactNode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ApostilaPage from "./page";
import type { formSchemaApostilaData } from "./schema";
import { EnumCheckbox } from "@/components/ui/FieldsForm";

let mockIsLoading = false;
let mockId: string | null = "1";
let mockOrigem: string | null = null;
let mockIsDirty = false;
let mockIsValid = true;

type DesignacaoMock = {
  numero_portaria?: string;
  ano_vigente?: string;
  sei_numero?: string;
  doc?: string;
  indicado_nome_servidor?: string;
  indicado_rf?: string;
  indicado_vinculo?: string;
  indicado_cargo_base?: string;
  indicado_cargo_sobreposto?: string;
  indicado_local_exercicio?: string;
  indicado_nome_civil?: string;
  indicado_lotacao?: string;
  indicado_categoria?: string;
  cargo_vaga?: number | null;
  tipo_vaga?: "VAGO" | "DISPONIVEL" | string;
  titular_cargo_sobreposto?: string;
  dre?: string;
  dre_nome?: string;
  ue?: string;
  unidade_proponente?: string;
  codigo_hierarquico?: string;
  data_inicio?: string;
  data_fim?: string | null;
  carater_excepcional?: boolean;
  impedimento_substituicao?: string | null;
  com_afastamento?: boolean;
  motivo_afastamento?: string;
  pendencias?: string;
  cessacao?: {
    numero_portaria?: string;
    ano_vigente?: string;
    sei_numero?: string;
    doc?: string;
    a_pedido?: boolean;
    data_cessacao?: string;
    remocao?: boolean;
    aposentadoria?: boolean;
  } | null;
} | null;

const designacaoPadrao: NonNullable<DesignacaoMock> = {
  numero_portaria: "123",
  ano_vigente: "2024",
  sei_numero: "999",
  doc: "DOC",
  indicado_nome_servidor: "João",
  indicado_rf: "123456",
  indicado_vinculo: "CLT",
  indicado_cargo_base: "PROFESSOR",
  indicado_cargo_sobreposto: "COORDENADOR",
  indicado_local_exercicio: "ESCOLA",
  dre: "108200",
  dre_nome: "DRE",
  ue: "UE-1",
  unidade_proponente: "UE Teste",
  codigo_hierarquico: "EH",
  tipo_vaga: "VAGO",
  cessacao: null,
};

let mockDesignacaoAtual: DesignacaoMock = designacaoPadrao;

const valoresPadrao: formSchemaApostilaData = {
  ato_apostilado: "designação",
  apostila: {
    numero_sei: "",
    numero_portaria: "",
    doc: "",
    observacao: "",
  },
  dre: "",
  dre_nome: "",
  ue: "",
  ue_nome: "",
  codigo_hierarquico: "",
  informacoes_adicionais: "",
  detalhe_para_quadro_de_historico_por_ano: false,
  texto_portaria: "",
  nome_servidor: "",
  portaria_designacao: "",
  numero_sei: "",
  a_partir_de: new Date(),
  ano: "",
  carater_especial: EnumCheckbox.NAO,
  com_afastamento: EnumCheckbox.NAO,
  com_pendencia: EnumCheckbox.NAO,
  motivo_afastamento: "",
  impedimento_label: "",
  motivo_pendencia: "",
  cessacao: {
    numero_portaria: "",
    ano: "",
    numero_sei: "",
    doc: "",
    a_pedido: EnumCheckbox.NAO,
    data_inicio: new Date(),
    remocao: EnumCheckbox.NAO,
    aposentadoria: EnumCheckbox.NAO,
  },  
};

const {
  pushMock,
  triggerMock,
  getValuesMock,
  handleSubmitMock,
  notificationSuccessMock,
  notificationErrorMock,
  pageHeaderSpy,
  accordionSpy,
  customAccordionItemSpy,
  portariaDesignacaoFieldsSpy,
  portariaCessacaoFieldsSpy,
  informacoesAdicionaisSpy,
  camposPesquisaUnidadeSpy,
  camposEditarServidorSpy,
  selectFieldSpy,
  inputFieldSpy,
  simpleEditorSpy,
  editorOnChangeMock,
  resetMock,
} = vi.hoisted(() => {
  const getValuesMock = vi.fn((): formSchemaApostilaData => ( 
    {
    ato_apostilado: "designação",
    apostila: {
      numero_sei: "",
      numero_portaria: "",
      doc: "",
      observacao: "",
    },
    dre: "",
    dre_nome: "",
    ue: "",
    ue_nome: "",
    codigo_hierarquico: "",
    informacoes_adicionais: "",
    detalhe_para_quadro_de_historico_por_ano: false,
    texto_portaria: "",
    nome_servidor: "",
    portaria_designacao: "",
    numero_sei: "",
    a_partir_de: new Date(),
    ano: "",
    carater_especial: EnumCheckbox.NAO,
    com_afastamento: EnumCheckbox.NAO,
    com_pendencia: EnumCheckbox.NAO,
    motivo_afastamento: "",
    impedimento_label: "",
    motivo_pendencia: "",
    cessacao: {
      numero_portaria: "",
      ano: "",
      numero_sei: "",
      doc: "",
      a_pedido: EnumCheckbox.NAO,
      data_inicio: new Date(),
      remocao: EnumCheckbox.NAO,
      aposentadoria: EnumCheckbox.NAO,
    },
  }));

  return {
    pushMock: vi.fn(),
    triggerMock: vi.fn().mockResolvedValue(true),
    getValuesMock,
    handleSubmitMock: vi.fn(
      (callback: (values: formSchemaApostilaData) => unknown) =>
        (event?: { preventDefault?: () => void }) => {
          event?.preventDefault?.();
          return callback(getValuesMock());
        },
    ),
    notificationSuccessMock: vi.fn(),
    notificationErrorMock: vi.fn(),
    pageHeaderSpy: vi.fn(),
    accordionSpy: vi.fn(),
    customAccordionItemSpy: vi.fn(),
    portariaDesignacaoFieldsSpy: vi.fn(),
    portariaCessacaoFieldsSpy: vi.fn(),
    informacoesAdicionaisSpy: vi.fn(),
    camposPesquisaUnidadeSpy: vi.fn(),
    camposEditarServidorSpy: vi.fn(),
    selectFieldSpy: vi.fn(),
    inputFieldSpy: vi.fn(),
    simpleEditorSpy: vi.fn(),
    editorOnChangeMock: vi.fn(),
    resetMock: vi.fn(),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "id") return mockId;
      if (key === "origem") return mockOrigem;
      return null;
    },
  }),
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    success: notificationSuccessMock,
    error: notificationErrorMock,
  }),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({}),
}));

vi.mock("@/hooks/useVisualizarDesignacoes", () => ({
  useFetchDesignacoesById: () => ({
    data: mockIsLoading ? null : mockDesignacaoAtual,
    isLoading: mockIsLoading,
  }),
}));

vi.mock("@/hooks/useCargos", () => ({
  useFetchCargos: () => ({
    data: [
      { codigoCargo: 10, nomeCargo: "Professor" },
      { codigoCargo: 20, nomeCargo: "Coordenador" },
    ],
  }),
}));

vi.mock("@/utils/portarias/formatadores", () => ({
  nameToCamelCase: (valor: string) => valor,
  formatarRF: (valor: string) => valor,
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: (props: {
    title: ReactNode;
    breadcrumbs: Array<{ title: string; href?: string }>;
    showBackButton: boolean;
  }) => {
    pageHeaderSpy(props);
    return <div data-testid="page-header">{props.title}</div>;
  },
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: (props: {
    children: ReactNode;
    type?: string;
    defaultValue?: string[];
  }) => {
    accordionSpy(props);
    return <div data-testid="accordion">{props.children}</div>;
  },
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: (props: {
    title: string;
    color?: string;
    value: string;
    children: ReactNode;
  }) => {
    customAccordionItemSpy(props);
    return <section data-testid="custom-accordion-item">{props.children}</section>;
  },
}));

vi.mock("@/components/dashboard/Designacao/PortariaDesigacaoFields/PortariaDesigacaoFields", () => ({
  default: (props: { isLoading: boolean }) => {
    portariaDesignacaoFieldsSpy(props);
    return <div data-testid="portaria-designacao-fields" />;
  },
}));

vi.mock("@/components/dashboard/Cessacao/PortariaCessacaoFields/PortariaCessacaoFields", () => ({
  default: () => {
    portariaCessacaoFieldsSpy();
    return <div data-testid="portaria-cessacao-fields" />;
  },
}));

vi.mock("@/components/dashboard/Designacao/PesquisaUnidade/CamposPesquisaUnidade", () => ({
  default: () => {
    camposPesquisaUnidadeSpy();
    return <div data-testid="campos-pesquisa-unidade" />;
  },
}));

vi.mock("@/components/dashboard/Designacao/ModalEditarServidor/CamposEditarServidor", () => ({
  default: () => {
    camposEditarServidorSpy();
    return <div data-testid="campos-editar-servidor" />;
  },
}));

vi.mock("@/components/dashboard/Designacao/InformacoesAdicionais/InformacoesAdicionais", () => ({
  default: (props: {
    disableFields: boolean;
    onChangeDescricao: (value: string) => void;
    onValueChangeDetalheParaQuadroDeHistoricoPorAno: (value: string) => void;
  }) => {
    informacoesAdicionaisSpy(props);
    return (
      <div data-testid="informacoes-adicionais">
        <button type="button" onClick={() => props.onChangeDescricao("obs")}>
          alterar descricao
        </button>
        <button
          type="button"
          onClick={() => props.onValueChangeDetalheParaQuadroDeHistoricoPorAno("true")}
        >
          alterar detalhe
        </button>
      </div>
    );
  },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    type,
    onClick,
    disabled,
    "data-testid": dataTestId,
  }: {
    children: ReactNode;
    type?: "button" | "submit" | "reset";
    onClick?: () => void | Promise<void>;
    disabled?: boolean;
    "data-testid"?: string;
  }) => (
    <button type={type} onClick={() => void onClick?.()} disabled={disabled} data-testid={dataTestId}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/FieldsForm", () => ({
  EnumCheckbox: {
    SIM: "sim",
    NAO: "nao",
  },
  SelectField: (props: {
    name: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    disabled?: boolean;
  }) => {
    selectFieldSpy(props);
    return <div data-testid="select-codigo-cargo-eol">{props.label}</div>;
  },
  InputField: (props: {
    name: string;
    label: string;
    disabled?: boolean;
    "data-testid"?: string;
  }) => {
    inputFieldSpy(props);
    return <input aria-label={props.label} data-testid={props["data-testid"]} disabled={props.disabled} />;
  },
}));

vi.mock("@/components/ui/form", () => ({
  FormField: ({
    render,
  }: {
    render: (args: {
      field: { value: string; onChange: (value: string) => void };
      fieldState: { error?: { message: string } };
    }) => ReactNode;
  }) =>
    render({
      field: {
        value: "Texto SEI inicial",
        onChange: editorOnChangeMock,
      },
      fieldState: {},
    }),
  FormItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormControl: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: ReactNode }) => <label>{children}</label>,
  FormMessage: () => <div data-testid="form-message" />,
}));

vi.mock("@/components/ui/tiptap-templates/simple/simple-editor", () => ({
  SimpleEditor: (props: {
    hasError: boolean;
    content: string;
    onChange: (value: string) => void;
  }) => {
    simpleEditorSpy(props);
    return (
      <button type="button" data-testid="simple-editor" onClick={() => props.onChange("Texto editado")}>
        {props.content}
      </button>
    );
  },
}));

vi.mock("antd", () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loading" />,
}));

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual<typeof import("react-hook-form")>("react-hook-form");

  return {
    ...actual,
    useForm: () => ({
      handleSubmit: handleSubmitMock,
      control: {},
      formState: { errors: {}, isDirty: mockIsDirty, isValid: mockIsValid },
      trigger: triggerMock,
      getValues: getValuesMock,
      register: vi.fn(),
      reset: resetMock,
    }),
    FormProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  };
});

describe("ApostilaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    mockId = "1";
    mockOrigem = null;
    mockIsDirty = false;
    mockIsValid = true;
    mockDesignacaoAtual = designacaoPadrao;
    triggerMock.mockResolvedValue(true);
    getValuesMock.mockReturnValue({ ...valoresPadrao });
    notificationSuccessMock.mockReset();
    notificationErrorMock.mockReset();
  });

  it("mostra loading", () => {
    mockIsLoading = true;

    render(<ApostilaPage />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renderiza o título de apostila de designação por padrão", () => {
    render(<ApostilaPage />);

    expect(screen.getByTestId("page-header")).toHaveTextContent("Apostila de designação");
    expect(screen.getByText("Informações adicionais")).toBeInTheDocument();
    expect(screen.getByTestId("accordion")).toBeInTheDocument();
    expect(screen.getAllByTestId("custom-accordion-item")).toHaveLength(4);
    expect(screen.getByTestId("portaria-designacao-fields")).toBeInTheDocument();
    expect(screen.getByTestId("campos-pesquisa-unidade")).toBeInTheDocument();
    expect(screen.getByTestId("campos-editar-servidor")).toBeInTheDocument();
    expect(screen.getByTestId("select-codigo-cargo-eol")).toBeInTheDocument();
    expect(screen.getByTestId("informacoes-adicionais")).toBeInTheDocument();
    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        showBackButton: true,
        breadcrumbs: [
          { title: "Início", href: "/" },
          { title: "Apostila de designação" },
        ],
      }),
    );
    expect(informacoesAdicionaisSpy).toHaveBeenCalledWith(
      expect.objectContaining({ disableFields: false }),
    );
    expect(accordionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "multiple",
        defaultValue: [
          "portarias-designacao",
          "unidade-proponente",
          "servidor-indicado",
          "cargo-disponivel",
          "cargo-vago",
          "portarias-cessacao",
        ],
      }),
    );
    expect(customAccordionItemSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Portarias de designação",
        color: "purple",
        value: "portarias-designacao",
      }),
    );
    expect(portariaDesignacaoFieldsSpy).toHaveBeenCalledWith({ isLoading: false });
    expect(customAccordionItemSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Unidade Proponente",
        color: "blue",
        value: "unidade-proponente",
      }),
    );
    expect(customAccordionItemSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Servidor Indicado",
        color: "gold",
        value: "servidor-indicado",
      }),
    );
    expect(customAccordionItemSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Cargo vago",
        color: "green",
        value: "cargo-vago",
      }),
    );
    expect(selectFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "cd_cargo_base",
        label: "Cargo",
        options: [
          { value: "10", label: "Professor" },
          { value: "20", label: "Coordenador" },
        ],
      }),
    );
  });

  it("renderiza o título de apostila de cessação quando a origem é cessacao", () => {
    mockOrigem = "cessacao";

    render(<ApostilaPage />);

    expect(screen.getByTestId("page-header")).toHaveTextContent("Apostila de cessação");
    expect(screen.getAllByTestId("custom-accordion-item")).toHaveLength(5);
    expect(screen.getByTestId("portaria-cessacao-fields")).toBeInTheDocument();
    expect(customAccordionItemSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Portaria de cessação",
        color: "silver",
        value: "portarias-cessacao",
      }),
    );
    expect(portariaCessacaoFieldsSpy).toHaveBeenCalledTimes(1);
    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        breadcrumbs: [
          { title: "Início", href: "/" },
          { title: "Apostila de cessação" },
        ],
      }),
    );
  });

  it("renderiza cargo disponível como campo desabilitado quando tipo_vaga é DISPONIVEL", () => {
    mockDesignacaoAtual = {
      ...designacaoPadrao,
      tipo_vaga: "DISPONIVEL",
      titular_cargo_sobreposto: "Diretor",
    };

    render(<ApostilaPage />);

    expect(screen.queryByTestId("select-codigo-cargo-eol")).not.toBeInTheDocument();
    expect(screen.getByTestId("input-cargo-base")).toBeDisabled();
    expect(customAccordionItemSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Cargo disponível",
        color: "green",
        value: "cargo-disponivel",
      }),
    );
    expect(inputFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "titular_cargo_sobreposto",
        label: "Cargo",
        disabled: true,
      }),
    );
  });

  it("submete com sucesso e redireciona", async () => {
    render(<ApostilaPage />);

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(notificationSuccessMock).toHaveBeenCalledWith({
        title: "Apostila salva com sucesso!",
      });
      expect(pushMock).toHaveBeenCalledWith("/pages/atos-administrativos");
    });
  });

  it("exibe a mensagem do Error quando o submit falha", async () => {
    notificationSuccessMock.mockImplementationOnce(() => {
      throw new Error("falha detalhada");
    });

    render(<ApostilaPage />);
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({ title: "falha detalhada" });
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it("exibe mensagem padrão quando o erro do submit não é Error", async () => {
    notificationSuccessMock.mockImplementationOnce(() => {
      throw "erro";
    });

    render(<ApostilaPage />);
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(notificationErrorMock).toHaveBeenCalledWith({ title: "Erro ao salvar" });
    });
  });

  it("gera o texto SEI e mostra o SimpleEditor", async () => {
    render(<ApostilaPage />);

    fireEvent.click(screen.getByRole("button", { name: "Gerar texto SEI" }));

    await waitFor(() => {
      expect(screen.getByTestId("simple-editor")).toBeInTheDocument();
    });
    expect(screen.getByText("Texto SEI*")).toBeInTheDocument();
    expect(screen.getByTestId("simple-editor")).toHaveTextContent("Texto SEI inicial");
    expect(screen.getByTestId("button-salvar-portaria-apostila")).toBeEnabled();
  });

  it("não gera o texto SEI se o formulário for inválido", async () => {
    triggerMock.mockResolvedValueOnce(false);

    render(<ApostilaPage />);
    fireEvent.click(screen.getByRole("button", { name: "Gerar texto SEI" }));

    await waitFor(() => {
      expect(triggerMock).toHaveBeenCalled();
    });
    expect(screen.queryByTestId("simple-editor")).not.toBeInTheDocument();
  });

  it("não quebra quando a designação é nula", () => {
    mockDesignacaoAtual = null;

    render(<ApostilaPage />);

    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(resetMock).not.toHaveBeenCalled();
  });

  it("reseta o formulário com dados completos da designação", () => {
    mockDesignacaoAtual = {
      ...designacaoPadrao,
      data_inicio: "2026-01-10",
      data_fim: "2026-12-20",
      carater_excepcional: true,
      impedimento_substituicao: "LICENCA",
      com_afastamento: true,
      motivo_afastamento: "Afastamento",
      pendencias: "Pendência",
      cargo_vaga: 20,
      indicado_nome_civil: "Maria Civil",
      indicado_lotacao: "Lotação",
      indicado_categoria: "A",
      titular_cargo_sobreposto: "SUPERVISOR",
      cessacao: {
        numero_portaria: "987",
        ano_vigente: "2025",
        sei_numero: "SEI-CESS",
        doc: "DOC-CESS",
        a_pedido: true,
        data_cessacao: "2026-03-15",
        remocao: true,
        aposentadoria: true,
      },
    };

    render(<ApostilaPage />);

    expect(resetMock).toHaveBeenCalledWith({
      texto_portaria: "A presente portaria apostilada,",
      ato_apostilado: "",
      portaria_designacao: "123",
      ano: "2024",
      numero_sei: "999",
      doc: "DOC",
      a_partir_de: new Date("2026/01/10"),
      designacao_data_final: new Date("2026/12/20"),
      carater_especial: "nao",
      impedimento_substituicao: "sim",
      com_afastamento: "sim",
      motivo_afastamento: "Afastamento",
      com_pendencia: "sim",
      motivo_pendencia: "Pendência",
      dre: "108200",
      dre_nome: "DRE",
      ue: "UE-1",
      ue_nome: "UE Teste",
      codigo_hierarquico: "EH",
      nome_civil: "Maria Civil",
      nome_servidor: "João",
      rf: "123456",
      vinculo: "CLT",
      cargo_base: "PROFESSOR",
      cd_cargo_base: "20",
      cargo_sobreposto_funcao_atividade: "COORDENADOR",
      local_de_exercicio: "ESCOLA",
      lotacao: "Lotação",
      categoria: "A",
      cursos_titulos: "-",
      laudo_medico: "Indisponível",
      titular_cargo_sobreposto: "SUPERVISOR",
      cessacao: {
        numero_portaria: "987",
        ano: "2025",
        numero_sei: "SEI-CESS",
        a_pedido: "sim",
        data_inicio: new Date("2026/03/15"),
        remocao: "sim",
        aposentadoria: "sim",
        doc: "DOC-CESS",
      },
    });
  });

  it("reseta o formulário com fallbacks quando a designação vem incompleta", () => {
    mockDesignacaoAtual = {
      cessacao: null,
      data_inicio: undefined,
      data_fim: undefined,
      carater_excepcional: false,
      impedimento_substituicao: null,
      com_afastamento: false,
      motivo_afastamento: "",
      pendencias: "",
    };

    render(<ApostilaPage />);

    expect(resetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        portaria_designacao: "",
        ano: undefined,
        numero_sei: "",
        doc: "",
        designacao_data_final: null,
        carater_especial: "nao",
        impedimento_substituicao: "nao",
        com_afastamento: "nao",
        motivo_afastamento: "",
        com_pendencia: "nao",
        motivo_pendencia: "",
        dre: "-",
        ue: "-",
        nome_civil: "",
        nome_servidor: "-",
        rf: "-",
        vinculo: "-",
        cargo_base: "-",
        cd_cargo_base: "",
        cargo_sobreposto_funcao_atividade: "-",
        local_de_exercicio: "-",
        lotacao: "-",
        categoria: "-",
        titular_cargo_sobreposto: "-",
        cessacao: {
          numero_portaria: "",
          ano: "",
          numero_sei: "",
          a_pedido: "nao",
          data_inicio: undefined,
          remocao: "nao",
          aposentadoria: "nao",
          doc: "",
        },
      }),
    );
    expect(resetMock.mock.calls[0][0].a_partir_de).toBeInstanceOf(Date);
  });

  it("não reseta dados carregados quando o formulário está sujo", () => {
    mockIsDirty = true;

    render(<ApostilaPage />);

    expect(resetMock).not.toHaveBeenCalled();
  });

  it("desabilita os botões de gerar e salvar quando o formulário é inválido", async () => {
    mockIsValid = false;

    render(<ApostilaPage />);

    expect(screen.getByRole("button", { name: "Gerar texto SEI" })).toBeDisabled();
  });

  it("propaga alteração do editor de texto SEI", async () => {
    render(<ApostilaPage />);
    fireEvent.click(screen.getByRole("button", { name: "Gerar texto SEI" }));

    await waitFor(() => {
      expect(screen.getByTestId("simple-editor")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("simple-editor"));

    expect(editorOnChangeMock).toHaveBeenCalledWith("Texto editado");
    expect(simpleEditorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        hasError: false,
        content: "Texto SEI inicial",
      }),
    );
  });

  it("executa os callbacks de informações adicionais", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    render(<ApostilaPage />);
    fireEvent.click(screen.getByRole("button", { name: "alterar descricao" }));
    fireEvent.click(screen.getByRole("button", { name: "alterar detalhe" }));

    expect(consoleLogSpy).toHaveBeenCalledWith("obs");
    expect(consoleLogSpy).toHaveBeenCalledWith("true");
    consoleLogSpy.mockRestore();
  });

});
