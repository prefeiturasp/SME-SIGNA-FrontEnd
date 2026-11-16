import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FormCargosBasePrincipal from "./FormCargosBasePrincipal";

const simpleTableHeaderSpy = vi.fn();
const inputFieldSpy = vi.fn();
const selectFieldSpy = vi.fn();
const comboboxSpy = vi.fn();
const textareaSpy = vi.fn();
const fieldOnChangeMock = vi.fn();
const setValueMock = vi.fn();
const fieldValueMock = vi.fn(() => "");

vi.mock("react-hook-form", () => ({
  useFormContext: () => ({
    register: vi.fn(),
    control: {},
    setValue: setValueMock,
  }),
}));

vi.mock("../../SimpleTableHeader/SimpleTableHeader", () => ({
  default: (props: { title: string; subtitle: string }) => {
    simpleTableHeaderSpy(props);
    return (
      <div>
        <span>{props.title}</span>
        <span>{props.subtitle}</span>
      </div>
    );
  },
}));

vi.mock("@/components/ui/FieldsForm", () => ({
  InputField: (props: { label: string; dataTestId?: string; "data-testid"?: string }) => {
    inputFieldSpy(props);
    return <div data-testid={props.dataTestId ?? props["data-testid"]}>{props.label}</div>;
  },
  SelectField: (props: {
    name: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    "data-testid"?: string;
  }) => {
    selectFieldSpy(props);
    return (
      <div>
        <div data-testid={props["data-testid"]}>{props.label}</div>
        {props.options.map((option) => (
          <span key={option.value} data-testid={`option-${props.name}-${option.value}`}>
            {option.label}
          </span>
        ))}
      </div>
    );
  },
}));

vi.mock("@/components/ui/form", () => ({
  FormField: ({
    name,
    render: renderProp,
  }: {
    name: string;
    render: (args: { field: { value: string; onChange: (value: string) => void } }) => ReactNode;
  }) => (
    <div data-testid={`form-field-${name}`}>
      {renderProp({
        field: {
          value: fieldValueMock(),
          onChange: fieldOnChangeMock,
        },
      })}
    </div>
  ),
  FormControl: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: ReactNode }) => <label>{children}</label>,
  FormItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormMessage: () => <span data-testid="form-message" />,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: { value?: string; "data-testid"?: string }) => {
    textareaSpy(props);
    return <textarea data-testid={props["data-testid"]} value={props.value} readOnly />;
  },
}));

vi.mock("@/components/ui/Combobox", () => ({
  Combobox: ({
    options,
    onChange,
    disabled,
    placeholder,
    value,
    "data-testid": dataTestId,
  }: {
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    value?: string;
    "data-testid"?: string;
  }) => {
    comboboxSpy({ options, dataTestId, disabled, placeholder, value });
    return (
      <button type="button" data-testid={dataTestId} onClick={() => onChange("2")}>
        selecionar-codigo
      </button>
    );
  },
}));

describe("FormCargosBasePrincipal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fieldValueMock.mockReturnValue("");
  });

  it("renderiza cabeçalho, campos e mapeia opções para combobox e selects", () => {
    render(
      <FormCargosBasePrincipal
        CargosBaseOpcoes={[
          { codigoCargo: 1, nomeCargo: "Cargo A" },
          { codigoCargo: 2, nomeCargo: "Cargo B" },
        ]}
        isEditing={false}
        isLoading={false}
      />,
    );

    expect(simpleTableHeaderSpy).toHaveBeenCalledWith({
      title: "Informações do cargo",
      subtitle: "Dados de identificação e classificação funcional.",
    });

    expect(screen.getByTestId("select-codigo-cargo-eol")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("select-codigo-cargo-eol"));
    expect(fieldOnChangeMock).toHaveBeenCalledWith("2");
    expect(setValueMock).toHaveBeenCalledWith("descricao_completa", "Cargo B", { shouldValidate: true });
    expect(setValueMock).toHaveBeenCalledWith("descricao_eol", "Cargo B", { shouldValidate: true });

    expect(screen.getByTestId("input-grupamento")).toBeInTheDocument();
    expect(screen.getByTestId("input-descricao_resumida")).toBeInTheDocument();
    expect(screen.getByTestId("input-situacao_funcional")).toBeInTheDocument();
    expect(screen.getByTestId("input-status")).toBeInTheDocument();

    expect(comboboxSpy).toHaveBeenCalledWith({
      options: [
        { label: "Cargo A", value: "1" },
        { label: "Cargo B", value: "2" },
      ],
      dataTestId: "select-codigo-cargo-eol",
      disabled: false,
      placeholder: "Selecione",
      value: "",
    });

    expect(screen.getByTestId("option-grupamento-APOIO_EDUCACAO")).toHaveTextContent("Apoio - educação");
    expect(screen.getByTestId("option-grupamento-ADMINISTRATIVOS_OUTROS")).toHaveTextContent("Administrativos - outros");
    expect(screen.getByTestId("option-situacao_funcional-EFETIVO")).toHaveTextContent("Efetivo");
    expect(screen.getByTestId("option-status-EXTINTO")).toHaveTextContent("Extinto");
  });

  it("preenche descrições com vazio quando cargo não existe na lista", () => {
    render(
      <FormCargosBasePrincipal
        CargosBaseOpcoes={[{ codigoCargo: 1, nomeCargo: "Cargo A" }]}
        isEditing={false}
        isLoading={false}
      />,
    );

    fireEvent.click(screen.getByTestId("select-codigo-cargo-eol"));

    expect(setValueMock).toHaveBeenCalledWith("descricao_completa", "", { shouldValidate: true });
    expect(setValueMock).toHaveBeenCalledWith("descricao_eol", "", { shouldValidate: true });
  });

  it.each([false, true])("renderiza o campo provimento de várias linhas (isEditing=%s)", (isEditing) => {
    render(<FormCargosBasePrincipal CargosBaseOpcoes={[]} isEditing={isEditing} isLoading={false} />);

    expect(screen.getByTestId("form-field-provimento")).toHaveTextContent("Provimento");
    expect(screen.getByTestId("input-provimento").tagName).toBe("TEXTAREA");
    expect(textareaSpy).toHaveBeenCalledWith(expect.objectContaining({ rows: 4, value: "" }));
  });

  it.each([false, true])("libera descrição completa e mantém descrição EOL bloqueada (isEditing=%s)", (isEditing) => {
    render(<FormCargosBasePrincipal CargosBaseOpcoes={[]} isEditing={isEditing} isLoading={false} />);

    expect(screen.getByTestId("input-descricao_completa")).toHaveTextContent("Descrição Completa");
    expect(screen.getByTestId("input-descricao_eol")).toHaveTextContent("Descrição EOL");
    expect(inputFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: "descricao_completa", placeholder: "Digite ..." }),
    );
    expect(inputFieldSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: "descricao_completa", disabled: true }),
    );
    expect(inputFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: "descricao_eol", disabled: true }),
    );
  });

  it("mostra o provimento salvo no campo", () => {
    fieldValueMock.mockReturnValue("portando diploma de Pedagogia");

    render(<FormCargosBasePrincipal CargosBaseOpcoes={[]} isEditing={true} isLoading={false} />);

    expect(screen.getByTestId("input-provimento")).toHaveValue("portando diploma de Pedagogia");
  });

  it("desabilita combobox quando está editando ou carregando", () => {
    render(<FormCargosBasePrincipal CargosBaseOpcoes={[]} isEditing={true} isLoading={false} />);

    expect(comboboxSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: true,
      }),
    );

    vi.clearAllMocks();
    render(<FormCargosBasePrincipal CargosBaseOpcoes={[]} isEditing={false} isLoading={true} />);

    expect(comboboxSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: true,
      }),
    );
  });

  it("usa lista vazia de cargos quando não recebe opções e mantém selects renderizados", () => {
    fieldValueMock.mockReturnValue("1");
    render(
      <FormCargosBasePrincipal
        CargosBaseOpcoes={undefined as never}
        isEditing={false}
        isLoading={false}
      />,
    );

    expect(comboboxSpy).toHaveBeenCalledWith({
      options: [],
      dataTestId: "select-codigo-cargo-eol",
      disabled: false,
      placeholder: "Selecione",
      value: "1",
    });
    expect(inputFieldSpy).toHaveBeenCalledTimes(3);
    expect(selectFieldSpy).toHaveBeenCalledTimes(3);
  });
});
