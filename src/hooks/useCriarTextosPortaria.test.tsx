import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UseFormReturn } from "react-hook-form";
import FormSchemaCriarTextosPortaria, {
  FormSchemaCriarTextosPortariaData,
} from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormSchemaCriarTextosPortaria";
import { TextosDePortariasResponse, Variavel } from "@/types/gestao";
import {
  cadastrarTextosPortariaAction,
  fetchTextoPortariaByIdAction,
  fetchVariavelAction,
} from "@/actions/textos-portaria";
import {
  useBuscarVariavel,
  useCadastrarTextosPortaria,
  useCriarTextosPortaria,
  useFetchTextoPortariaById,
} from "./useCriarTextosPortaria";

interface QueryOptions {
  queryKey: unknown[];
  queryFn: () => Promise<unknown>;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  gcTime?: number;
}

interface MutationOptions {
  mutationFn: (args: { values: FormSchemaCriarTextosPortariaData }) => Promise<unknown>;
}

const {
  useFormMock,
  zodResolverMock,
  successNotificationMock,
  errorNotificationMock,
  pushMock,
  useQueryMock,
  useMutationMock,
  formResetMock,
} = vi.hoisted(() => ({
  useFormMock: vi.fn(),
  zodResolverMock: vi.fn(() => "resolver-mock"),
  successNotificationMock: vi.fn(),
  errorNotificationMock: vi.fn(),
  pushMock: vi.fn(),
  useQueryMock: vi.fn(),
  useMutationMock: vi.fn(),
  formResetMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("react-hook-form", () => ({
  useForm: useFormMock,
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: zodResolverMock,
}));

vi.mock("@/components/providers/NotificationProvider", () => ({
  useAppNotification: () => ({
    success: successNotificationMock,
    error: errorNotificationMock,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: QueryOptions) => useQueryMock(options),
  useMutation: (options: MutationOptions) => useMutationMock(options),
}));

vi.mock("@/actions/textos-portaria", () => ({
  cadastrarTextosPortariaAction: vi.fn(),
  fetchTextoPortariaByIdAction: vi.fn(),
  fetchVariavelAction: vi.fn(),
}));

const defaultValues: FormSchemaCriarTextosPortariaData = {
  tipo_portaria: "",
  nome_modelo: "",
  status: "",
  texto_portaria: "",
  variaveis: [],
  tipo_cargo: "",
};

const validValues: FormSchemaCriarTextosPortariaData = {
  tipo_portaria: "DESIGNACAO",
  nome_modelo: "Modelo 1",
  status: "ATIVO",
  texto_portaria: "Servidor [[NOME_SERVIDOR]] portaria [[PORTARIA]].",
  variaveis: ["NOME_SERVIDOR", "PORTARIA"],
  tipo_cargo: "CARGO_VAGO",
  observacoes: "Obs",
};

const variaveisOpcoes: Variavel[] = [
  { value: "NOME_SERVIDOR", display_name: "Nome do servidor" },
  { value: "PORTARIA", display_name: "Portaria" },
];

const textoPortaria: TextosDePortariasResponse = {
  id: 12,
  tipo_ato_pai: "DESIGNACAO",
  tipo_portaria: "INSUBSISTENCIA",
  tipo_de_ato: "Portaria",
  nome_modelo: "Modelo 1",
  status: "ATIVO",
  criado_em: "2026-06-11T08:05:00",
  atualizado_em: "2026-06-11T10:00:00",
  texto_portaria: "Servidor [[NOME_SERVIDOR]]",
  variaveis: ["NOME_SERVIDOR"],
  tipo_cargo: "CARGO_VAGO",
  observacoes: "Obs",
};

let textoPortariaQueryData: TextosDePortariasResponse | undefined;
let isLoadingVariavel = false;
let isLoadingBuscarTextoPortaria = false;
let isPendingCadastrar = false;

const mockQueryAndMutation = () => {
  useQueryMock.mockImplementation((options: QueryOptions) => {
    if (options.queryKey[0] === "get-variaveis") {
      return { data: variaveisOpcoes, isLoading: isLoadingVariavel };
    }

    return { data: textoPortariaQueryData, isLoading: isLoadingBuscarTextoPortaria };
  });
  useMutationMock.mockImplementation((options: MutationOptions) => ({
    mutateAsync: (args: { values: FormSchemaCriarTextosPortariaData }) => options.mutationFn(args),
    isPending: isPendingCadastrar,
  }));
};

describe("useFetchTextoPortariaById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockImplementation((options: QueryOptions) => options);
  });

  it("configura query com id e opções esperadas", () => {
    renderHook(() => useFetchTextoPortariaById(12));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["get-texto-portaria-by-id", 12],
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
        enabled: true,
      }),
    );
  });

  it("desabilita a query quando o id é 0", () => {
    renderHook(() => useFetchTextoPortariaById(0));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["get-texto-portaria-by-id", 0],
        enabled: false,
      }),
    );
  });

  it("retorna os dados quando a busca por id é bem-sucedida", async () => {
    vi.mocked(fetchTextoPortariaByIdAction).mockResolvedValueOnce({
      success: true,
      data: textoPortaria,
    });

    renderHook(() => useFetchTextoPortariaById(12));
    const queryOptions = useQueryMock.mock.calls[0][0] as QueryOptions;
    const data = await queryOptions.queryFn();

    expect(fetchTextoPortariaByIdAction).toHaveBeenCalledWith(12);
    expect(data).toEqual(textoPortaria);
  });

  it("lança erro quando a busca por id falha", async () => {
    vi.mocked(fetchTextoPortariaByIdAction).mockResolvedValueOnce({
      success: false,
      error: "falha ao buscar",
    });

    renderHook(() => useFetchTextoPortariaById(12));
    const queryOptions = useQueryMock.mock.calls[0][0] as QueryOptions;

    await expect(queryOptions.queryFn()).rejects.toThrow("falha ao buscar");
  });
});

describe("useBuscarVariavel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockImplementation((options: QueryOptions) => options);
  });

  it("configura query com chave e opções esperadas", () => {
    renderHook(() => useBuscarVariavel());

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["get-variaveis"],
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
      }),
    );
  });

  it("retorna os dados quando a busca é bem-sucedida", async () => {
    vi.mocked(fetchVariavelAction).mockResolvedValueOnce({
      success: true,
      data: variaveisOpcoes,
    });

    renderHook(() => useBuscarVariavel());
    const queryOptions = useQueryMock.mock.calls[0][0] as QueryOptions;
    const data = await queryOptions.queryFn();

    expect(data).toEqual(variaveisOpcoes);
  });

  it("lança erro quando a busca de variáveis falha", async () => {
    vi.mocked(fetchVariavelAction).mockResolvedValueOnce({
      success: false,
      error: "falha ao buscar variáveis",
    });

    renderHook(() => useBuscarVariavel());
    const queryOptions = useQueryMock.mock.calls[0][0] as QueryOptions;

    await expect(queryOptions.queryFn()).rejects.toThrow("falha ao buscar variáveis");
  });
});

describe("useCadastrarTextosPortaria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockImplementation((options: MutationOptions) => ({
      mutateAsync: (args: { values: FormSchemaCriarTextosPortariaData }) => options.mutationFn(args),
      isPending: false,
    }));
  });

  it("retorna os dados quando o cadastro é bem-sucedido", async () => {
    vi.mocked(cadastrarTextosPortariaAction).mockResolvedValueOnce({
      success: true,
      data: { id: 99 },
    });

    const { result } = renderHook(() => useCadastrarTextosPortaria());
    const response = await result.current.mutateAsync({ values: validValues });

    expect(cadastrarTextosPortariaAction).toHaveBeenCalledWith(validValues);
    expect(response).toEqual({ id: 99 });
  });

  it("lança erro quando o cadastro falha", async () => {
    vi.mocked(cadastrarTextosPortariaAction).mockResolvedValueOnce({
      success: false,
      error: "erro ao cadastrar",
    });

    const { result } = renderHook(() => useCadastrarTextosPortaria());

    await expect(result.current.mutateAsync({ values: validValues })).rejects.toThrow("erro ao cadastrar");
  });
});

describe("useCriarTextosPortaria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    textoPortariaQueryData = undefined;
    isLoadingVariavel = false;
    isLoadingBuscarTextoPortaria = false;
    isPendingCadastrar = false;
    mockQueryAndMutation();
    useFormMock.mockReturnValue({
      mockedForm: true,
      reset: formResetMock,
    } as Partial<UseFormReturn<FormSchemaCriarTextosPortariaData>>);
    vi.mocked(cadastrarTextosPortariaAction).mockResolvedValue({
      success: true,
      data: { id: 1 },
    });
  });

  it("inicializa formulário com defaults e estado inicial", () => {
    const { result } = renderHook(() => useCriarTextosPortaria());

    expect(zodResolverMock).toHaveBeenCalledWith(FormSchemaCriarTextosPortaria);
    expect(useFormMock).toHaveBeenCalledWith({
      resolver: "resolver-mock",
      defaultValues,
      mode: "onChange",
    });
    expect(result.current.filterForm).toMatchObject({ mockedForm: true });
    expect(result.current.variaveisOpcoes).toEqual(variaveisOpcoes);
    expect(result.current.isLoadingVariavel).toBe(false);
    expect(result.current.isLoadingBuscarTextoPortaria).toBe(false);
    expect(result.current.isLoadingCadastrarTextoPortaria).toBe(false);
    expect(result.current.isModalOpen).toBe(false);
    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["get-texto-portaria-by-id", 0],
        enabled: false,
      }),
    );
  });

  it("expõe os estados de loading dos hooks internos", () => {
    isLoadingVariavel = true;
    isLoadingBuscarTextoPortaria = true;
    isPendingCadastrar = true;
    mockQueryAndMutation();

    const { result } = renderHook(() => useCriarTextosPortaria(12));

    expect(result.current.isLoadingVariavel).toBe(true);
    expect(result.current.isLoadingBuscarTextoPortaria).toBe(true);
    expect(result.current.isLoadingCadastrarTextoPortaria).toBe(true);
    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["get-texto-portaria-by-id", 12],
        enabled: true,
      }),
    );
  });

  it("preenche o formulário concatenando tipo de portaria e ato pai", async () => {
    textoPortariaQueryData = textoPortaria;

    renderHook(() => useCriarTextosPortaria(12));

    await waitFor(() => {
      expect(formResetMock).toHaveBeenCalledWith({
        tipo_portaria: "INSUBSISTENCIA_DESIGNACAO",
        nome_modelo: "Modelo 1",
        status: "ATIVO",
        texto_portaria: "Servidor [[NOME_SERVIDOR]]",
        variaveis: ["NOME_SERVIDOR"],
        tipo_cargo: "CARGO_VAGO",
        observacoes: "Obs",
      });
    });
  });

  it("não concatena tipo de portaria quando o ato é cessação", async () => {
    textoPortariaQueryData = {
      ...textoPortaria,
      tipo_portaria: "CESSACAO",
      tipo_ato_pai: "DESIGNACAO",
    };

    renderHook(() => useCriarTextosPortaria(12));

    await waitFor(() => {
      expect(formResetMock).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo_portaria: "CESSACAO",
        }),
      );
    });
  });

  it("não concatena tipo de portaria quando não há ato pai", async () => {
    textoPortariaQueryData = {
      ...textoPortaria,
      tipo_portaria: "DESIGNACAO",
      tipo_ato_pai: "",
    };

    renderHook(() => useCriarTextosPortaria(12));

    await waitFor(() => {
      expect(formResetMock).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo_portaria: "DESIGNACAO",
        }),
      );
    });
  });

  it("notifica sucesso e navega quando todas as variáveis estão no texto", async () => {
    const { result } = renderHook(() => useCriarTextosPortaria());

    await act(async () => {
      await result.current.onSubmitFilterForm(validValues);
    });

    expect(cadastrarTextosPortariaAction).toHaveBeenCalledWith({
      ...validValues,
      tipo_ato_pai: undefined,
      tipo_portaria: "DESIGNACAO",
    });
    expect(successNotificationMock).toHaveBeenCalledWith({
      title: "Tudo certo por aqui!",
      description: "O texto da portaria foi cadastrado.",
    });
    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/textos-de-portaria");
    expect(result.current.isModalOpen).toBe(false);
  });

  it("separa tipo composto e envia tipo_ato_pai no cadastro", async () => {
    const { result } = renderHook(() => useCriarTextosPortaria());

    await act(async () => {
      await result.current.onSubmitFilterForm({
        ...validValues,
        tipo_portaria: "INSUBSISTENCIA_DESIGNACAO",
      });
    });

    expect(cadastrarTextosPortariaAction).toHaveBeenCalledWith({
      ...validValues,
      tipo_portaria: "INSUBSISTENCIA",
      tipo_ato_pai: "DESIGNACAO",
    });
  });

  it("define tipo_ato_pai como DESIGNACAO quando o tipo é cessação", async () => {
    const { result } = renderHook(() => useCriarTextosPortaria());

    await act(async () => {
      await result.current.onSubmitFilterForm({
        ...validValues,
        tipo_portaria: "CESSACAO",
      });
    });

    expect(cadastrarTextosPortariaAction).toHaveBeenCalledWith({
      ...validValues,
      tipo_portaria: "CESSACAO",
      tipo_ato_pai: "DESIGNACAO",
    });
  });

  it("considera válido o envio sem variáveis selecionadas", async () => {
    const { result } = renderHook(() => useCriarTextosPortaria());

    await act(async () => {
      await result.current.onSubmitFilterForm({
        ...validValues,
        variaveis: [],
        texto_portaria: "Texto sem tokens",
      });
    });

    expect(successNotificationMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/textos-de-portaria");
  });

  it("abre o modal quando alguma variável não está no formato esperado", async () => {
    const { result } = renderHook(() => useCriarTextosPortaria());

    await act(async () => {
      await result.current.onSubmitFilterForm({
        ...validValues,
        texto_portaria: "Servidor [[NOME_SERVIDOR]] sem a outra variável.",
      });
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(cadastrarTextosPortariaAction).not.toHaveBeenCalled();
    expect(successNotificationMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("mantém o modal aberto quando a primeira variável já invalidou o texto", async () => {
    const { result } = renderHook(() => useCriarTextosPortaria());

    await act(async () => {
      await result.current.onSubmitFilterForm({
        ...validValues,
        texto_portaria: "Somente [[PORTARIA]] no final.",
      });
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(successNotificationMock).not.toHaveBeenCalled();
  });

  it("notifica erro quando o cadastro falha", async () => {
    vi.mocked(cadastrarTextosPortariaAction).mockResolvedValueOnce({
      success: false,
      error: "erro ao cadastrar",
    });

    const { result } = renderHook(() => useCriarTextosPortaria());

    await act(async () => {
      await result.current.onSubmitFilterForm(validValues);
    });

    expect(errorNotificationMock).toHaveBeenCalledWith({
      title: "Erro!",
      description: "Não conseguimos cadastrar o texto da portarias. Por favor, tente novamente.",
    });
    expect(pushMock).not.toHaveBeenCalled();
    expect(successNotificationMock).not.toHaveBeenCalled();
  });

  it("fecha o modal ao revisar o texto", async () => {
    const { result } = renderHook(() => useCriarTextosPortaria());

    await act(async () => {
      await result.current.onSubmitFilterForm({
        ...validValues,
        texto_portaria: "Texto inválido",
      });
    });
    expect(result.current.isModalOpen).toBe(true);

    act(() => {
      result.current.handleCancel();
    });

    expect(result.current.isModalOpen).toBe(false);
  });

  it("usa lista vazia de variáveis quando a query não retorna dados", () => {
    useQueryMock.mockImplementation((options: QueryOptions) => {
      if (options.queryKey[0] === "get-variaveis") {
        return { data: undefined, isLoading: false };
      }

      return { data: undefined, isLoading: false };
    });

    const { result } = renderHook(() => useCriarTextosPortaria());

    expect(result.current.variaveisOpcoes).toEqual([]);
  });
});
