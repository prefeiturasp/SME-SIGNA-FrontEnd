import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormProvider, useForm, type FieldValues } from "react-hook-form";
import type { ReactNode } from "react";
import TextoPraApostila from "./TextoPraApostila";

vi.mock("antd/es/form/FormItem", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

function renderComFormulario(
  options: {
    disableFields?: boolean;
    className?: string;
    defaultTexto?: string;
  } = {},
) {
  const disableFields = options.disableFields ?? false;
  const defaultTexto = options.defaultTexto ?? "";

  function TestComponent() {
    const form = useForm<FieldValues>({
      defaultValues: {
        texto_para_apostila: defaultTexto,
      },
    });

    return (
      <FormProvider {...form}>
        <form>
          <TextoPraApostila
            disableFields={disableFields}
            className={options.className}
            form={form}
          />
        </form>
      </FormProvider>
    );
  }

  return render(<TestComponent />);
}

describe("TextoPraApostila", () => {
  it("renderiza o campo e o rótulo do apostilamento", () => {
    renderComFormulario();

    expect(
      screen.getByText(
        "Insira as informações que devem ser levadas em consideração no apostilamento da designação.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("input-texto-para-apostila")).toBeInTheDocument();
    expect(screen.getByTestId("input-texto-para-apostila")).toBeEnabled();
  });

  it("atualiza o texto no formulário", async () => {
    renderComFormulario({ defaultTexto: "Texto inicial" });

    const campo = screen.getByTestId("input-texto-para-apostila");
    expect(campo).toHaveValue("Texto inicial");

    fireEvent.change(campo, { target: { value: "Texto da apostila" } });

    await waitFor(() => {
      expect(campo).toHaveValue("Texto da apostila");
    });
  });

  it("desabilita o campo quando disableFields é true", () => {
    renderComFormulario({ disableFields: true, defaultTexto: "Somente leitura" });

    expect(screen.getByTestId("input-texto-para-apostila")).toBeDisabled();
    expect(screen.getByTestId("input-texto-para-apostila")).toHaveValue("Somente leitura");
  });

  it("aplica className extra no container", () => {
    const { container } = renderComFormulario({ className: "mt-8" });

    expect(container.querySelector(".w-full.mt-8")).toBeInTheDocument();
  });

  it("usa className vazio por padrão", () => {
    const { container } = renderComFormulario();

    expect(container.querySelector(".w-full")).toBeInTheDocument();
    expect(container.querySelector(".mt-8")).not.toBeInTheDocument();
  });
});
