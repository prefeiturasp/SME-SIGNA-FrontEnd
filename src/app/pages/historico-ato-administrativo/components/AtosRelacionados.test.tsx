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
  esta_vigente: true,
};
const atoVazio = {
  id: 99,
  data: "",
  portaria: "",
  titulo: "",
  descricao: "",
  principal: false,
  esta_vigente: true,
};

describe("AtosRelacionados", () => {
  it("exibe carregamento sem contagem ou registros enquanto busca os atos", () => {
    render(<AtosRelacionados atos={[ato]} isLoading />);

    expect(screen.getByRole("heading", { name: "Atos relacionados" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Carregando atos relacionados…");
    expect(screen.getByRole("status").closest("section")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText(/\d+ registros?/)).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByText("Nenhum ato relacionado encontrado.")).not.toBeInTheDocument();
  });

  it("informa quando não há atos relacionados", () => {
    render(<AtosRelacionados atos={[]} isLoading={false} />);

    expect(screen.getByText("Nenhum ato relacionado encontrado.")).toBeInTheDocument();
    expect(screen.getByText("0 registros")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renderiza os dados e o link acessível de cada ato na ordem recebida", () => {
    render(<AtosRelacionados atos={[ato, { ...ato, id: 43, titulo: "Cessação", principal: false }]} isLoading={false} />);

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

  it("inclui todos os registros recebidos na lista e na contagem", () => {
      render(<AtosRelacionados atos={[atoVazio, { ...atoVazio, id: 100, data: " ", titulo: "\t", descricao: "\n", portaria: " " }, ato]} isLoading={false} />);

    expect(screen.getByText("3 registros")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "Apostila" })).toBeInTheDocument();
  });

  it("renderiza o registro mesmo quando seus campos estão vazios", () => {
    render(<AtosRelacionados atos={[atoVazio]} isLoading={false} />);
    expect(screen.queryByText("Nenhum ato relacionado encontrado.")).not.toBeInTheDocument();
    expect(screen.getByText("1 registro")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ato administrativo" })).toBeInTheDocument();
  });

  it.each(["data", "portaria", "titulo", "descricao"] as const)("mantém um ato quando apenas %s está preenchido", (campo) => {
    render(<AtosRelacionados atos={[{ ...atoVazio, [campo]: ato[campo] }]} isLoading={false} />);
    expect(screen.getByText("1 registro")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText(ato[campo])).toBeInTheDocument();
  });

  it("usa título padrão e omite metadados e descrição em branco", () => {
    render(<AtosRelacionados atos={[{ ...atoVazio, data: ato.data, portaria: " ", titulo: " ", descricao: " " }]} isLoading={false} />);
    expect(screen.getByRole("heading", { name: "Ato administrativo" })).toBeInTheDocument();
    expect(screen.queryByText("Portaria")).not.toBeInTheDocument();
    expect(screen.getByRole("article").querySelector("p")).not.toBeInTheDocument();
  });

  it("usa nome acessível padrão no link quando o ato não possui título nem portaria", () => {
    render(<AtosRelacionados atos={[{ ...atoVazio, descricao: "Observação" }]} isLoading={false} />);
    expect(screen.getByRole("link", { name: "Ver detalhes de ato administrativo" })).toHaveAttribute("href", "/pages/listagem-designacoes/visualizar-designacao/99");
    expect(screen.getByText("Data do ato")).toBeInTheDocument();
  });

  it("risca o título do ato que não está mais vigente", () => {
    render(
      <AtosRelacionados
        atos={[
          { ...ato, id: 1, titulo: "Cessada", esta_vigente: false },
          { ...ato, id: 2, titulo: "Vigente", esta_vigente: true },
        ]}
        isLoading={false}
      />,
    );

    expect(screen.getByRole("heading", { name: "Cessada" })).toHaveClass("line-through");
    expect(screen.getByRole("heading", { name: "Vigente" })).not.toHaveClass("line-through");
  });

  it("marca como principal apenas o item sinalizado pela API", () => {
    render(<AtosRelacionados atos={[ato, { ...ato, id: 43, principal: false }]} isLoading={false} />);

    const itens = screen.getAllByRole("listitem");
    expect(itens[0]).toHaveAttribute("data-principal", "true");
    expect(itens[1]).toHaveAttribute("data-principal", "false");
  });

  it("substitui o carregamento pelos registros ao concluir a busca", () => {
    const { rerender } = render(<AtosRelacionados atos={[]} isLoading />);
    rerender(<AtosRelacionados atos={[ato]} isLoading={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("1 registro")).toBeInTheDocument();
    expect(screen.getByRole("list").closest("section")).toHaveAttribute("aria-busy", "false");
  });
});
