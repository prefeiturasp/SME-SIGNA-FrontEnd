import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import FieldsBase, { InputFieldType, TextareaFieldType } from "./FieldsBase";

const useFormContextMock = vi.fn();
const inputFieldSpy = vi.fn();
const dateFieldSpy = vi.fn();

vi.mock("react-hook-form", () => ({
  useFormContext: () => useFormContextMock(),
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="fields-loading">loading</div>,
}));

vi.mock("@/components/ui/FieldsForm", () => ({
  InputField: (props: { name: string; label: ReactNode }) => {
    inputFieldSpy(props);
    return <div data-testid={`input-field-${props.name}`}>{props.label}</div>;
  },
  DateField: (props: { name: string; label: ReactNode }) => {
    dateFieldSpy(props);
    return <div data-testid={`date-field-${props.name}`}>{props.label}</div>;
  },
}));

vi.mock("@/components/ui/form", () => ({
  FormField: ({
    control,
    name,
    render: renderProp,
  }: {
    control: unknown;
    name: string;
    render: (params: { field: { value: string; onChange: ReturnType<typeof vi.fn> } }) => ReactNode;
  }) => (
    <div data-testid={`form-field-${name}`}>
      {renderProp({ field: { value: "", onChange: vi.fn() } })}
      <span data-testid={`control-${name}`}>{String(Boolean(control))}</span>
    </div>
  ),
  FormItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children, className }: { children: ReactNode; className?: string }) => (
    <label className={className}>{children}</label>
  ),
  FormControl: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormMessage: () => <span data-testid="form-message" />,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: ({ "data-testid": testId, placeholder }: { "data-testid": string; placeholder: string }) => (
    <textarea data-testid={testId} placeholder={placeholder} />
  ),
}));

const inputFields: InputFieldType[] = [
  {
    name: "apostila.numero_sei",
    label: "Número SEI",
    placeholder: "Digite o número",
    type: "text",
    disabled: false,
  },
  {
    name: "apostila.doc",
    label: "DOC",
    placeholder: "Digite o DOC",
    type: "text",
    disabled: true,
    mask: "9999",
  },
];

const textareaFields: TextareaFieldType[] = [
  {
    name: "apostila.observacao",
    label: "Observação",
    placeholder: "Descreva",
  },
];

const dateFields: InputFieldType[] = [
  {
    name: "apostila.data_doc",
    label: "Data DOC",
    placeholder: "Selecione a data",
    type: "date",
    disabled: false,
  },
];

describe("FieldsBase", () => {
  it("renderiza loading enquanto carrega", () => {
    useFormContextMock.mockReturnValue({ register: vi.fn(), control: {} });

    render(<FieldsBase isLoading inputFields={inputFields} textareaFields={textareaFields} />);

    expect(screen.getByTestId("fields-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("input-field-apostila.numero_sei")).not.toBeInTheDocument();
  });

  it("renderiza InputField para cada configuração recebida", () => {
    const register = vi.fn();
    const control = {};
    useFormContextMock.mockReturnValue({ register, control });

    render(<FieldsBase inputFields={inputFields} textareaFields={textareaFields} />);

    expect(screen.getByTestId("input-field-apostila.numero_sei")).toBeInTheDocument();
    expect(screen.getByTestId("input-field-apostila.doc")).toBeInTheDocument();
    expect(inputFieldSpy).toHaveBeenCalledTimes(2);
    expect(inputFieldSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        register,
        control,
        name: "apostila.numero_sei",
        label: "Número SEI",
      })
    );
    expect(inputFieldSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        name: "apostila.doc",
        disabled: true,
        mask: "9999",
      })
    );
  });

  it("renderiza textarea com label e placeholder configurados", () => {
    useFormContextMock.mockReturnValue({ register: vi.fn(), control: {} });

    render(<FieldsBase inputFields={inputFields} textareaFields={textareaFields} />);

    expect(screen.getByText("Observação")).toBeInTheDocument();
    expect(screen.getByTestId("input-apostila.observacao")).toHaveAttribute(
      "placeholder",
      "Descreva"
    );
    expect(screen.getByTestId("form-message")).toBeInTheDocument();
  });

  it("marca a label como obrigatória por padrão (required indefinido)", () => {
    useFormContextMock.mockReturnValue({ register: vi.fn(), control: {} });

    render(<FieldsBase inputFields={inputFields} textareaFields={textareaFields} />);

    expect(screen.getByText("Observação")).toHaveClass("required");
  });

  it("não marca a label como obrigatória quando required é false", () => {
    useFormContextMock.mockReturnValue({ register: vi.fn(), control: {} });

    const opcional: TextareaFieldType[] = [
      { name: "apostila.observacao", label: "Observação", placeholder: "Descreva", required: false },
    ];

    render(<FieldsBase inputFields={inputFields} textareaFields={opcional} />);

    expect(screen.getByText("Observação")).not.toHaveClass("required");
  });

  it("renderiza DateField com type date e allowClear desabilitado", () => {
    const register = vi.fn();
    const control = {};
    useFormContextMock.mockReturnValue({ register, control });

    render(
      <FieldsBase
        inputFields={inputFields}
        textareaFields={textareaFields}
        dateFields={dateFields}
      />
    );

    expect(screen.getByTestId("date-field-apostila.data_doc")).toBeInTheDocument();
    expect(dateFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        register,
        control,
        name: "apostila.data_doc",
        type: "date",
        allowClear: false,
      })
    );
  });
});
