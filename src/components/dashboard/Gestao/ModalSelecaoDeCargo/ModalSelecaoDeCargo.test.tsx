import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import ModalSelecaoDeCargo from "./ModalSelecaoDeCargo";
import type { formSchemaSelecaoDeCargoData } from "./formSchemaSelecaoDeCargo";

const { useModalSelecaoDeCargoMock, formSubmitMock } = vi.hoisted(() => ({
  useModalSelecaoDeCargoMock: vi.fn(),
  formSubmitMock: vi.fn(),
}));

vi.mock("@/hooks/useModalSelecaoDeCargo", () => ({
  useModalSelecaoDeCargo: (params: unknown) => useModalSelecaoDeCargoMock(params),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open?: boolean; children: ReactNode }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h3>{children}</h3>,
  DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    loading,
    ...rest
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) => (
    <button {...rest} data-loading={String(Boolean(loading))}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/FieldsForm", () => ({
  SelectField: ({
    dataTestId,
    label,
    options,
    isLoading,
    onValueChange,
  }: {
    dataTestId?: string;
    label?: ReactNode;
    options: { value: string; label: string }[];
    isLoading?: boolean;
    onValueChange?: (value: string) => void;
  }) => {
    if (isLoading) {
      return <div data-testid="select-loading" />;
    }

    return (
      <div data-testid={dataTestId}>
        <span data-testid="select-label">{label}</span>
        <select
          data-testid={`${dataTestId}-select`}
          onChange={(event) => onValueChange?.(event.target.value)}
        >
          <option value="">Selecione</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  },
}));

const cargos = [
  { codigoCargo: 3360, nomeCargo: "DIRETOR DE ESCOLA" },
  { codigoCargo: 3379, nomeCargo: "COORDENADOR PEDAGOGICO" },
];

const registerMock = vi.fn();

const createFilterForm = (isSubmitting = false) =>
  ({
    register: registerMock,
    control: {},
    formState: { isSubmitting },
    handleSubmit: (callback: (values: formSchemaSelecaoDeCargoData) => void) => () => {
      formSubmitMock(callback);
    },
  }) as unknown as UseFormReturn<formSchemaSelecaoDeCargoData>;

const onCloseMock = vi.fn();
const onConfirmMock = vi.fn();
const onSubmitFilterFormMock = vi.fn();

const baseHookReturn = (overrides: Record<string, unknown> = {}) => ({
  filterForm: createFilterForm(),
  onSubmitFilterForm: onSubmitFilterFormMock,
  cargosOpcoes: cargos,
  isLoadingCargos: false,
  defaultValues: { codigo_cargo: "" },
  ...overrides,
});

describe("ModalSelecaoDeCargo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useModalSelecaoDeCargoMock.mockImplementation(() => baseHookReturn());
  });

  it("não renderiza o conteúdo quando fechado", () => {
    render(<ModalSelecaoDeCargo isOpen={false} onClose={onCloseMock} />);

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("renderiza título, descrição e o select com os cargos", () => {
    render(<ModalSelecaoDeCargo isOpen onClose={onCloseMock} onConfirm={onConfirmMock} />);

    expect(screen.getByText("Selecione um cargo")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Após a seleção, você poderá cadastrar as informações complementares necessárias para configurar o cargo no sistema.",
      ),
    ).toBeInTheDocument();

    expect(useModalSelecaoDeCargoMock).toHaveBeenCalledWith({
      onClose: onCloseMock,
      onConfirm: onConfirmMock,
    });
  });

  it("renderiza o select com os cargos retornados pelo endpoint", () => {
    render(<ModalSelecaoDeCargo isOpen onClose={onCloseMock} />);

    const options = Array.from(
      (screen.getByTestId("select-codigo-cargo-eol-select") as HTMLSelectElement).options,
    ).map((option) => ({ value: option.value, label: option.textContent }));

    expect(options).toEqual([
      { value: "", label: "Selecione" },
      { value: "3360", label: "DIRETOR DE ESCOLA" },
      { value: "3379", label: "COORDENADOR PEDAGOGICO" },
    ]);
    expect(screen.getByTestId("select-label")).toHaveTextContent(
      "Código e descrição completa do cargo no EOL",
    );
  });

  it("exibe o loading no lugar do select enquanto os cargos são carregados", () => {
    useModalSelecaoDeCargoMock.mockImplementation(() =>
      baseHookReturn({ cargosOpcoes: [], isLoadingCargos: true }),
    );

    render(<ModalSelecaoDeCargo isOpen onClose={onCloseMock} />);

    expect(screen.getByTestId("select-loading")).toBeInTheDocument();
    expect(screen.getByTestId("botao-continuar-selecao-de-cargo")).toBeDisabled();
  });

  it("fecha o modal ao cancelar", () => {
    render(<ModalSelecaoDeCargo isOpen onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId("botao-cancelar-selecao-de-cargo"));

    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(formSubmitMock).not.toHaveBeenCalled();
  });

  it("submete o formulário ao clicar em continuar", () => {
    render(<ModalSelecaoDeCargo isOpen onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId("botao-continuar-selecao-de-cargo"));

    expect(formSubmitMock).toHaveBeenCalledWith(onSubmitFilterFormMock);
  });

  it("exibe o loading do botão conforme a submissão do formulário", () => {
    render(<ModalSelecaoDeCargo isOpen onClose={onCloseMock} />);

    expect(screen.getByTestId("botao-continuar-selecao-de-cargo")).toHaveAttribute(
      "data-loading",
      "false",
    );

    useModalSelecaoDeCargoMock.mockImplementation(() =>
      baseHookReturn({ filterForm: createFilterForm(true) }),
    );
    render(<ModalSelecaoDeCargo isOpen onClose={onCloseMock} />);

    expect(screen.getAllByTestId("botao-continuar-selecao-de-cargo")[1]).toHaveAttribute(
      "data-loading",
      "true",
    );
  });
});
