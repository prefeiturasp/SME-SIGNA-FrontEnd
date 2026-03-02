import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ModalResumoServidor from "./ModalResumoServidor";
import type { Servidor } from "@/types/designacao-unidade";

// Mock UI primitives (Radix/shadcn) to avoid portal/aria concerns and
// allow us to explicitly trigger onOpenChange.
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

vi.mock("../ResumoDesignacaoServidorIndicado", () => ({
  default: ({
    defaultValues,
    isLoading,
    showCursosTitulos,
  }: {
    defaultValues: Servidor;
    isLoading?: boolean;
    showCursosTitulos?: boolean;
  }) => (
    <div data-testid="resumo-designacao-mock">
      <div>loading:{String(isLoading)}</div>
      <div>showCursos:{String(showCursosTitulos)}</div>
      <div>rf:{defaultValues?.rf}</div>
    </div>
  ),
}));

const servidoresMock: Servidor = {
  rf: "123",
  nome: "Servidor",
  esta_afastado: false,
  vinculo_cargo_sobreposto: "Ativo",
  lotacao_cargo_sobreposto: "UE X",
  cargo_base: "Professor",
  funcao_atividade: "Docente",
  cargo_sobreposto: "Nenhum",
  cursos_titulos: "Licenciatura",
  dre: "DRE X",
  codigo_estrutura_hierarquica: "123",
};

describe("ModalResumoServidor", () => {
  it("renderiza com título e repassa props para ResumoDesignacao", () => {
    render(
      <ModalResumoServidor
        isLoading={false}
        open={true}
        onOpenChange={vi.fn()}
        servidores={[servidoresMock]}
      />
    );

    expect(screen.getByTestId("dialog")).toHaveAttribute("data-open", "true");
    expect(
      screen.getByText("Detalhes do funcionário da unidade")
    ).toBeInTheDocument();

    expect(screen.getByTestId("separator")).toBeInTheDocument();
    expect(screen.getByTestId("resumo-designacao-mock")).toBeInTheDocument();
    expect(screen.getByText("loading:false")).toBeInTheDocument();
    expect(screen.getByText("showCursos:false")).toBeInTheDocument();
    expect(screen.getByText("rf:123")).toBeInTheDocument();
  });

  it("chama onOpenChange quando o Dialog dispara onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <ModalResumoServidor
        isLoading={false}
        open={true}
        onOpenChange={onOpenChange}
        servidores={[servidoresMock]}
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
      <ModalResumoServidor
        isLoading={false}
        open={true}
        onOpenChange={onOpenChange}
        servidores={[servidoresMock]}
      />
    );

    await user.click(screen.getByRole("button", { name: /Sair/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});


