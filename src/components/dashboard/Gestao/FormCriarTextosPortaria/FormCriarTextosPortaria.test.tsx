import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CSSProperties, ReactNode } from "react";
import type { Variavel } from "@/types/gestao";
import FormCriarTextosPortaria, {
  StatusOpcoes,
  TipoCargoOpcoes,
} from "./FormCriarTextosPortaria";

interface FieldOption {
  value: string;
  label: string;
}

interface InputFieldMockProps {
  name: string;
  label: ReactNode;
  placeholder?: string;
  type?: string;
  "data-testid"?: string;
}

interface SelectFieldMockProps extends InputFieldMockProps {
  options: FieldOption[];
}

interface TipoAtoSelectFieldMockProps {
  label: string;
  name: string;
  AtosOpcoes: Array<{ codigo: string; nome: string }>;
}

interface FormFieldRenderArgs {
  field: {
    value: string;
    onChange: (value: string) => void;
  };
}

interface TextareaMockProps {
  value?: string;
  onChange?: (event: { target: { value: string } }) => void;
  placeholder?: string;
  "data-testid"?: string;
  rows?: number;
}

const inputFieldSpy = vi.fn<(props: InputFieldMockProps) => void>();
const selectFieldSpy = vi.fn<(props: SelectFieldMockProps) => void>();
const multiSelectFieldSpy = vi.fn<(props: SelectFieldMockProps) => void>();
const tipoAtoSelectFieldSpy = vi.fn<(props: TipoAtoSelectFieldMockProps) => void>();
const fieldOnChangeMock = vi.fn();

vi.mock("react-hook-form", () => ({
  useFormContext: () => ({
    register: vi.fn(),
    control: {},
  }),
}));

vi.mock("@ant-design/icons", () => ({
  InfoCircleOutlined: (props: { className?: string; style?: CSSProperties }) => (
    <span data-testid="info-icon" className={props.className} style={props.style} />
  ),
}));

vi.mock("antd", () => ({
  Tooltip: (props: { children: ReactNode; title: string; placement: string }) => (
    <span data-testid="tooltip" data-title={props.title} data-placement={props.placement}>
      {props.children}
    </span>
  ),
}));

vi.mock("@/components/ui/FieldsForm", () => ({
  InputField: (props: InputFieldMockProps) => {
    inputFieldSpy(props);
    return <div data-testid={props["data-testid"] ?? `input-${props.name}`}>{props.label}</div>;
  },
  SelectField: (props: SelectFieldMockProps) => {
    selectFieldSpy(props);
    return (
      <div>
        <div data-testid={props["data-testid"] ?? `select-${props.name}`}>{props.label}</div>
        {props.options.map((option) => (
          <span key={option.value} data-testid={`select-item-${props.name}-${option.value}`}>
            {option.label}
          </span>
        ))}
      </div>
    );
  },
  MultiSelectField: (props: SelectFieldMockProps) => {
    multiSelectFieldSpy(props);
    return (
      <div>
        <div data-testid={`multi-${props.name}`}>{props.label}</div>
        {props.options.map((option) => (
          <span key={option.value} data-testid={`multi-item-${props.name}-${option.value}`}>
            {option.label}
          </span>
        ))}
      </div>
    );
  },
}));

vi.mock("../../Designacao/FiltroDeAtosAdministrativos/FiltroDeAtosAdministrativos", () => ({
  AtosOpcoes: [
    { codigo: "PORTARIA", nome: "Portaria" },
    { codigo: "DESPACHO", nome: "Despacho" },
  ],
  TipoAtoSelectField: (props: TipoAtoSelectFieldMockProps) => {
    tipoAtoSelectFieldSpy(props);
    return <div data-testid={`tipo-ato-${props.name}`}>{props.label}</div>;
  },
}));

vi.mock("@/components/ui/form", () => ({
  FormField: ({ render }: { render: (args: FormFieldRenderArgs) => ReactNode }) =>
    render({
      field: {
        value: "observacao atual",
        onChange: fieldOnChangeMock,
      },
    }),
  FormControl: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: ReactNode }) => <label>{children}</label>,
  FormItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormMessage: () => <span data-testid="form-message" />,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: TextareaMockProps) => (
    <textarea
      data-testid={props["data-testid"]}
      placeholder={props.placeholder}
      value={props.value}
      rows={props.rows}
      onChange={(event) => props.onChange?.({ target: { value: event.target.value } })}
    />
  ),
}));

const variaveisOpcoes: Variavel[] = [
  { value: "PORTARIA", display_name: "Portaria" },
  { value: "NUMERO_SEI", display_name: "Nº SEI" },
  { value: "NOME_SERVIDOR", display_name: "Nome do servidor" },
  { value: "DESPACHO", display_name: "Despacho" },
];

describe("FormCriarTextosPortaria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exporta as listas de opções esperadas", () => {
    expect(StatusOpcoes).toEqual([
      { codigo: "ATIVO", nome: "Ativo" },
      { codigo: "INATIVO", nome: "Inativo" },
    ]);
    expect(TipoCargoOpcoes).toEqual([
      { codigo: "CARGO_VAGO", nome: "Cargo vago" },
      { codigo: "CARGO_DISPONIVEL", nome: "Cargo disponível" },
    ]);
  });

  it("renderiza campos, tooltips e opções mapeadas", () => {
    render(<FormCriarTextosPortaria variaveisOpcoes={variaveisOpcoes} />);

    expect(screen.getByTestId("tipo-ato-tipo_portaria")).toHaveTextContent("Tipo de portaria");
    expect(tipoAtoSelectFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "tipo_portaria",
        AtosOpcoes: [
          { codigo: "PORTARIA", nome: "Portaria" },
          { codigo: "DESPACHO", nome: "Despacho" },
        ],
      }),
    );
    expect(inputFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "nome_modelo",
        placeholder: "Digite o nome do modelo...",
        type: "text",
      }),
    );
    expect(selectFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "status",
        options: [
          { value: "ATIVO", label: "Ativo" },
          { value: "INATIVO", label: "Inativo" },
        ],
      }),
    );
    expect(selectFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "tipo_cargo",
        options: [
          { value: "CARGO_VAGO", label: "Cargo vago" },
          { value: "CARGO_DISPONIVEL", label: "Cargo disponível" },
        ],
      }),
    );
    expect(multiSelectFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "variaveis",
        placeholder: "Selecione",
        options: [
          { value: "PORTARIA", label: "Portaria" },
          { value: "NUMERO_SEI", label: "Nº SEI" },
          { value: "NOME_SERVIDOR", label: "Nome do servidor" },
          { value: "DESPACHO", label: "Despacho" },
        ],
      }),
    );

    expect(screen.getByTestId("select-item-status-ATIVO")).toHaveTextContent("Ativo");
    expect(screen.getByTestId("select-item-tipo_cargo-CARGO_VAGO")).toHaveTextContent("Cargo vago");
    expect(screen.getByTestId("multi-item-variaveis-NUMERO_SEI")).toHaveTextContent("Nº SEI");
    expect(screen.getAllByTestId("tooltip")).toHaveLength(2);
    expect(screen.getAllByTestId("tooltip")[0]).toHaveAttribute(
      "data-title",
      "Modelos inativos não aparecem na emissão de novas Portarias.",
    );
    expect(screen.getAllByTestId("tooltip")[1]).toHaveAttribute(
      "data-title",
      "Utilize as variáveis para incluir informações que serão preenchidas automaticamente pelo sistema na geração da Portaria.",
    );
    expect(screen.getByTestId("input-observacoes")).toHaveValue("observacao atual");
    expect(screen.getByTestId("form-message")).toBeInTheDocument();
  });

  it("não renderiza opções de variáveis quando a lista está vazia", () => {
    render(<FormCriarTextosPortaria variaveisOpcoes={[]} />);

    expect(multiSelectFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "variaveis",
        options: [],
      }),
    );
    expect(screen.queryByTestId("multi-item-variaveis-PORTARIA")).not.toBeInTheDocument();
  });

  it("repassa alteração do textarea de observações", () => {
    render(<FormCriarTextosPortaria variaveisOpcoes={variaveisOpcoes} />);

    fireEvent.change(screen.getByTestId("input-observacoes"), { target: { value: "nova obs" } });
    expect(fieldOnChangeMock).toHaveBeenCalledWith("nova obs");
  });
});
