import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FormCargosBasePrincipal from "./FormCargosBasePrincipal";

const simpleTableHeaderSpy = vi.fn();
const inputFieldSpy = vi.fn();
const selectFieldSpy = vi.fn();
const comboboxSpy = vi.fn();
const fieldOnChangeMock = vi.fn();

vi.mock("react-hook-form", () => ({
  useFormContext: () => ({
    register: vi.fn(),
    control: {},
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
  InputField: (props: { label: string; "data-testid"?: string }) => {
    inputFieldSpy(props);
    return <div data-testid={props["data-testid"]}>{props.label}</div>;
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
    render: renderProp,
  }: {
    render: (args: { field: { value: string; onChange: (value: string) => void } }) => ReactNode;
  }) => (
    <div data-testid="form-field-codigo-cargo-eol">
      {renderProp({
        field: {
          value: "",
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

vi.mock("@/components/ui/Combobox", () => ({
  Combobox: ({
    options,
    onChange,
    "data-testid": dataTestId,
  }: {
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
    "data-testid"?: string;
  }) => {
    comboboxSpy({ options, dataTestId });
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
  });

  it("renderiza cabeçalho, campos e mapeia opções para combobox e selects", () => {
    render(
      <FormCargosBasePrincipal
        CargosBaseOpcoes={[
          { codigo: "1", nome: "Cargo A" },
          { codigo: "2", nome: "Cargo B" },
        ]}
      />,
    );

    expect(simpleTableHeaderSpy).toHaveBeenCalledWith({
      title: "Informações do cargo",
      subtitle: "Dados de identificação e classificação funcional.",
    });

    expect(screen.getByTestId("select-codigo-cargo-eol")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("select-codigo-cargo-eol"));
    expect(fieldOnChangeMock).toHaveBeenCalledWith("2");

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
    });

    expect(screen.getByTestId("option-grupamento-1")).toHaveTextContent("Apoio - educação");
    expect(screen.getByTestId("option-situacao_funcional-2")).toHaveTextContent("Efetivo");
    expect(screen.getByTestId("option-status-3")).toHaveTextContent("Extinto");
  });

  it("usa lista vazia de cargos quando não recebe CargosBaseOpcoes", () => {
    render(<FormCargosBasePrincipal CargosBaseOpcoes={undefined as never} />);

    expect(comboboxSpy).toHaveBeenCalledWith({
      options: [],
      dataTestId: "select-codigo-cargo-eol",
    });
    expect(inputFieldSpy).toHaveBeenCalledTimes(1);
    expect(selectFieldSpy).toHaveBeenCalledTimes(3);
  });
});
