import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UseFormReturn } from "react-hook-form";
import formSchemaSelecaoTextosPortaria, {
  formSchemaSelecaoTextosPortariaData,
} from "@/components/dashboard/Gestao/ModalSelecaoDeTipoDeTexto/formSchemaSelecaoTextosPortaria";
import { TextosDePortariasPaginada } from "@/types/gestao";
import { useModalTextosPortaria } from "./useModalTextosPortaria";

const {
  useFormMock,
  zodResolverMock,
  errorNotificationMock,
  formGetValuesMock,
  fetchTextosPortariaMock,
  pushMock,
} = vi.hoisted(() => ({
  useFormMock: vi.fn(),
  zodResolverMock: vi.fn(() => "resolver-mock"),
  errorNotificationMock: vi.fn(),
  formGetValuesMock: vi.fn(),
  fetchTextosPortariaMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useTransition: () => [
      false,
      (callback: () => void | Promise<void>) => {
        void callback();
      },
    ],
  };
});

vi.mock("react-hook-form", () => ({
  useForm: useFormMock,
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: zodResolverMock,
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    error: errorNotificationMock,
  }),
}));

vi.mock("@/actions/textos-portaria", () => ({
  fetchTextosPortaria: fetchTextosPortariaMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const defaultValues: formSchemaSelecaoTextosPortariaData = {
  tipo_de_texto: "criar_novo_texto",
  tipo_portaria: "DESIGNACAO",
};

const ultimoTextoValues: formSchemaSelecaoTextosPortariaData = {
  tipo_de_texto: "ultimo_texto_cadastrado",
  tipo_portaria: "CESSACAO",
};

const resultado: TextosDePortariasPaginada = {
  count: 1,
  next: null,
  previous: null,
  results: [
      {
      id: 42,
      tipo_portaria: "CESSACAO",
      nome_modelo: "Modelo 1",
      status: "ATIVO",
      criado_em: "2026-06-11T08:05:00",
      atualizado_em: "2026-06-11T10:00:00",
      tipo_ato_pai: "Portaria",
      texto_portaria: "Texto 1",
      variaveis: ["VARIAVEL 1"],
      tipo_cargo: "CARGO 1",
      observacoes: "Observações 1",
      tipo_de_ato: "Portaria",
    },
  ],
};

const emptyResultado: TextosDePortariasPaginada = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

describe("useModalTextosPortaria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    formGetValuesMock.mockReturnValue("criar_novo_texto");
    fetchTextosPortariaMock.mockResolvedValue({
      success: true,
      data: resultado,
    });
    useFormMock.mockReturnValue({
      getValues: formGetValuesMock,
      mockedForm: true,
    } as Partial<UseFormReturn<formSchemaSelecaoTextosPortariaData>>);
  });

  it("inicializa o formulário com os valores padrão e o resolver do schema", () => {
    const { result } = renderHook(() => useModalTextosPortaria());

    expect(zodResolverMock).toHaveBeenCalledWith(formSchemaSelecaoTextosPortaria);
    expect(useFormMock).toHaveBeenCalledWith({
      resolver: "resolver-mock",
      defaultValues,
      mode: "onChange",
    });
    expect(result.current.filterForm).toMatchObject({ mockedForm: true });
    expect(result.current.tipo_de_texto).toBe("criar_novo_texto");
    expect(result.current.isPending).toBe(false);
    expect(formGetValuesMock).toHaveBeenCalledWith("tipo_de_texto");
  });

  it("redireciona para o cadastro em branco ao criar um novo texto", async () => {
    const { result } = renderHook(() => useModalTextosPortaria());

    await act(async () => {
      result.current.onSubmitFilterForm(defaultValues);
    });

    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/criar-textos-de-portaria");
    expect(fetchTextosPortariaMock).not.toHaveBeenCalled();
  });

  it("busca o último texto cadastrado e redireciona com o id encontrado", async () => {
    const { result } = renderHook(() => useModalTextosPortaria());

    await act(async () => {
      result.current.onSubmitFilterForm(ultimoTextoValues);
    });

    await waitFor(() => {
      expect(fetchTextosPortariaMock).toHaveBeenCalledWith(
        {
          tipo_ato_pai: undefined,
          tipo_portaria: "CESSACAO",
          nome_modelo: undefined,
          status: undefined,
        },
        1,
      );
      expect(pushMock).toHaveBeenCalledWith("/pages/gestao/criar-textos-de-portaria?id=42");
    });
    expect(errorNotificationMock).not.toHaveBeenCalled();
  });

  it("notifica erro quando a busca do último texto falha", async () => {
    fetchTextosPortariaMock.mockResolvedValue({
      success: false,
      error: "Erro de API",
    });

    const { result } = renderHook(() => useModalTextosPortaria());

    await act(async () => {
      result.current.onSubmitFilterForm(ultimoTextoValues);
    });

    await waitFor(() => {
      expect(errorNotificationMock).toHaveBeenCalledWith({
        title: "Erro ao buscar textos de portaria, por favor, tente novamente mais tarde!",
        clearPrevious: true,
      });
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("notifica erro quando a busca não retorna um texto com id", async () => {
    fetchTextosPortariaMock.mockResolvedValue({
      success: true,
      data: emptyResultado,
    });

    const { result } = renderHook(() => useModalTextosPortaria());

    await act(async () => {
      result.current.onSubmitFilterForm(ultimoTextoValues);
    });

    await waitFor(() => {
      expect(errorNotificationMock).toHaveBeenCalledWith({
        title: "Erro ao buscar textos de portaria, por favor, tente novamente mais tarde!",
        clearPrevious: true,
      });
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("expõe o tipo de texto atual do formulário", () => {
    formGetValuesMock.mockReturnValue("ultimo_texto_cadastrado");

    const { result } = renderHook(() => useModalTextosPortaria());

    expect(result.current.tipo_de_texto).toBe("ultimo_texto_cadastrado");
  });
});
