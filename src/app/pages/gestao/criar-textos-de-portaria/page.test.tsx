import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BaseSyntheticEvent, ButtonHTMLAttributes, ReactNode } from "react";
import type {
  Control,
  SubmitHandler,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReturn,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import CriarTextosDePortaria from "./page";
import { FormSchemaCriarTextosPortariaData } from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormSchemaCriarTextosPortaria";

interface PageHeaderMockProps {
  showBackButton: boolean;
  title: ReactNode;
  breadcrumbs: Array<{ title: string; href: string }>;
  createButton?: ReactNode;
}

interface FundoBrancoMockProps {
  children: ReactNode;
  className?: string;
}

interface SimpleTableHeaderMockProps {
  title: string;
  subtitle: string;
}

interface ButtonMockProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "lg";
  variant?: "destructive" | "default";
}

interface AlertMockProps {
  title: ReactNode;
  description: ReactNode;
  type?: string;
  showIcon?: boolean;
  icon?: ReactNode;
}

interface DialogMockProps {
  open?: boolean;
  children: ReactNode;
}

interface SimpleEditorMockProps {
  hasError?: boolean;
  content?: string;
  onChange?: (content: string) => void;
}

interface FormFieldRenderArgs {
  field: {
    value: string;
    onChange: (value: string) => void;
  };
  fieldState: {
    error?: { message: string };
  };
}

interface FormMessageMockProps {
  showBlankSpace?: boolean;
}

interface FilterFormMock {
  watch: UseFormWatch<FormSchemaCriarTextosPortariaData>;
  getValues: UseFormGetValues<FormSchemaCriarTextosPortariaData>;
  setValue: UseFormSetValue<FormSchemaCriarTextosPortariaData>;
  handleSubmit: UseFormHandleSubmit<FormSchemaCriarTextosPortariaData>;
  register: UseFormRegister<FormSchemaCriarTextosPortariaData>;
  control: Control<FormSchemaCriarTextosPortariaData>;
}

interface HookMockReturn {
  filterForm: FilterFormMock;
  isModalOpen: boolean;
  onSubmitFilterForm: SubmitHandler<FormSchemaCriarTextosPortariaData>;
  handleCancel: () => void;
}

const pushMock = vi.fn();
const pageHeaderSpy = vi.fn<(props: PageHeaderMockProps) => void>();
const fundoBrancoSpy = vi.fn<(props: FundoBrancoMockProps) => void>();
const simpleTableHeaderSpy = vi.fn<(props: SimpleTableHeaderMockProps) => void>();
const formProviderSpy = vi.fn();
const formCriarSpy = vi.fn();
const editorOnChangeMock = vi.fn();
const handleCancelMock = vi.fn();
const onSubmitFilterFormMock = vi.fn();
const useCriarTextosPortariaMock = vi.fn<() => HookMockReturn>();
const watchMock = vi.fn<() => string[] | undefined>();
const getValuesMock = vi.fn<(name?: string) => string | undefined>();
const setValueMock = vi.fn();

const submittedValues: FormSchemaCriarTextosPortariaData = {
  tipo_portaria: "PORTARIA",
  nome_modelo: "Modelo 1",
  status: "ATIVO",
  texto_portaria: "<p>Texto</p>",
  variaveis: ["PORTARIA"],
  tipo_cargo: "CARGO_VAGO",
};

const handleSubmitMock = vi.fn(
  (callback: SubmitHandler<FormSchemaCriarTextosPortariaData>) => async (event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    await callback(submittedValues, event);
  },
);

let watchedVariavel: string[] | undefined = [];
let textoPortaria = "";
let isModalOpen = false;
let fieldError: { message: string } | undefined;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/hooks/useCriarTextosPortaria", () => ({
  useCriarTextosPortaria: () => useCriarTextosPortariaMock(),
}));

vi.mock("react-hook-form", () => ({
  FormProvider: ({
    children,
    ...formProps
  }: Partial<UseFormReturn<FormSchemaCriarTextosPortariaData>> & { children: ReactNode }) => {
    formProviderSpy(formProps);
    return <>{children}</>;
  },
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: (props: PageHeaderMockProps) => {
    pageHeaderSpy(props);
    return (
      <header data-testid="page-header">
        <span>{props.title}</span>
        {props.createButton}
      </header>
    );
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
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...rest }: ButtonMockProps) => <button {...rest}>{children}</button>,
}));

vi.mock("antd", () => ({
  Alert: (props: AlertMockProps) => (
    <div data-testid="alert" data-type={props.type}>
      {props.icon}
      <div>{props.title}</div>
      <div>{props.description}</div>
    </div>
  ),
}));

vi.mock("lucide-react", () => ({
  TriangleAlert: () => <span data-testid="icon-alert" />,
}));

vi.mock("@/components/dashboard/Gestao/FormCriarTextosPortaria/FormCriarTextosPortaria", () => ({
  default: () => {
    formCriarSpy();
    return <div data-testid="form-criar-textos">form criar</div>;
  },
}));

vi.mock("@/components/ui/tiptap-templates/simple/simple-editor", () => ({
  SimpleEditor: (props: SimpleEditorMockProps) => (
    <button
      type="button"
      data-testid="simple-editor"
      data-has-error={String(Boolean(props.hasError))}
      data-content={props.content}
      onClick={() => props.onChange?.("conteudo-editado")}
    >
      editor
    </button>
  ),
}));

vi.mock("@/components/ui/form", () => ({
  FormField: ({ render }: { render: (args: FormFieldRenderArgs) => ReactNode }) =>
    render({
      field: {
        value: textoPortaria,
        onChange: editorOnChangeMock,
      },
      fieldState: {
        error: fieldError,
      },
    }),
  FormControl: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: ReactNode }) => <label>{children}</label>,
  FormItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormMessage: (props: FormMessageMockProps) => (
    <span data-testid="form-message" data-blank={String(Boolean(props.showBlankSpace))} />
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: DialogMockProps) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h3>{children}</h3>,
  DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
}));

const createFilterForm = (): FilterFormMock => ({
  watch: watchMock as unknown as UseFormWatch<FormSchemaCriarTextosPortariaData>,
  getValues: getValuesMock as unknown as UseFormGetValues<FormSchemaCriarTextosPortariaData>,
  setValue: setValueMock as unknown as UseFormSetValue<FormSchemaCriarTextosPortariaData>,
  handleSubmit: handleSubmitMock as unknown as UseFormHandleSubmit<FormSchemaCriarTextosPortariaData>,
  register: vi.fn() as unknown as UseFormRegister<FormSchemaCriarTextosPortariaData>,
  control: {} as Control<FormSchemaCriarTextosPortariaData>,
});

describe("Página Cadastrar texto de portaria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    watchedVariavel = [];
    textoPortaria = "";
    isModalOpen = false;
    fieldError = undefined;
    watchMock.mockImplementation(() => watchedVariavel);
    getValuesMock.mockImplementation(() => textoPortaria);
    useCriarTextosPortariaMock.mockImplementation(() => ({
      filterForm: createFilterForm(),
      isModalOpen,
      onSubmitFilterForm: onSubmitFilterFormMock,
      handleCancel: handleCancelMock,
    }));
  });

  it("renderiza header, formulário, editor e alerta", () => {
    render(<CriarTextosDePortaria />);

    expect(screen.getByTestId("page-header")).toHaveTextContent("Cadastrar texto de portaria");
    expect(screen.getByTestId("btn-voltar")).toHaveTextContent("Cancelar");
    expect(screen.getByTestId("botao-proximo")).toHaveTextContent("Cadastrar texto");
    expect(screen.getByTestId("form-criar-textos")).toBeInTheDocument();
    expect(screen.getAllByTestId("fundo-branco")).toHaveLength(2);
    expect(screen.getByTestId("alert")).toHaveAttribute("data-type", "warning");
    expect(screen.getByTestId("icon-alert")).toBeInTheDocument();
    expect(screen.getByTestId("form-message")).toHaveAttribute("data-blank", "true");
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();

    const pageHeaderProps = pageHeaderSpy.mock.calls[0][0];
    expect(pageHeaderProps.showBackButton).toBe(false);
    expect(pageHeaderProps.breadcrumbs).toEqual([
      { title: "Início", href: "/" },
      { title: "Gestão", href: "/" },
      { title: "Textos de portaria", href: "textos-de-portaria" },
      { title: "Cadastrar texto de portaria", href: "" },
    ]);
    expect(simpleTableHeaderSpy).toHaveBeenNthCalledWith(1, {
      title: "Informações gerais",
      subtitle: "Preencha as informações do modelo e o texto que será utilizado na emissão da portaria.",
    });
    expect(simpleTableHeaderSpy).toHaveBeenNthCalledWith(2, {
      title: "Texto da portaria",
      subtitle: "Digite o texto da portaria e utilize as ferramentas de formatação para organizar o conteúdo.",
    });
    expect(formCriarSpy).toHaveBeenCalledTimes(1);
  });

  it("cancela, submete o cadastro e dispara o editor", () => {
    fieldError = { message: "Campo obrigatório." };
    render(<CriarTextosDePortaria />);

    expect(screen.getByTestId("simple-editor")).toHaveAttribute("data-has-error", "true");

    fireEvent.click(screen.getByTestId("btn-voltar"));
    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/textos-de-portaria");

    fireEvent.click(screen.getByTestId("botao-proximo"));
    expect(handleSubmitMock).toHaveBeenCalledWith(onSubmitFilterFormMock);
    expect(onSubmitFilterFormMock).toHaveBeenCalledWith(submittedValues, expect.any(Object));

    fireEvent.submit(screen.getByTestId("form-criar-textos").closest("form") as HTMLFormElement);
    expect(onSubmitFilterFormMock).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByTestId("simple-editor"));
    expect(editorOnChangeMock).toHaveBeenCalledWith("conteudo-editado");
  });

  it("exibe o modal de revisão e fecha ao revisar o texto", () => {
    isModalOpen = true;
    render(<CriarTextosDePortaria />);

    expect(screen.getByTestId("dialog")).toHaveTextContent("Revise as variáveis do texto");
    fireEvent.click(screen.getByTestId("botao-cancelar-revisar-texto"));
    expect(handleCancelMock).toHaveBeenCalledTimes(1);
  });

  it("não altera o texto quando as variáveis não mudam", () => {
    watchedVariavel = ["PORTARIA"];
    render(<CriarTextosDePortaria />);

    expect(setValueMock).not.toHaveBeenCalled();
  });

  it("insere token em conteúdo vazio e trata watch fora de array", () => {
    const { rerender } = render(<CriarTextosDePortaria />);

    watchedVariavel = ["PORTARIA"];
    textoPortaria = "";
    rerender(<CriarTextosDePortaria />);

    expect(setValueMock).toHaveBeenCalledWith("texto_portaria", "[[PORTARIA]]", {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValueMock.mockClear();
    watchedVariavel = undefined;
    textoPortaria = "[[PORTARIA]]";
    rerender(<CriarTextosDePortaria />);

    expect(setValueMock).toHaveBeenCalledWith("texto_portaria", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  });

  it.each([
    {
      scenario: "texto sem parágrafo",
      content: "Servidor",
      expected: "Servidor [[NOME_SERVIDOR]]",
    },
    {
      scenario: "parágrafo cujo conteúdo interno não fecha tag",
      content: "<p>Servidor</p>",
      expected: "<p>Servidor [[NOME_SERVIDOR]]</p>",
    },
    {
      scenario: "parágrafo que termina em tag",
      content: "<P><strong></P>",
      expected: "<P><strong>[[NOME_SERVIDOR]]</p>",
    },
  ])("insere token no $scenario", ({ content, expected }) => {
    const { rerender } = render(<CriarTextosDePortaria />);

    watchedVariavel = ["NOME_SERVIDOR"];
    textoPortaria = content;
    rerender(<CriarTextosDePortaria />);

    expect(setValueMock).toHaveBeenCalledWith("texto_portaria", expected, {
      shouldDirty: true,
      shouldValidate: true,
    });
  });

  it("não altera o conteúdo quando o token já existe no texto", () => {
    const { rerender } = render(<CriarTextosDePortaria />);

    watchedVariavel = ["PORTARIA"];
    textoPortaria = "[[PORTARIA]]";
    rerender(<CriarTextosDePortaria />);

    expect(setValueMock).not.toHaveBeenCalled();
  });

  it("trata texto indefinido como vazio ao inserir a primeira variável", () => {
    const { rerender } = render(<CriarTextosDePortaria />);

    watchedVariavel = ["PORTARIA"];
    getValuesMock.mockReturnValueOnce(undefined);
    rerender(<CriarTextosDePortaria />);

    expect(setValueMock).toHaveBeenCalledWith("texto_portaria", "[[PORTARIA]]", {
      shouldDirty: true,
      shouldValidate: true,
    });
  });

  it("remove token com e sem espaço e sincroniza inclusão e exclusão juntos", () => {
    watchedVariavel = ["PORTARIA", "NOME_SERVIDOR"];
    const { rerender } = render(<CriarTextosDePortaria />);

    watchedVariavel = ["NUMERO_RF"];
    textoPortaria = "Inicio [[PORTARIA]] meio [[NOME_SERVIDOR]] fim";
    rerender(<CriarTextosDePortaria />);

    expect(setValueMock).toHaveBeenCalledWith(
      "texto_portaria",
      "Inicio meio fim [[NUMERO_RF]]",
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  });
});
