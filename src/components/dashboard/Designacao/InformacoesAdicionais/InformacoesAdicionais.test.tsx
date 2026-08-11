import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useForm, type FieldValues, type UseFormReturn } from "react-hook-form";
import type { ReactNode } from "react";
import InformacoesAdicionais from "./InformacoesAdicionais";

vi.mock("antd/es/form/FormItem", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value?: string;
    onValueChange?: (value: string) => void;
    children: ReactNode;
  }) => (
    <div>
      <span data-testid="select-value">{value ?? ""}</span>
      <button type="button" data-testid="select-true" onClick={() => onValueChange?.("true")}>
        Contabilizar
      </button>
      <button type="button" data-testid="select-false" onClick={() => onValueChange?.("false")}>
        Não contabilizar
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

function renderComFormulario(options: {
  disableFields?: boolean;
  defaultDescricao?: string;
  defaultDetalhe?: boolean | undefined;
  onChangeDescricao?: (value: string) => void;
  onValueChangeDetalheParaQuadroDeHistoricoPorAno?: (value: string) => void;
} = {}) {
  const disableFields = options.disableFields ?? false;
  const defaultDescricao = options.defaultDescricao ?? "";
  const defaultDetalhe = Object.prototype.hasOwnProperty.call(options, "defaultDetalhe")
    ? options.defaultDetalhe
    : true;
  const onChangeDescricao = options.onChangeDescricao ?? vi.fn();
  const onValueChangeDetalheParaQuadroDeHistoricoPorAno =
    options.onValueChangeDetalheParaQuadroDeHistoricoPorAno ?? vi.fn();

  function TestComponent() {
    const form = useForm({
      defaultValues: {
        informacoes_adicionais: defaultDescricao,
        detalhe_para_quadro_de_historico_por_ano: defaultDetalhe,
      },
    });

    return (
      <InformacoesAdicionais
        disableFields={disableFields}
        form={form as unknown as UseFormReturn<FieldValues>}
        onChangeDescricao={onChangeDescricao}
        onValueChangeDetalheParaQuadroDeHistoricoPorAno={
          onValueChangeDetalheParaQuadroDeHistoricoPorAno
        }
      />
    );
  }

  return render(<TestComponent />);
}

describe("InformacoesAdicionais", () => {
  it("atualiza a descrição no formulário e chama callback", async () => {
    const onChangeDescricao = vi.fn();
    renderComFormulario({ onChangeDescricao });

    const campoDescricao = screen.getByTestId("input-descricao-pendencia");
    fireEvent.change(campoDescricao, { target: { value: "Texto complementar" } });

    await waitFor(() => {
      expect(onChangeDescricao).toHaveBeenCalledWith("Texto complementar");
      expect(campoDescricao).toHaveValue("Texto complementar");
    });
  });

  it("exibe estado de leitura com texto Contabilizar quando detalhe é true", () => {
    renderComFormulario({ disableFields: true, defaultDetalhe: true });

    expect(screen.getByTestId("input-descricao-pendencia")).toBeDisabled();
    expect(screen.getByText("Contabilizar")).toBeInTheDocument();
    expect(screen.queryByTestId("select-true")).not.toBeInTheDocument();
  });

  it("exibe estado de leitura com texto Não contabilizar quando detalhe é false", () => {
    renderComFormulario({ disableFields: true, defaultDetalhe: false });

    expect(screen.getByText("Não contabilizar")).toBeInTheDocument();
    expect(screen.queryByTestId("select-false")).not.toBeInTheDocument();
  });

  it("converte seleção para boolean e dispara callback com string", async () => {
    const onValueChangeDetalheParaQuadroDeHistoricoPorAno = vi.fn();
    renderComFormulario({
      defaultDetalhe: true,
      onValueChangeDetalheParaQuadroDeHistoricoPorAno,
    });

    expect(screen.getByTestId("select-value")).toHaveTextContent("true");

    fireEvent.click(screen.getByTestId("select-false"));
    fireEvent.click(screen.getByTestId("select-true"));

    await waitFor(() => {
      expect(onValueChangeDetalheParaQuadroDeHistoricoPorAno).toHaveBeenCalledWith("false");
      expect(onValueChangeDetalheParaQuadroDeHistoricoPorAno).toHaveBeenCalledWith("true");
      expect(screen.getByTestId("select-value")).toHaveTextContent("true");
    });
  });

  it("não passa valor para o select quando detalhe inicia indefinido", () => {
    renderComFormulario({ defaultDetalhe: undefined });

    expect(screen.getByTestId("select-value")).toBeEmptyDOMElement();
  });
});
