import React, { type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CamposPesquisaUnidade from "./CamposPesquisaUnidade";

type FormValues = {
  dre: string;
  dre_nome: string;
  ue: string;
  ue_nome: string;
  codigo_hierarquico: string;
};

const { useFetchDREsMock, useFetchUEsMock } = vi.hoisted(() => ({
  useFetchDREsMock: vi.fn(),
  useFetchUEsMock: vi.fn(),
}));

vi.mock("@/hooks/useUnidades", () => ({
  useFetchDREs: useFetchDREsMock,
  useFetchUEs: useFetchUEsMock,
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader" />,
}));

vi.mock("@/components/ui/FieldsForm", () => ({
  InputField: ({
    name,
    label,
    dataTestId,
  }: {
    name: string;
    label: ReactNode;
    dataTestId?: string;
  }) => (
    <label>
      {label}
      <input data-testid={dataTestId ?? name} name={name} />
    </label>
  ),
}));

vi.mock("@/components/ui/select", async () => {
  const React = await import("react");

  type SelectContextValue = {
    value?: string;
    onValueChange?: (value: string) => void;
  };

  const SelectContext = React.createContext<SelectContextValue>({});

  return {
    Select: ({
      value,
      onValueChange,
      children,
    }: {
      value?: string;
      onValueChange?: (value: string) => void;
      children: ReactNode;
    }) => (
      <SelectContext.Provider value={{ value, onValueChange }}>
        <div data-testid="select-root" data-value={value ?? ""}>
          {children}
        </div>
      </SelectContext.Provider>
    ),
    SelectTrigger: ({
      children,
      ...props
    }: {
      children: ReactNode;
      [key: string]: unknown;
    }) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
    SelectValue: ({ placeholder }: { placeholder?: string }) => {
      const { value } = React.useContext(SelectContext);
      return <span>{value || placeholder}</span>;
    },
    SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SelectItem: ({
      value,
      children,
    }: {
      value: string;
      children: ReactNode;
    }) => {
      const { onValueChange } = React.useContext(SelectContext);

      return (
        <button
          type="button"
          data-testid={`select-item-${value}`}
          onClick={() => onValueChange?.(value)}
        >
          {children}
        </button>
      );
    },
  };
});

vi.mock("@/components/ui/Combobox", () => ({
  Combobox: ({
    options,
    value,
    onChange,
    placeholder,
    disabled,
    "data-testid": dataTestId,
  }: {
    options: Array<{ label: string; value: string }>;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    "data-testid"?: string;
  }) => {
    const selected = options.find((option) => option.value === value);

    return (
      <div>
        <button type="button" data-testid={dataTestId} disabled={disabled}>
          {selected?.label ?? placeholder}
        </button>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            data-testid={`combobox-item-${option.value}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  },
}));

const dreOptions = [
  {
    codigoDRE: "108100",
    nomeDRE: "DIRETORIA REGIONAL DE EDUCACAO BUTANTA",
    siglaDRE: "DRE - BT",
  },
  {
    codigoDRE: "108200",
    nomeDRE: "DIRETORIA REGIONAL DE EDUCACAO CAMPO LIMPO",
    siglaDRE: "DRE - CL",
  },
];

const ueOptions = [
  {
    codigoEscola: "ue-1",
    nomeEscola: "Escola Um",
    siglaTipoEscola: "EMEI",
  },
  {
    codigoEscola: "ue-2",
    nomeEscola: "Escola Dois",
    siglaTipoEscola: "EMEF",
  },
];

const defaultValues: FormValues = {
  dre: "108100",
  dre_nome: "DIRETORIA REGIONAL DE EDUCACAO BUTANTA",
  ue: "",
  ue_nome: "",
  codigo_hierarquico: "",
};

function renderComponent(values: Partial<FormValues> = {}) {
  function FormWrapper() {
    const form = useForm<FormValues>({
      defaultValues: {
        ...defaultValues,
        ...values,
      },
    });
    const watchedValues = form.watch();

    return (
      <FormProvider {...form}>
        <CamposPesquisaUnidade />
        <output data-testid="form-values">{JSON.stringify(watchedValues)}</output>
      </FormProvider>
    );
  }

  return render(<FormWrapper />);
}

function getFormValues() {
  return JSON.parse(screen.getByTestId("form-values").textContent ?? "{}") as FormValues;
}

describe("CamposPesquisaUnidade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFetchDREsMock.mockReturnValue({
      data: dreOptions,
      isLoading: false,
    });
    useFetchUEsMock.mockReturnValue({
      data: ueOptions,
      isLoading: false,
    });
  });

  it("renderiza os campos com o valor de DRE vindo do formulário", () => {
    renderComponent();

    expect(screen.getByText("DRE")).toBeInTheDocument();
    expect(screen.getByText("Unidade proponente")).toBeInTheDocument();
    expect(screen.getByText("Código Estrutura Hierárquica")).toBeInTheDocument();
    expect(screen.getByTestId("select-root")).toHaveAttribute("data-value", "108100");
    expect(useFetchUEsMock).toHaveBeenCalledWith("108100");
  });

  it("exibe loading enquanto carrega as DREs", () => {
    useFetchDREsMock.mockReturnValue({
      data: [],
      isLoading: true,
    });

    renderComponent();

    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("select-dre")).not.toBeInTheDocument();
  });

  it("ao trocar a DRE, limpa UE/UE nome e atualiza o nome da DRE", async () => {
    const user = userEvent.setup();
    renderComponent({
      ue: "ue-1",
      ue_nome: "EMEI - Escola Um",
    });

    await user.click(screen.getByTestId("select-item-108200"));

    expect(getFormValues()).toEqual(
      expect.objectContaining({
        dre: "108200",
        dre_nome: "DIRETORIA REGIONAL DE EDUCACAO CAMPO LIMPO",
        ue: "",
        ue_nome: "",
      }),
    );
  });

  it("ao selecionar uma UE, atualiza UE e UE nome no formulário", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByTestId("combobox-item-ue-2"));

    expect(getFormValues()).toEqual(
      expect.objectContaining({
        ue: "ue-2",
        ue_nome: "EMEF - Escola Dois",
      }),
    );
  });

  it("mantém a UE desabilitada quando não há DRE selecionada", () => {
    renderComponent({ dre: "" });

    expect(screen.getByTestId("select-ue")).toBeDisabled();
    expect(useFetchUEsMock).toHaveBeenCalledWith("");
  });

  it("exibe loading enquanto carrega as UEs", () => {
    useFetchUEsMock.mockReturnValue({
      data: [],
      isLoading: true,
    });

    renderComponent();

    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("select-ue")).not.toBeInTheDocument();
  });
});
