import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BaseSyntheticEvent, ButtonHTMLAttributes, ReactNode } from "react";
import type {
  Control,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReturn,
} from "react-hook-form";
import ModalSelecaoDeTipoDeTexto from "./ModalSelecaoDeTipoDeTexto";
import { formSchemaSelecaoTextosPortariaData } from "./formSchemaSelecaoTextosPortaria";

interface DialogMockProps {
  open?: boolean;
  children: ReactNode;
}

interface DialogContentMockProps {
  children: ReactNode;
  className?: string;
  closeButton?: boolean;
}

interface ButtonMockProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "lg";
  variant?: "default" | "destructive";
  loading?: boolean;
}

interface CheckboxFieldMockProps {
  name: string;
  dataTestId?: string;
  showBlankSpace?: boolean;
  label: string;
  fields: { label: string; subtitle: string; value: string }[];
}

interface TipoAtoSelectFieldMockProps {
  label?: string;
  name?: string;
  AtosOpcoes: { codigo: string; nome: string }[];
}

interface HookMockReturn {
  filterForm: Pick<UseFormReturn<formSchemaSelecaoTextosPortariaData>, "handleSubmit" | "register" | "control">;
  onSubmitFilterForm: SubmitHandler<formSchemaSelecaoTextosPortariaData>;
  tipo_de_texto: string;
  isPending: boolean;
}

const {
  atosOpcoesMock,
  tipoAtoSelectSpy,
  checkboxFieldSpy,
  dialogContentSpy,
  formProviderSpy,
  useModalTextosPortariaMock,
} = vi.hoisted(() => ({
  atosOpcoesMock: [
    { codigo: "DESIGNACAO", nome: "Designação" },
    { codigo: "CESSACAO", nome: "Cessação" },
  ],
  tipoAtoSelectSpy: vi.fn<(props: TipoAtoSelectFieldMockProps) => void>(),
  checkboxFieldSpy: vi.fn<(props: CheckboxFieldMockProps) => void>(),
  dialogContentSpy: vi.fn<(props: DialogContentMockProps) => void>(),
  formProviderSpy: vi.fn(),
  useModalTextosPortariaMock: vi.fn<() => HookMockReturn>(),
}));

const onCloseMock = vi.fn();
const onSubmitFilterFormMock = vi.fn();
const registerMock = vi.fn() as unknown as UseFormRegister<formSchemaSelecaoTextosPortariaData>;
const controlMock = {} as Control<formSchemaSelecaoTextosPortariaData>;

const submittedValues: formSchemaSelecaoTextosPortariaData = {
  tipo_de_texto: "criar_novo_texto",
  tipo_portaria: "DESIGNACAO",
};

const handleSubmitMock = vi.fn(
  (callback: SubmitHandler<formSchemaSelecaoTextosPortariaData>) => async (event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    await callback(submittedValues, event);
  },
);

let tipoDeTexto = "criar_novo_texto";
let isPending = false;

vi.mock("@/hooks/useModalTextosPortaria", () => ({
  useModalTextosPortaria: () => useModalTextosPortariaMock(),
}));

vi.mock("react-hook-form", () => ({
  FormProvider: ({
    children,
    ...formProps
  }: Partial<UseFormReturn<formSchemaSelecaoTextosPortariaData>> & { children: ReactNode }) => {
    formProviderSpy(formProps);
    return <>{children}</>;
  },
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: DialogMockProps) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: (props: DialogContentMockProps) => {
    dialogContentSpy(props);
    return <div data-testid="dialog-content">{props.children}</div>;
  },
  DialogHeader: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div data-testid="dialog-header" className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children }: { children: ReactNode }) => <h3>{children}</h3>,
  DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, loading, disabled, ...rest }: ButtonMockProps) => (
    <button {...rest} disabled={Boolean(disabled || loading)} data-loading={String(Boolean(loading))}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/FieldsForm", () => ({
  CheckboxFieldSecondary: (props: CheckboxFieldMockProps) => {
    checkboxFieldSpy(props);
    return (
      <div data-testid={props.dataTestId}>
        <span>{props.label}</span>
        {props.fields.map((field) => (
          <div key={field.value} data-testid={`opcao-${field.value}`}>
            <p>{field.label}</p>
            <p>{field.subtitle}</p>
          </div>
        ))}
      </div>
    );
  },
}));

vi.mock("../../Designacao/FiltroDeAtosAdministrativos/FiltroDeAtosAdministrativos", () => ({
  AtosOpcoes: atosOpcoesMock,
  TipoAtoSelectField: (props: TipoAtoSelectFieldMockProps) => {
    tipoAtoSelectSpy(props);
    return <div data-testid="tipo-ato-select">{props.label}</div>;
  },
}));

const createHookReturn = (): HookMockReturn => ({
  filterForm: {
    handleSubmit: handleSubmitMock as unknown as UseFormHandleSubmit<formSchemaSelecaoTextosPortariaData>,
    register: registerMock,
    control: controlMock,
  },
  onSubmitFilterForm: onSubmitFilterFormMock,
  tipo_de_texto: tipoDeTexto,
  isPending,
});

describe("ModalSelecaoDeTipoDeTexto", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tipoDeTexto = "criar_novo_texto";
    isPending = false;
    useModalTextosPortariaMock.mockImplementation(() => createHookReturn());
  });

  it("não exibe o conteúdo quando o modal está fechado", () => {
    render(<ModalSelecaoDeTipoDeTexto isOpen={false} onClose={onCloseMock} />);

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    expect(formProviderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        handleSubmit: handleSubmitMock,
        register: registerMock,
        control: controlMock,
      }),
    );
  });

  it("renderiza título, descrição e opções de tipo de texto", () => {
    render(<ModalSelecaoDeTipoDeTexto isOpen onClose={onCloseMock} />);

    expect(screen.getByTestId("dialog")).toHaveTextContent("Novo texto de portaria");
    expect(screen.getByText("Escolha como deseja criar o texto da portaria.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Você pode iniciar um novo texto ou utilizar como base o último texto cadastrado para o ato administrativo selecionado.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByTestId("tipo-texto-portaria")).toBeInTheDocument();
    expect(screen.getByTestId("opcao-criar_novo_texto")).toHaveTextContent("Criar um novo texto");
    expect(screen.getByTestId("opcao-criar_novo_texto")).toHaveTextContent(
      "Inicia o cadastro com os campos em branco.",
    );
    expect(screen.getByTestId("opcao-ultimo_texto_cadastrado")).toHaveTextContent(
      "Usar o último texto cadastrado",
    );
    expect(screen.getByTestId("opcao-ultimo_texto_cadastrado")).toHaveTextContent(
      "Preenche os campos com base no último texto criado. As informações poderão ser editadas antes de salvar.",
    );

    expect(checkboxFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "tipo_de_texto",
        dataTestId: "tipo-texto-portaria",
        showBlankSpace: false,
        label: "Tipo de texto",
        register: registerMock,
        control: controlMock,
      }),
    );
    expect(dialogContentSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        className: "max-w-[560px] p-8 overflow-y-auto max-h-[90vh]",
        closeButton: false,
      }),
    );
    expect(screen.queryByTestId("tipo-ato-select")).not.toBeInTheDocument();
  });

  it("exibe o select de tipo de portaria ao usar o último texto cadastrado", () => {
    tipoDeTexto = "ultimo_texto_cadastrado";

    render(<ModalSelecaoDeTipoDeTexto isOpen onClose={onCloseMock} />);

    expect(screen.getByTestId("tipo-ato-select")).toHaveTextContent("Tipo de portaria");
    expect(tipoAtoSelectSpy).toHaveBeenCalledWith({
      label: "Tipo de portaria",
      name: "tipo_portaria",
      AtosOpcoes: atosOpcoesMock,
    });
  });

  it("fecha o modal ao cancelar", () => {
    render(<ModalSelecaoDeTipoDeTexto isOpen onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId("botao-cancelar-revisar-texto"));

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("submete o formulário pelo botão criar texto", () => {
    render(<ModalSelecaoDeTipoDeTexto isOpen onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId("botao-criar-texto"));

    expect(handleSubmitMock).toHaveBeenCalledWith(onSubmitFilterFormMock);
    expect(onSubmitFilterFormMock).toHaveBeenCalledWith(submittedValues, expect.any(Object));
  });

  it("submete o formulário pelo submit do form", () => {
    render(<ModalSelecaoDeTipoDeTexto isOpen onClose={onCloseMock} />);

    fireEvent.submit(screen.getByTestId("botao-criar-texto").closest("form") as HTMLFormElement);

    expect(handleSubmitMock).toHaveBeenCalledWith(onSubmitFilterFormMock);
    expect(onSubmitFilterFormMock).toHaveBeenCalledWith(submittedValues, expect.any(Object));
  });

  it("desabilita o botão de criar enquanto a busca está pendente", () => {
    isPending = true;

    render(<ModalSelecaoDeTipoDeTexto isOpen onClose={onCloseMock} />);

    const criarButton = screen.getByTestId("botao-criar-texto");
    expect(criarButton).toBeDisabled();
    expect(criarButton).toHaveAttribute("data-loading", "true");
  });
});
