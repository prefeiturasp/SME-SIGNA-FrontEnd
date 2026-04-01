import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ModalUltimaDesignacao from "./ModalHistoricoUltimaDesignacao";
import type { Servidor } from "@/types/designacao-unidade";

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="dialog" data-open={open ? "true" : "false"}>
      <button
        type="button"
        data-testid="dialog-trigger-close"
        onClick={() => onOpenChange(false)}
      >
        close
      </button>
      <button
        type="button"
        data-testid="dialog-trigger-open"
        onClick={() => onOpenChange(true)}
      >
        open
      </button>
      {children}
    </div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-description">{children}</div>
  ),
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <div data-testid="separator" />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));

const servidorMock: Servidor = {
  rf: "456",
  nome_servidor: "João Silva",
  nome_civil: "João da Silva",
  vinculo: 2,
  lotacao: "UE Y",
  cargo_base: "Analista",
  cargo_sobreposto_funcao_atividade: "Coordenador",
  cursos_titulos: "Mestrado",
  local_de_exercicio: "Local de exercicio teste",
  laudo_medico: "Laudo",
  local_de_servico: "Local do servico teste"

};

const portariaMock = {
  numero_portaria: "001",
  ano: "2024",
  numero_sei: "SEI-001",
  doc: "DOC-001",
  designacao_a_partir_de: "01/01/2024",
  ate: "31/12/2024",
  carater_excepcional: false,
  motivo_cancelamento: "Motivo X",
  impedimento_substituicao: "Impedimento Y",
};

describe("ModalUltimaDesignacao", () => {
  it("renderiza com título e dialog aberto", () => {
    render(
      <ModalUltimaDesignacao
        isLoading={false}
        open={true}
        onOpenChange={vi.fn()}
        ultimoServidor={servidorMock}
        portariaCessacao={null}
      />
    );

    expect(screen.getByTestId("dialog")).toHaveAttribute("data-open", "true");
    expect(screen.getByText("Última designação")).toBeInTheDocument();
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });

  it("renderiza os dados do servidor quando ultimoServidor é fornecido", () => {
    render(
      <ModalUltimaDesignacao
        isLoading={false}
        open={true}
        onOpenChange={vi.fn()}
        ultimoServidor={servidorMock}
        portariaCessacao={null}
      />
    );

    expect(screen.getByText("Nome Servidor")).toBeInTheDocument();
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("Nome Civil")).toBeInTheDocument();
    expect(screen.getByText("João da Silva")).toBeInTheDocument();
    expect(screen.getByText("RF")).toBeInTheDocument();
    expect(screen.getByText("456")).toBeInTheDocument();
    expect(screen.getByText("Cargo sobreposto")).toBeInTheDocument();
    expect(screen.getByText("Coordenador")).toBeInTheDocument();
    expect(screen.getByText("Cargo base")).toBeInTheDocument();
    expect(screen.getByText("Analista")).toBeInTheDocument();
    expect(screen.getByText("Lotação")).toBeInTheDocument();
    expect(screen.getByText("UE Y")).toBeInTheDocument();
  });

  it("exibe mensagem de fallback quando ultimoServidor é nulo", () => {
    render(
      <ModalUltimaDesignacao
        isLoading={false}
        open={true}
        onOpenChange={vi.fn()}
        ultimoServidor={null}
        portariaCessacao={null}
      />
    );

    expect(
      screen.getByText("Nenhuma designação encontrada.")
    ).toBeInTheDocument();
  });

  it("renderiza os dados da portaria de cessação quando fornecida", () => {
    render(
      <ModalUltimaDesignacao
        isLoading={false}
        open={true}
        onOpenChange={vi.fn()}
        ultimoServidor={null}
        portariaCessacao={portariaMock}
      />
    );

    expect(screen.getByText("Portaria de Cessação")).toBeInTheDocument();
    expect(screen.getByText("Nº Portaria da designação")).toBeInTheDocument();
    expect(screen.getByText("001")).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("SEI-001")).toBeInTheDocument();
    expect(screen.getByText("DOC-001")).toBeInTheDocument();
    expect(screen.getByText("01/01/2024")).toBeInTheDocument();
    expect(screen.getByText("31/12/2024")).toBeInTheDocument();
    expect(screen.getByText("Motivo X")).toBeInTheDocument();
    expect(screen.getByText("Impedimento Y")).toBeInTheDocument();
  });

  it("não renderiza a seção de portaria quando portariaCessacao é null", () => {
    render(
      <ModalUltimaDesignacao
        isLoading={false}
        open={true}
        onOpenChange={vi.fn()}
        ultimoServidor={null}
        portariaCessacao={null}
      />
    );

    expect(screen.queryByText("Portaria de Cessação")).not.toBeInTheDocument();
  });

  it.each([
    [true, "Sim"],
    ["sim", "Sim"],
    [false, "Não"],
    ["nao", "Não"],
  ])(
    "exibe caráter excepcional '%s' como '%s'",
    (carater_excepcional, expected) => {
      render(
        <ModalUltimaDesignacao
          isLoading={false}
          open={true}
          onOpenChange={vi.fn()}
          ultimoServidor={null}
          portariaCessacao={{ ...portariaMock, carater_excepcional }}
        />
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
    }
  );

  it("chama onOpenChange quando o Dialog dispara onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <ModalUltimaDesignacao
        isLoading={false}
        open={true}
        onOpenChange={onOpenChange}
        ultimoServidor={null}
        portariaCessacao={null}
      />
    );

    await user.click(screen.getByTestId("dialog-trigger-close"));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await user.click(screen.getByTestId("dialog-trigger-open"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("fecha o modal ao clicar em Sair", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <ModalUltimaDesignacao
        isLoading={false}
        open={true}
        onOpenChange={onOpenChange}
        ultimoServidor={null}
        portariaCessacao={null}
      />
    );

    await user.click(screen.getByTestId("botao-sair-modal"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renderiza com dialog fechado quando open=false", () => {
    render(
      <ModalUltimaDesignacao
        isLoading={false}
        open={false}
        onOpenChange={vi.fn()}
        ultimoServidor={null}
        portariaCessacao={null}
      />
    );

    expect(screen.getByTestId("dialog")).toHaveAttribute("data-open", "false");
  });

  it("exibe '—' para campos do servidor sem valor", () => {
    const servidorSemNomeCivil: Servidor = {
      ...servidorMock,
      nome_civil: undefined,
    };

    render(
      <ModalUltimaDesignacao
        isLoading={false}
        open={true}
        onOpenChange={vi.fn()}
        ultimoServidor={servidorSemNomeCivil}
        portariaCessacao={null}
      />
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});