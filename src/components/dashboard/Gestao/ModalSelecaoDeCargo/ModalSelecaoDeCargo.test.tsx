import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import ModalSelecaoDeCargo from "./ModalSelecaoDeCargo";
import type { formSchemaSelecaoDeCargoData } from "./formSchemaSelecaoDeCargo";

const { useModalSelecaoDeCargoMock, comboboxSpy, formSubmitMock } = vi.hoisted(() => ({
  useModalSelecaoDeCargoMock: vi.fn(),
  comboboxSpy: vi.fn(),
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

vi.mock("@/components/ui/Combobox", () => ({
  Combobox: ({
    options,
    value,
    onChange,
    placeholder,
    disabled,
    ...rest
  }: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    "data-testid"?: string;
  }) => {
    comboboxSpy({ options, value, placeholder, disabled, ...rest });
    return (
      <div data-testid="combobox-wrapper">
        <span data-testid="combobox-value">{value}</span>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            data-testid={`combobox-option-${option.value}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  },
}));

const cargos = [
  { codigoCargo: 3360, nomeCargo: "DIRETOR DE ESCOLA" },
  { codigoCargo: 3379, nomeCargo: "COORDENADOR PEDAGOGICO" },
];

const onCloseMock = vi.fn();
const onConfirmMock = vi.fn();
const onSubmitFilterFormMock = vi.fn();

const baseHookReturn = (overrides: Record<string, unknown> = {}) => {
  const filterForm = useForm<formSchemaSelecaoDeCargoData>({
    defaultValues: { codigo_cargo: "" },
    mode: "onChange",
  });

  return {
    filterForm: filterForm as unknown as UseFormReturn<formSchemaSelecaoDeCargoData>,
    onSubmitFilterForm: formSubmitMock,
    cargosOpcoes: cargos,
    isLoadingCargos: false,
    defaultValues: { codigo_cargo: "" },
    ...overrides,
  };
};

describe("ModalSelecaoDeCargo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useModalSelecaoDeCargoMock.mockImplementation(() => baseHookReturn());
  });

  it("não renderiza o conteúdo quando fechado", () => {
    render(<ModalSelecaoDeCargo isOpen={false} onClose={onCloseMock} />);

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("renderiza título, descrição e repassa callbacks ao hook", () => {
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

  it("renderiza o Combobox de cargos com os dados do endpoint", () => {
    render(<ModalSelecaoDeCargo isOpen onClose={onCloseMock} />);

    expect(screen.getByTestId("combobox-wrapper")).toBeInTheDocument();
    expect(comboboxSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        placeholder: "Selecione",
        value: "",
        options: [
          { value: "3360", label: "DIRETOR DE ESCOLA" },
          { value: "3379", label: "COORDENADOR PEDAGOGICO" },
        ],
      }),
    );
    expect(screen.getByText("Código e descrição completa do cargo no EOL")).toBeInTheDocument();
    expect(screen.getByTestId("combobox-option-3360")).toHaveTextContent("DIRETOR DE ESCOLA");
  });

  it("exibe o loading no lugar do Combobox enquanto os cargos são carregados", () => {
    useModalSelecaoDeCargoMock.mockImplementation(() =>
      baseHookReturn({ cargosOpcoes: [], isLoadingCargos: true }),
    );

    render(<ModalSelecaoDeCargo isOpen onClose={onCloseMock} />);

    expect(screen.queryByTestId("combobox-wrapper")).not.toBeInTheDocument();
    expect(screen.getByTestId("botao-continuar-selecao-de-cargo")).toBeDisabled();
  });

  it("fecha o modal ao cancelar", () => {
    render(<ModalSelecaoDeCargo isOpen onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId("botao-cancelar-selecao-de-cargo"));

    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(formSubmitMock).not.toHaveBeenCalled();
  });

  it("propaga a seleção do Combobox para o formulário", async () => {
    render(<ModalSelecaoDeCargo isOpen onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId("combobox-option-3379"));

    await waitFor(() => {
      expect(screen.getByTestId("combobox-value")).toHaveTextContent("3379");
    });
  });

  it("chama o submit do formulário ao clicar em continuar", () => {
    const { container } = render(<ModalSelecaoDeCargo isOpen onClose={onCloseMock} />);

    fireEvent.submit(container.querySelector("form") as HTMLFormElement);

    expect(formSubmitMock).not.toHaveBeenCalled();
    expect(screen.getByTestId("botao-continuar-selecao-de-cargo")).toHaveAttribute("type", "submit");
  });

  it("exibe o loading do botão conforme a submissão do formulário", () => {
    render(<ModalSelecaoDeCargo isOpen onClose={onCloseMock} />);

    expect(screen.getByTestId("botao-continuar-selecao-de-cargo")).toHaveAttribute(
      "data-loading",
      "false",
    );
  });
});

void onSubmitFilterFormMock;
