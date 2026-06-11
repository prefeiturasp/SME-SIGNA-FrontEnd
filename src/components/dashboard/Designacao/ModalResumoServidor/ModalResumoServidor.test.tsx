import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ModalResumoServidor from "./ModalResumoServidor";
import type { Servidor } from "@/types/designacao-unidade";

const mockSetFormDesignacaoData = vi.fn();
const mockNotificationSuccess = vi.fn();

vi.mock("@/app/pages/designacoes/DesignacaoContext", () => ({
  useDesignacaoContext: () => ({
    setFormDesignacaoData: mockSetFormDesignacaoData,
  }),
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    success: mockNotificationSuccess,
  }),
}));

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
    onClickCopiarRF,
    onSubmitEditarServidor,
  }: {
    defaultValues: Servidor;
    isLoading?: boolean;
    showCursosTitulos?: boolean;
    onClickCopiarRF?: (servidor: Servidor) => void | Promise<void>;
    onSubmitEditarServidor?: () => void;
  }) => (
    <div data-testid="resumo-designacao-mock">
      <div>loading:{String(isLoading)}</div>
      <div>showCursos:{String(showCursosTitulos)}</div>
      <div>rf:{defaultValues?.rf}</div>
      <button
        type="button"
        data-testid="copy-rf-button"
        onClick={() => onClickCopiarRF?.(defaultValues)}
      >
        copiar
      </button>
      <button
        type="button"
        data-testid="submit-edit-button"
        onClick={() => onSubmitEditarServidor?.()}
      >
        submit
      </button>
    </div>
  ),
}));

const servidoresMock: Servidor = {
  rf: "123",
  nome_servidor: "Servidor",
  nome_civil: "Servidor Nome Civil",
  vinculo: 1,
  lotacao: "UE X",
  cd_cargo_base: 10,
  cargo_base: "Professor",
  cd_cargo_sobreposto_funcao_atividade: 20,
  cargo_sobreposto_funcao_atividade: "Docente",
  cursos_titulos: "Licenciatura",
  laudo_medico: "Sem laudo",
  local_de_servico: "UE X",
  local_de_exercicio: "UE X",
};

describe("ModalResumoServidor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza fallback para ResumoDesignacao", () => {
    render(
      <ModalResumoServidor
        isLoading={false}
        open={true}
        onOpenChange={vi.fn()}
        servidores={[]}
      />
    );

    expect(screen.getByTestId("dialog")).toHaveAttribute("data-open", "true");
    expect(
      screen.getByText("Nenhum servidor encontrado")
    ).toBeInTheDocument();

  });

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

  it("executa callback de edição repassada ao resumo", async () => {
    const user = userEvent.setup();

    render(
      <ModalResumoServidor
        isLoading={false}
        open={true}
        onOpenChange={vi.fn()}
        servidores={[servidoresMock]}
      />
    );

    await user.click(screen.getByTestId("submit-edit-button"));
    expect(screen.getByTestId("resumo-designacao-mock")).toBeInTheDocument();
  });

  it("copia RF e dispara atualização de contexto e notificação", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    const clipboardSpy = vi
      .spyOn(navigator, "clipboard", "get")
      .mockReturnValue({ writeText: writeTextMock } as unknown as Clipboard);

    render(
      <ModalResumoServidor
        isLoading={false}
        open={true}
        onOpenChange={onOpenChange}
        servidores={[servidoresMock]}
      />
    );

    await user.click(screen.getByTestId("copy-rf-button"));

    expect(mockSetFormDesignacaoData).toHaveBeenCalledTimes(1);
    const updater = mockSetFormDesignacaoData.mock.calls[0][0];
    expect(
      updater({
        tipo_cargo: "titular",
        rf_titular: "999",
      })
    ).toEqual({
      tipo_cargo: "disponivel",
      rf_titular: "123",
      dadosTitular: servidoresMock,
    });
    expect(updater(undefined)).toEqual({
      rf_titular: "123",
      dadosTitular: servidoresMock,
      tipo_cargo: "disponivel",
    });
    expect(writeTextMock).toHaveBeenCalledWith("123");
    expect(mockNotificationSuccess).toHaveBeenCalledWith("RF copiado!");

    clipboardSpy.mockRestore();
  });
});


