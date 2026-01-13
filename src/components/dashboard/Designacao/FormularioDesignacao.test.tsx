import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import FormDesignacao from "./FormularioDesignacao";

const submitValues = {
  nome_da_unidade: "123",
  estrutura_hierarquica: "",
  turmas: "",
  funcionarios_da_unidade: "",
  assistente_de_diretor_escolar: "",
  secretario_da_escola: "",
  funcao_atividade: "",
  cargo_sobreposto: "",
  modulos: "",
};

const handleSubmitMock = vi.fn((fn: any) => () => fn(submitValues));

const useFormMock = vi.fn(() => ({
  control: {},
  handleSubmit: handleSubmitMock,
  register: vi.fn(),
  formState: { errors: {} },
}));

vi.mock("react-hook-form", () => ({
  useForm: (...args: any[]) => useFormMock(...args),
}));

vi.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => (
    <div data-testid="form-wrapper">
      {children}
    </div>
  ),
  FormField: ({ name, render }: any) => (
    <div data-testid={`form-field-${name}`}>
      {render({
        field: {
          name,
          value: "",
          onChange: vi.fn(),
          onBlur: vi.fn(),
          ref: vi.fn(),
        },
      })}
    </div>
  ),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormMessage: () => <span data-testid="form-message" />,
}));

vi.mock("@/components/ui/input-base", () => ({
  InputBase: (props: any) => <input data-testid={props.id} {...props} />,
}));

describe("FormDesignacao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configura useForm com resolver e defaultValues", () => {
    render(<FormDesignacao onSubmitDesignacao={vi.fn()} />);

    expect(useFormMock).toHaveBeenCalledTimes(1);
    const config = useFormMock.mock.calls[0][0];

    expect(config.resolver).toEqual(expect.any(Function));
    expect(config.mode).toBe("onChange");
    expect(config.defaultValues).toMatchObject({
      nome_da_unidade: "",
      estrutura_hierarquica: "",
    });
  });

  it("renderiza todos os campos principais", () => {
    render(<FormDesignacao onSubmitDesignacao={vi.fn()} />);

    expect(screen.getByText("Nome da unidade")).toBeInTheDocument();
    expect(screen.getByText("Estrutura hierárquica")).toBeInTheDocument();
    expect(screen.getByText("Turmas")).toBeInTheDocument();
    expect(screen.getByText("Funcionários da unidade")).toBeInTheDocument();
    expect(screen.getByText("Assistente de diretor escolar")).toBeInTheDocument();
    expect(screen.getByText("Secretário da escola")).toBeInTheDocument();
    expect(screen.getByText("Função atividade")).toBeInTheDocument();
    expect(screen.getByText("Cargo sobreposto")).toBeInTheDocument();
    expect(screen.getByText("Módulos")).toBeInTheDocument();
  });

  it("submete o formulário chamando o handler com os valores mockados", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(<FormDesignacao onSubmitDesignacao={vi.fn()} />);

    const form = document.querySelector("form");
    expect(form).toBeTruthy();

    if (form) {
      fireEvent.submit(form);
    }

    expect(handleSubmitMock).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith("Dados da designação", submitValues);

    consoleSpy.mockRestore();
  });
});

