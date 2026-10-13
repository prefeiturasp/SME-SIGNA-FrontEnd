import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import AnularApostilaForm from "./AnularApostilaForm";
import type { AnularApostilaCampos, AtoAnulavel } from "./AnularApostilaForm";

const pushMock = vi.fn();
const notificationSuccessMock = vi.fn();
const notificationErrorMock = vi.fn();
const triggerMock = vi.fn();
const resetMock = vi.fn();
const gerarPreviewMock = vi.fn();
const gerarHtmlPortariaMock = vi.fn((texto: string) => `HTML:${texto}`);
const getDadosPortariaMock = vi.fn((value?: unknown) => ({ origem: "designacao", value }));
const getDadosPortariaCessacaoMock = vi.fn((value?: unknown) => ({ origem: "cessacao", value }));
const getDadosIndicadoMock = vi.fn((value?: unknown) => ({ origem: "indicado", value }));
const onSalvarMock = vi.fn();

let formValues: Record<string, unknown> = {};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({}),
}));

vi.mock("@/actions/textos-sei", () => ({
  gerarPreviewTextoSeiAction: (...args: unknown[]) => gerarPreviewMock(...args),
}));

vi.mock("@/utils/designacao/getDadosPortaria", () => ({
  getDadosPortaria: (value: unknown) => getDadosPortariaMock(value),
}));

vi.mock("@/utils/cessacao/getDadosPortaria", () => ({
  getDadosPortariaCessacao: (value: unknown) => getDadosPortariaCessacaoMock(value),
}));

vi.mock("@/utils/ServidorIndicado/getDadosIndicado", () => ({
  getDadosIndicado: (value: unknown) => getDadosIndicadoMock(value),
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    success: notificationSuccessMock,
    error: notificationErrorMock,
  }),
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: ({ title }: { title: ReactNode }) => (
    <div data-testid="page-header">{title}</div>
  ),
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/dashboard/Designacao/CustomAccordionItem", () => ({
  CustomAccordionItem: ({ title, children }: { title: string; children: ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

vi.mock("@/components/dashboard/Designacao/ResumoDesignacao/BlocosDesignacao", () => ({
  __esModule: true,
  default: () => <div data-testid="blocos-designacao" />,
}));

vi.mock("@/components/dashboard/apostila/PortariaApostilaFields/PortariaAnularApostilaFields", () => ({
  __esModule: true,
  default: ({ tipo_portaria }: { tipo_portaria: string }) => (
    <div data-testid="portaria-fields">{tipo_portaria}</div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/dashboard/EditorTextoSEI/EditorTextoSEI", () => ({
  __esModule: true,
  default: ({ html }: { html: string }) => <div data-testid="editor">{html}</div>,
  gerarHtmlPortaria: (texto: string) => gerarHtmlPortariaMock(texto),
}));

vi.mock("antd", () => ({
  Card: ({ title, children }: { title: ReactNode; children: ReactNode }) => (
    <div>
      <div>{title}</div>
      {children}
    </div>
  ),
}));

vi.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loading" className={className} />
  ),
}));

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual<typeof import("react-hook-form")>("react-hook-form");

  return {
    ...actual,
    useForm: () => ({
      handleSubmit: (fn: (values: unknown) => unknown) => (e?: Event) => {
        e?.preventDefault?.();
        return fn(formValues);
      },
      getValues: () => formValues,
      trigger: (...args: unknown[]) => triggerMock(...args),
      reset: (...args: unknown[]) => resetMock(...args),
      control: {},
      formState: { errors: {} },
    }),
    FormProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

const atoDesignacao: AtoAnulavel = {
  designacao: {
    dre_nome: "DRE TESTE",
    portaria: "123",
    ano_vigente: "2024",
    doc: "2024-01-02",
    sei_numero: "SEI-DES",
    indicado_nome_servidor: "Maria Silva",
    indicado_rf: "1234567",
    indicado_vinculo: "Efetivo",
    tipo_vaga: "VAGO",
  },
  cessacao: null,
} as unknown as AtoAnulavel;

const renderForm = (props: Partial<Parameters<typeof AnularApostilaForm>[0]> = {}) =>
  render(
    <AnularApostilaForm
      ato={atoDesignacao}
      isLoading={false}
      titulo="Anular Apostila"
      mensagemSucesso="Salvo!"
      onSalvar={onSalvarMock}
      {...props}
    />
  );

describe("AnularApostilaForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    formValues = {
      apostila_insubsistencia: {
        portaria: "999",
        ano: "2026",
        numero_sei: "SEI-NOVO",
        doc: new Date("2026-05-10"),
        observacao: "Obs teste",
        texto_para_apostila: "É a presente portaria apostilada",
      },
    };
    triggerMock.mockResolvedValue(true);
    onSalvarMock.mockResolvedValue({ id: 1 });
    gerarPreviewMock.mockResolvedValue({
      success: true,
      data: { texto: "TEXTO DO BACKEND", modelo_portaria_id: 7 },
    });
  });

  it("mostra o loading e esconde o formulário enquanto carrega", () => {
    renderForm({ isLoading: true });

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByText("Gerar texto SEI")).not.toBeInTheDocument();
  });

  it("usa o título recebido no cabeçalho", () => {
    renderForm({ titulo: "Editar Anular Apostila" });

    expect(screen.getByTestId("page-header")).toHaveTextContent("Editar Anular Apostila");
  });

  it("pede o texto ao backend com o tipo de ato e as variáveis da anulação", async () => {
    renderForm();

    expect(screen.getByText("Designação")).toBeInTheDocument();
    expect(screen.getByTestId("portaria-fields")).toHaveTextContent("designacao");
    expect(getDadosPortariaMock).toHaveBeenCalledWith(atoDesignacao.designacao);
    expect(getDadosPortariaCessacaoMock).toHaveBeenCalledWith(atoDesignacao);
    expect(getDadosIndicadoMock).toHaveBeenCalledWith(atoDesignacao.designacao);

    fireEvent.click(screen.getByText("Gerar texto SEI"));

    await waitFor(() => expect(triggerMock).toHaveBeenCalledWith("apostila_insubsistencia"));
    await waitFor(() => expect(gerarPreviewMock).toHaveBeenCalledTimes(1));

    expect(gerarPreviewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo_portaria: "INSUBSISTENCIA",
        tipo_ato_pai: "APOSTILA",
        tipo_cargo: "CARGO_VAGO",
        dados: expect.objectContaining({
          PORTARIA: "999/2026",
          NUMERO_SEI: "SEI-NOVO",
          NOME_SERVIDOR: "Maria Silva",
          PORTARIA_APOSTILADA: "123/2024",
          NUMERO_SEI_APOSTILADO: "SEI-DES",
          DRE: "DRE TESTE",
          TEXTO_APOSTILA: "É a presente portaria apostilada",
        }),
      })
    );

    expect(screen.getByTestId("editor")).toHaveTextContent("HTML:TEXTO DO BACKEND");
  });

  it("usa os dados da cessação como ato apostilado quando existe cessação", async () => {
    renderForm({
      ato: {
        ...atoDesignacao,
        cessacao: {
          portaria: "777",
          ano_vigente: "2025",
          doc: undefined,
          sei_numero: "SEI-CESSACAO",
        },
      } as unknown as AtoAnulavel,
    });

    expect(screen.getByText("Cessação")).toBeInTheDocument();
    expect(screen.getByTestId("portaria-fields")).toHaveTextContent("cessacao");

    fireEvent.click(screen.getByText("Gerar texto SEI"));
    await waitFor(() => expect(gerarPreviewMock).toHaveBeenCalledTimes(1));

    expect(gerarPreviewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dados: expect.objectContaining({
          PORTARIA_APOSTILADA: "777/2025",
          NUMERO_SEI_APOSTILADO: "SEI-CESSACAO",
          DOC_APOSTILADO: "",
        }),
      })
    );
  });

  it("avisa e não mostra o editor quando não há modelo de portaria cadastrado", async () => {
    gerarPreviewMock.mockResolvedValue({
      success: false,
      error: "Não há modelo de portaria ativo cadastrado para este tipo de ato.",
    });

    renderForm();
    fireEvent.click(screen.getByText("Gerar texto SEI"));

    await waitFor(() =>
      expect(notificationErrorMock).toHaveBeenCalledWith({
        title:
          "Erro ao gerar o texto da portaria: Não há modelo de portaria ativo cadastrado para este tipo de ato.",
      })
    );
    expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
  });

  it("não chama o backend quando a validação do formulário falha", async () => {
    triggerMock.mockResolvedValue(false);

    renderForm();
    fireEvent.click(screen.getByText("Gerar texto SEI"));

    await waitFor(() => expect(triggerMock).toHaveBeenCalledWith("apostila_insubsistencia"));
    expect(gerarPreviewMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
  });

  it("abre com o texto SEI já salvo e o reenvia sem precisar gerar de novo", async () => {
    renderForm({ textoSeiSalvo: "TEXTO JA SALVO" });

    expect(gerarHtmlPortariaMock).toHaveBeenCalledWith("TEXTO JA SALVO");
    expect(screen.getByTestId("editor")).toHaveTextContent("HTML:TEXTO JA SALVO");

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() =>
      expect(onSalvarMock).toHaveBeenCalledWith(formValues, {
        textoSei: "TEXTO JA SALVO",
        modeloPortaria: null,
      })
    );
  });

  it("substitui o texto salvo pelo regerado no backend", async () => {
    renderForm({ textoSeiSalvo: "TEXTO ANTIGO" });

    expect(screen.getByTestId("editor")).toHaveTextContent("HTML:TEXTO ANTIGO");

    fireEvent.click(screen.getByText("Gerar texto SEI"));
    await waitFor(() => expect(gerarPreviewMock).toHaveBeenCalledTimes(1));

    expect(screen.getByTestId("editor")).toHaveTextContent("HTML:TEXTO DO BACKEND");

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() =>
      expect(onSalvarMock).toHaveBeenCalledWith(formValues, {
        textoSei: "TEXTO DO BACKEND",
        modeloPortaria: 7,
      })
    );
  });

  it("preenche o formulário com os valores iniciais recebidos", () => {
    const valoresIniciais = {
      portaria: "999",
      ano: "2026",
      numero_sei: "SEI-ANULACAO",
      doc: new Date("2026-05-10"),
      observacao: "Obs salva",
      texto_para_apostila: "texto",
    } as unknown as AnularApostilaCampos;

    renderForm({ valoresIniciais });

    expect(resetMock).toHaveBeenCalledWith({ apostila_insubsistencia: valoresIniciais });
  });

  it("não reseta o formulário quando não há valores iniciais", () => {
    renderForm();

    expect(resetMock).not.toHaveBeenCalled();
  });

  it("avisa e redireciona quando o salvamento dá certo", async () => {
    renderForm({ mensagemSucesso: "Anulação salva!" });

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(notificationSuccessMock).toHaveBeenCalledWith({ title: "Anulação salva!" });
      expect(pushMock).toHaveBeenCalledWith("/pages/atos-administrativos");
    });
  });

  it("mostra a mensagem do erro lançado como Error", async () => {
    onSalvarMock.mockRejectedValueOnce(new Error("falha ao salvar"));

    renderForm();
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() =>
      expect(notificationErrorMock).toHaveBeenCalledWith({ title: "falha ao salvar" })
    );
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("mostra mensagem padrão quando a exceção não é Error", async () => {
    onSalvarMock.mockRejectedValueOnce({ reason: "erro-desconhecido" });

    renderForm();
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() =>
      expect(notificationErrorMock).toHaveBeenCalledWith({ title: "Erro ao salvar" })
    );
  });
});
