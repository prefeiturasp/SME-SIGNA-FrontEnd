import React, { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EditorSEI, {
  adicionarNegrito,
  gerarHtmlPortaria,
  normalizarQuebras,
  type EditorSEIHandle,
} from "./EditorTextoSEI";

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
    "data-testid": testId,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
    "data-testid"?: string;
  }) => (
    <button type={type} disabled={disabled} onClick={onClick} data-testid={testId}>
      {children}
    </button>
  ),
}));

describe("EditorSEI utils", () => {
  it("normaliza quebras de linha de diferentes plataformas", () => {
    expect(normalizarQuebras("a\r\nb\rc")).toBe("a\nb\nc");
  });

  it("adiciona negrito apenas nos campos informados", () => {
    const dados = { nome: "Servidor", ano: 2026, texto: "Livre" };
    const resultado = adicionarNegrito(dados, ["nome", "ano"]);

    expect(resultado.nome).toBe("<strong>Servidor</strong>");
    expect(resultado.ano).toBe("<strong>2026</strong>");
    expect(resultado.texto).toBe("Livre");
  });

  it("não adiciona negrito em campos com valor vazio ou zero", () => {
    const resultado = adicionarNegrito({ nome: "", ano: 0 }, ["nome", "ano", "inexistente"]);

    expect(resultado.nome).toBe("");
    expect(resultado.ano).toBe(0);
    expect(resultado).not.toHaveProperty("inexistente");
  });

  it("mantém os dados intactos quando nenhum campo de negrito é informado", () => {
    const resultado = adicionarNegrito({ nome: "Servidor" });
    expect(resultado.nome).toBe("Servidor");
  });

  it("gera html com palavras fixas em negrito e palavra vermelha", () => {
    const html = gerarHtmlPortaria("EXPEDE:\n\nÉ a presente portaria apostilada");

    expect(html).toContain("<div><strong>EXPEDE:</strong></div>");
    expect(html).toContain("<div><br></div>");
    expect(html).toContain("<span style='color: red;'>É a presente portaria apostilada</span>");
  });

  it("usa palavras fixas customizadas quando fornecidas", () => {
    const html = gerarHtmlPortaria("MINHA PALAVRA", ["MINHA PALAVRA"]);
    expect(html).toContain("<strong>MINHA PALAVRA</strong>");
  });

  it("retorna vazio quando texto for vazio", () => {
    expect(gerarHtmlPortaria("")).toBe("");
  });
});

describe("EditorSEI component", () => {
  it("renderiza html inicial, expõe getHtml/getTexto e mantém botão padrão", () => {
    const ref = createRef<EditorSEIHandle>();
    render(<EditorSEI ref={ref} html="<div>Texto Portaria</div>" />);

    expect(screen.getByText("PORTARIA")).toBeInTheDocument();
    expect(screen.getByTestId("botao-acao-editor")).toBeInTheDocument();
    expect(ref.current?.getHtml()).toContain("Texto Portaria");
    expect(typeof ref.current?.getTexto()).toBe("string");
  });

  it("executa onAcao e respeita estado desabilitado do botão", () => {
    const onAcao = vi.fn();
    const { rerender } = render(
      <EditorSEI html="<div>Conteúdo</div>" onAcao={onAcao} testId="acao-editor" />,
    );

    fireEvent.click(screen.getByTestId("acao-editor"));
    expect(onAcao).toHaveBeenCalledTimes(1);

    rerender(
      <EditorSEI
        html="<div>Conteúdo</div>"
        onAcao={onAcao}
        testId="acao-editor"
        desabilitarBotao={true}
      />,
    );
    expect(screen.getByTestId("acao-editor")).toBeDisabled();
  });

  it("não renderiza botão quando mostrarBotao=false", () => {
    render(<EditorSEI html="<div>Conteúdo</div>" mostrarBotao={false} />);
    expect(screen.queryByTestId("botao-acao-editor")).not.toBeInTheDocument();
  });

  it("retorna strings vazias no handle quando o editor não está mais montado", () => {
    const handleHolder: { current: EditorSEIHandle | null } = { current: null };
    const { unmount } = render(
      <EditorSEI
        ref={(handle) => {
          if (handle) handleHolder.current = handle;
        }}
        html="<div>Conteúdo</div>"
      />,
    );

    unmount();

    expect(handleHolder.current?.getHtml()).toBe("");
    expect(handleHolder.current?.getTexto()).toBe("");
  });

  it("usa titulo e altura mínima customizados", () => {
    render(<EditorSEI html="<div>Conteúdo</div>" titulo="ANEXO" minHeight="120px" />);

    expect(screen.getByText("ANEXO")).toBeInTheDocument();
    expect(screen.getByTestId("editor-sei")).toHaveStyle({ minHeight: "120px" });
  });

  it("dispara onInput quando o usuário edita o conteúdo", () => {
    const onInput = vi.fn();
    render(<EditorSEI html="<div>Conteúdo</div>" onInput={onInput} />);

    fireEvent.input(screen.getByTestId("editor-sei"));
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("não sobrescreve html existente quando prop html fica vazia", () => {
    const { rerender } = render(<EditorSEI html="<div>Primeiro</div>" />);
    const editor = screen.getByTestId("editor-sei");
    expect(editor.innerHTML).toContain("Primeiro");

    rerender(<EditorSEI html="" />);
    expect(editor.innerHTML).toContain("Primeiro");
  });
});
