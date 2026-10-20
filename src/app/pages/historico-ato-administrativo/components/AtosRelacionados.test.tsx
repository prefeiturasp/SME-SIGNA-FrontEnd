import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AtosRelacionados from "./AtosRelacionados";

const ato = {
  id: 42,
  data: "03/04/2026",
  portaria: "123/2026",
  titulo: "Apostila",
  descricao: "Alteração de período informado na portaria.",
  principal: true,
};
const atoVazio = { id: 99, data: "", portaria: "", titulo: "", descricao: "", principal: false };

describe("AtosRelacionados", () => {
  it("exibe carregamento sem contagem ou registros enquanto busca os atos", () => {
    render(<AtosRelacionados atos={[ato]} isEditing={false} isLoading />);

    expect(screen.getByRole("heading", { name: "Atos relacionados" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Carregando atos relacionados…");
    expect(screen.getByRole("status").closest("section")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText(/\d+ registros?/)).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByText("Nenhum ato relacionado encontrado.")).not.toBeInTheDocument();
  });

  it("informa quando não há atos relacionados", () => {
    render(<AtosRelacionados atos={[]} isEditing={false} isLoading={false} />);

    expect(screen.getByText("Nenhum ato relacionado encontrado.")).toBeInTheDocument();
    expect(screen.getByText("0 registros")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renderiza os dados e o link acessível de cada ato na ordem recebida", () => {
    render(<AtosRelacionados atos={[ato, { ...ato, id: 43, titulo: "Cessação", principal: false }]} isEditing={false} isLoading={false} />);

    expect(screen.getByText("2 registros")).toBeInTheDocument();
    const itens = screen.getAllByRole("listitem");
    expect(itens).toHaveLength(2);
    expect(itens[0]).toHaveAttribute("data-principal", "true");
    expect(itens[1]).toHaveAttribute("data-principal", "false");
    ["Data do ato", ato.data, "Portaria", ato.portaria, ato.descricao].forEach((texto) => {
      expect(within(itens[0]).getByText(texto)).toBeInTheDocument();
    });
    expect(within(itens[0]).getByRole("heading", { name: "Apostila" })).toBeInTheDocument();
    expect(within(itens[1]).getByRole("heading", { name: "Cessação" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver detalhes de Apostila, portaria 123/2026" })).toHaveAttribute("href", "/pages/listagem-designacoes/visualizar-designacao/42");
    expect(screen.getByRole("link", { name: "Ver detalhes de Cessação, portaria 123/2026" })).toHaveAttribute("href", "/pages/listagem-designacoes/visualizar-designacao/43");
  });

  it("exclui registros vazios ou com apenas espaços da lista e da contagem", () => {
    render(<AtosRelacionados atos={[atoVazio, { ...atoVazio, id: 100, data: " ", titulo: "\t", descricao: "\n", portaria: " " }, ato]} isEditing={false} isLoading={false} />);

    expect(screen.getByText("1 registro")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Apostila" })).toBeInTheDocument();
  });

  it("exibe estado vazio quando todos os registros estão vazios", () => {
    render(<AtosRelacionados atos={[atoVazio]} isEditing={false} isLoading={false} />);
    expect(screen.getByText("Nenhum ato relacionado encontrado.")).toBeInTheDocument();
    expect(screen.getByText("0 registros")).toBeInTheDocument();
  });

  it.each(["data", "portaria", "titulo", "descricao"] as const)("mantém um ato quando apenas %s está preenchido", (campo) => {
    render(<AtosRelacionados atos={[{ ...atoVazio, [campo]: ato[campo] }]} isEditing={false} isLoading={false} />);
    expect(screen.getByText("1 registro")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText(ato[campo])).toBeInTheDocument();
  });

  it("usa título padrão e omite metadados e descrição em branco", () => {
    render(<AtosRelacionados atos={[{ ...atoVazio, data: ato.data, portaria: " ", titulo: " ", descricao: " " }]} isEditing={false} isLoading={false} />);
    expect(screen.getByRole("heading", { name: "Ato administrativo" })).toBeInTheDocument();
    expect(screen.queryByText("Portaria")).not.toBeInTheDocument();
    expect(screen.getByRole("article").querySelector("p")).not.toBeInTheDocument();
  });

  it("usa nome acessível padrão no link quando o ato não possui título nem portaria", () => {
    render(<AtosRelacionados atos={[{ ...atoVazio, descricao: "Observação" }]} isEditing isLoading={false} />);
    expect(screen.getByRole("link", { name: "Ver detalhes de ato administrativo" })).toHaveAttribute("href", "/pages/listagem-designacoes/visualizar-designacao/99");
    expect(screen.queryByText("Data do ato")).not.toBeInTheDocument();
  });

  it("substitui o carregamento pelos registros ao concluir a busca", () => {
    const { rerender } = render(<AtosRelacionados atos={[]} isEditing={false} isLoading />);
    rerender(<AtosRelacionados atos={[ato]} isEditing={false} isLoading={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("1 registro")).toBeInTheDocument();
    expect(screen.getByRole("list").closest("section")).toHaveAttribute("aria-busy", "false");
  });
});
