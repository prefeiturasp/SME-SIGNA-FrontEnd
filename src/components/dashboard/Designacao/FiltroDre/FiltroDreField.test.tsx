import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FiltroDreField from "./FiltroDreField";

const { useFetchDREsMock, fieldOnChangeMock, formFieldState } = vi.hoisted(() => ({
  useFetchDREsMock: vi.fn(),
  fieldOnChangeMock: vi.fn(),
  formFieldState: { name: "", value: "" as string | null },
}));

vi.mock("@/hooks/useUnidades", () => ({
  useFetchDREs: useFetchDREsMock,
}));

vi.mock("react-hook-form", () => ({
  useFormContext: () => ({ control: {} }),
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader" />,
}));

vi.mock("@/components/ui/form", () => ({
  FormField: ({
    name,
    render,
  }: {
    name: string;
    render: (args: { field: { value: string | null; onChange: (value: string) => void } }) => ReactNode;
  }) => {
    formFieldState.name = name;
    return <div>{render({ field: { value: formFieldState.value, onChange: fieldOnChangeMock } })}</div>;
  },
  FormItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: ReactNode }) => <label>{children}</label>,
  FormControl: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormMessage: () => null,
}));

vi.mock("@/components/ui/Combobox", () => ({
  Combobox: ({
    value,
    placeholder,
    options,
    onChange,
    "data-testid": dataTestId,
  }: {
    value: string;
    placeholder?: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    "data-testid"?: string;
  }) => (
    <div data-testid={dataTestId} data-value={value}>
      {placeholder}
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          data-testid={`combobox-item-${option.value}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
}));

describe("FiltroDreField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    formFieldState.value = "";
    useFetchDREsMock.mockReturnValue({
      data: [{ codigoDRE: "108600", nomeDRE: "DRE FREGUESIA/BRASILANDIA", siglaDRE: "FB" }],
      isLoading: false,
    });
  });

  it("lista as DREs com sigla e nome usando o código EOL como valor", () => {
    render(<FiltroDreField />);

    expect(formFieldState.name).toBe("codigo_dre");
    expect(screen.getByText("Diretoria Regional de Educação (DRE)")).toBeInTheDocument();
    expect(screen.getByTestId("select-codigo-dre")).toHaveTextContent("Selecione");
    expect(screen.getByTestId("combobox-item-108600")).toHaveTextContent("FB - DRE FREGUESIA/BRASILANDIA");
  });

  it("aceita nome do campo e label customizados", () => {
    render(<FiltroDreField name="dre" label="DRE" />);

    expect(formFieldState.name).toBe("dre");
    expect(screen.getByText("DRE")).toBeInTheDocument();
  });

  it("atualiza o campo e chama o onChange extra ao selecionar", () => {
    const onChange = vi.fn();
    render(<FiltroDreField onChange={onChange} />);

    fireEvent.click(screen.getByTestId("combobox-item-108600"));

    expect(fieldOnChangeMock).toHaveBeenCalledWith("108600");
    expect(onChange).toHaveBeenCalledWith("108600");
  });

  it("funciona sem onChange extra", () => {
    render(<FiltroDreField />);

    expect(() => fireEvent.click(screen.getByTestId("combobox-item-108600"))).not.toThrow();
    expect(fieldOnChangeMock).toHaveBeenCalledWith("108600");
  });

  it("usa string vazia como valor quando o campo é nulo", () => {
    formFieldState.value = null;
    render(<FiltroDreField />);

    expect(screen.getByTestId("select-codigo-dre")).toHaveAttribute("data-value", "");
  });

  it("exibe loader enquanto carrega as DREs", () => {
    useFetchDREsMock.mockReturnValue({ data: undefined, isLoading: true });
    render(<FiltroDreField />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("select-codigo-dre")).not.toBeInTheDocument();
  });

  it("renderiza sem opções quando a busca não retorna dados", () => {
    useFetchDREsMock.mockReturnValue({ data: undefined, isLoading: false });
    render(<FiltroDreField />);

    expect(screen.queryAllByTestId(/combobox-item-/)).toHaveLength(0);
  });
});
