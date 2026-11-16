import { zodResolver } from "@hookform/resolvers/zod";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import FormCargosBasePrincipal from "./FormCargosBasePrincipal";
import createFormSchemaCargosBase, {
  createFormSchemaCargosBaseData,
  editFormSchemaCargosBase,
} from "./createFormSchemaCargosBase";

vi.mock("@/components/ui/Combobox", () => ({
  Combobox: ({ onChange }: { onChange: (value: string) => void }) => (
    <button type="button" data-testid="select-codigo-cargo-eol" onClick={() => onChange("1")}>
      selecionar
    </button>
  ),
}));

const valoresBase: createFormSchemaCargosBaseData = {
  codigo_cargo: "",
  grupamento: "DOCENTES",
  descricao_resumida: "Professor",
  descricao_completa: "",
  descricao_eol: "",
  provimento: "",
  situacao_funcional: "EFETIVO",
  status: "ATIVO",
  utilizado_para_funcoes: false,
  utilizado_para_designacoes: false,
  utilizado_para_ste: false,
  utilizado_para_permutas: false,
  cargo_base_ficticio: false,
  testar_laudo: false,
  pesquisar_licencas_no_sigpec: false,
  quantidade_maxima_de_dias_de_licenca: "0",
  permite_substituicao: false,
  possui_periodo_fechado: false,
  data_fim_periodo: null,
};

function Formulario({
  isEditing,
  valores,
  onSubmit,
}: Readonly<{
  isEditing: boolean;
  valores: Partial<createFormSchemaCargosBaseData>;
  onSubmit: (values: createFormSchemaCargosBaseData) => void;
}>) {
  const form = useForm<createFormSchemaCargosBaseData>({
    resolver: zodResolver(
      (isEditing ? editFormSchemaCargosBase : createFormSchemaCargosBase) as typeof createFormSchemaCargosBase,
    ),
    defaultValues: { ...valoresBase, ...valores },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values))}>
        <FormCargosBasePrincipal
          CargosBaseOpcoes={[{ codigoCargo: 1, nomeCargo: "PROFESSOR" }]}
          isEditing={isEditing}
          isLoading={false}
        />
        <button type="submit">enviar</button>
      </form>
    </FormProvider>
  );
}

describe("FormCargosBasePrincipal com formulário real", () => {
  it("no cadastro, envia descricao_eol e provimento preenchidos pela tela", async () => {
    const onSubmit = vi.fn();
    render(<Formulario isEditing={false} valores={{}} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByTestId("select-codigo-cargo-eol"));

    await waitFor(() => expect(screen.getByTestId("input-descricao_eol")).toHaveValue("PROFESSOR"));
    expect(screen.getByTestId("input-descricao_completa")).toHaveValue("PROFESSOR");

    fireEvent.change(screen.getByTestId("input-provimento"), {
      target: { value: "portando diploma de Pedagogia" },
    });
    fireEvent.click(screen.getByRole("button", { name: "enviar" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      codigo_cargo: "1",
      descricao_completa: "PROFESSOR",
      descricao_eol: "PROFESSOR",
      provimento: "portando diploma de Pedagogia",
    });
  });

  it("no cadastro, mostra os erros das descrições e os limpa ao selecionar o cargo", async () => {
    const onSubmit = vi.fn();
    render(<Formulario isEditing={false} valores={{}} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "enviar" }));

    expect(await screen.findAllByText("Campo obrigatório.")).toHaveLength(3);
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("select-codigo-cargo-eol"));

    await waitFor(() => expect(screen.queryByText("Campo obrigatório.")).not.toBeInTheDocument());
  });

  it.each([false, true])("permite alterar a descrição completa (isEditing=%s)", async (isEditing) => {
    const onSubmit = vi.fn();
    render(
      <Formulario
        isEditing={isEditing}
        valores={{ codigo_cargo: "1", descricao_completa: "PROFESSOR", descricao_eol: "PROFESSOR" }}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByTestId("input-descricao_completa"), {
      target: { value: "Professor de Educação Básica" },
    });
    fireEvent.click(screen.getByRole("button", { name: "enviar" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      descricao_completa: "Professor de Educação Básica",
      descricao_eol: "PROFESSOR",
    });
  });

  it("mostra o erro quando o nome do cargo passa de 255 caracteres", async () => {
    render(
      <Formulario
        isEditing={false}
        valores={{ codigo_cargo: "1", descricao_completa: "PROFESSOR", descricao_eol: "a".repeat(256) }}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "enviar" }));

    expect(
      await screen.findByText("A descrição do EOL deve ter no máximo 255 caracteres."),
    ).toBeInTheDocument();
  });

  it("na edição, carrega o provimento salvo e salva mesmo com descricao_eol vazia", async () => {
    const onSubmit = vi.fn();
    render(
      <Formulario
        isEditing={true}
        valores={{
          codigo_cargo: "1",
          descricao_completa: "PROFESSOR",
          descricao_eol: "",
          provimento: "experiência de 3 anos",
        }}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByTestId("input-provimento")).toHaveValue("experiência de 3 anos");
    expect(screen.getByTestId("input-descricao_completa")).toHaveValue("PROFESSOR");
    expect(screen.getByTestId("input-descricao_eol")).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "enviar" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });
});
