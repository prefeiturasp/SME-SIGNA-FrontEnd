import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ControllerRenderProps } from "react-hook-form";
import FormularioUEDesignacao from "./FormularioUEDesignacao";
import formSchemaDesignacao, { type FormDesignacaoData } from "./schema";

const {
  useFetchDREsMock,
  useFetchUEsMock,
  useFormMock,
  setValueMock,
  handleSubmitMock,
  zodResolverMock,
} = vi.hoisted(() => ({
  useFetchDREsMock: vi.fn(),
  useFetchUEsMock: vi.fn(),
  useFormMock: vi.fn(),
  setValueMock: vi.fn(),
  handleSubmitMock: vi.fn(),
  zodResolverMock: vi.fn(() => "resolver-mock"),
}));

let currentDre = "";
let currentUe = "";
let selectOnValueChange: ((value: string) => void) | null = null;

vi.mock("@/hooks/useUnidades", () => ({
  useFetchDREs: () => useFetchDREsMock(),
  useFetchUEs: (dre: string) => useFetchUEsMock(dre),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: zodResolverMock,
}));

vi.mock("react-hook-form", () => ({
  useForm: useFormMock,
}));

vi.mock("@/components/ui/form", () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div data-testid="form">{children}</div>,
  FormField: ({
    name,
    render,
  }: {
    name: keyof FormDesignacaoData;
    render: (props: {
      field: ControllerRenderProps<FormDesignacaoData, keyof FormDesignacaoData>;
    }) => React.ReactNode;
  }) => {
    const field = {
      name,
      value: name === "dre" ? currentDre : currentUe,
      onChange: (value: string) => {
        if (name === "dre") currentDre = value;
        if (name === "ue") currentUe = value;
      },
      onBlur: vi.fn(),
      ref: vi.fn(),
    } as unknown as ControllerRenderProps<FormDesignacaoData, keyof FormDesignacaoData>;

    return <>{render({ field })}</>;
  },
  FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
  FormMessage: () => <div data-testid="form-message" />,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    onValueChange,
    "data-testid": testId,
  }: {
    children: React.ReactNode;
    onValueChange: (value: string) => void;
    "data-testid"?: string;
  }) => {
    selectOnValueChange = onValueChange;
    return <div data-testid={testId}>{children}</div>;
  },
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder: string }) => <div>{placeholder}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button type="button" onClick={() => selectOnValueChange?.(value)}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/Combobox", () => ({
  Combobox: ({
    options,
    disabled,
    "data-testid": testId,
  }: {
    options: Array<{ label: string; value: string }>;
    disabled?: boolean;
    "data-testid"?: string;
  }) => (
    <input
      data-testid={testId}
      data-options={JSON.stringify(options)}
      disabled={disabled}
      readOnly
    />
  ),
}));

vi.mock("@/components/dashboard/Designacao/BotoesDeNavegacao", () => ({
  default: ({
    disableAnterior,
    disableProximo,
  }: {
    disableAnterior: boolean;
    disableProximo: boolean;
  }) => (
    <div data-testid="botoes-navegacao">
      <button data-testid="btn-anterior" disabled={disableAnterior}>
        Anterior
      </button>
      <button data-testid="btn-proximo" disabled={disableProximo}>
        Próximo
      </button>
    </div>
  ),
}));

describe("FormularioUEDesignacao", () => {
  const onSubmitDesignacaoMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    currentDre = "";
    currentUe = "";
    selectOnValueChange = null;

    useFetchDREsMock.mockReturnValue({
      data: [
        { codigoDRE: "dre-1", nomeDRE: "DRE 1", siglaDRE: "DRE1" },
        { codigoDRE: "dre-2", nomeDRE: "DRE 2", siglaDRE: "DRE2" },
      ],
    });

    useFetchUEsMock.mockReturnValue({
      data: [
        { codigoEscola: "ue-1", nomeEscola: "UE 1", siglaTipoEscola: "EMEI" },
        { codigoEscola: "ue-2", nomeEscola: "UE 2", siglaTipoEscola: "EMEF" },
      ],
    });

    handleSubmitMock.mockImplementation(
      (callback: (values: { dre: string; ue: string }) => void) => (event?: Event) => {
        event?.preventDefault?.();
        callback({ dre: currentDre, ue: currentUe });
      },
    );

    useFormMock.mockImplementation(() => ({
      control: {},
      watch: () => ({ dre: currentDre, ue: currentUe }),
      setValue: setValueMock,
      handleSubmit: handleSubmitMock,
    }));
  });

  it("configura useForm com resolver e valores padrão", () => {
    render(<FormularioUEDesignacao onSubmitDesignacao={onSubmitDesignacaoMock} />);

    expect(zodResolverMock).toHaveBeenCalledWith(formSchemaDesignacao);
    expect(useFormMock).toHaveBeenCalledWith(
      expect.objectContaining({
        resolver: "resolver-mock",
        defaultValues: { dre: "", ue: "" },
        mode: "onChange",
      }),
    );
  });

  it("renderiza campos e botões de navegação desabilitados", () => {
    render(<FormularioUEDesignacao onSubmitDesignacao={onSubmitDesignacaoMock} />);

    expect(screen.getByTestId("form")).toBeInTheDocument();
    expect(screen.getByTestId("select-dre")).toBeInTheDocument();
    expect(screen.getByTestId("select-ue")).toBeInTheDocument();
    expect(screen.getByTestId("btn-anterior")).toBeDisabled();
    expect(screen.getByTestId("btn-proximo")).toBeDisabled();
  });

  it("chama useFetchUEs com DRE atual e mantém combobox desabilitado sem DRE", () => {
    render(<FormularioUEDesignacao onSubmitDesignacao={onSubmitDesignacaoMock} />);

    expect(useFetchUEsMock).toHaveBeenCalledWith("");
    expect(screen.getByTestId("select-ue")).toBeDisabled();
  });

  it("limpa campo UE ao trocar DRE e habilita combobox após rerender", () => {
    const { rerender } = render(<FormularioUEDesignacao onSubmitDesignacao={onSubmitDesignacaoMock} />);

    fireEvent.click(screen.getByText("DRE 1"));
    expect(setValueMock).toHaveBeenCalledWith("ue", "");

    rerender(<FormularioUEDesignacao onSubmitDesignacao={onSubmitDesignacaoMock} />);
    expect(useFetchUEsMock).toHaveBeenLastCalledWith("dre-1");
    expect(screen.getByTestId("select-ue")).not.toBeDisabled();
  });

  it("mapeia opções de UE com sigla + nome", () => {
    const { rerender } = render(<FormularioUEDesignacao onSubmitDesignacao={onSubmitDesignacaoMock} />);
    fireEvent.click(screen.getByText("DRE 1"));
    rerender(<FormularioUEDesignacao onSubmitDesignacao={onSubmitDesignacaoMock} />);

    const options = JSON.parse(screen.getByTestId("select-ue").getAttribute("data-options") ?? "[]");
    expect(options).toEqual([
      { label: "EMEI - UE 1", value: "ue-1" },
      { label: "EMEF - UE 2", value: "ue-2" },
    ]);
  });

  it("submete formulário usando handleSubmit do react-hook-form", () => {
    currentDre = "dre-1";
    currentUe = "ue-1";
    render(<FormularioUEDesignacao onSubmitDesignacao={onSubmitDesignacaoMock} />);

    fireEvent.submit(screen.getByTestId("form").querySelector("form") as HTMLFormElement);
    expect(handleSubmitMock).toHaveBeenCalledWith(onSubmitDesignacaoMock);
    expect(onSubmitDesignacaoMock).toHaveBeenCalledWith({ dre: "dre-1", ue: "ue-1" });
  });
});