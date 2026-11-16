"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  cadastrarTextosPortariaAction,
  fetchTextoPortariaByIdAction,
  fetchVariavelAction,
} from "@/actions/textos-portaria";
import FormSchemaCriarTextosPortaria, {
  FormSchemaCriarTextosPortariaData,
} from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormSchemaCriarTextosPortaria";
import type { TipoCargo } from "@/components/dashboard/Gestao/FormCriarTextosPortaria/FormCriarTextosPortaria";
import { useAppNotification } from "@/components/providers/NotificationProvider";

export function useFetchTextoPortariaById(id: number) {
  return useQuery({
    queryKey: ["get-texto-portaria-by-id", id],
    queryFn: async () => {
      const response = await fetchTextoPortariaByIdAction(id);
      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    enabled: id > 0,
  });
}

export function useBuscarVariavel(tipoCargo: TipoCargo) {
  return useQuery({
    queryKey: ["get-variaveis", tipoCargo],
    queryFn: async () => {
      const response = await fetchVariavelAction(tipoCargo);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    enabled: !!tipoCargo,
  });
}

export const useCadastrarTextosPortaria = () =>
  useMutation({
    mutationFn: async ({ values }: { values: FormSchemaCriarTextosPortariaData }) => {
      const response = await cadastrarTextosPortariaAction(values);

      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });

const defaultValues: FormSchemaCriarTextosPortariaData = {
  tipo_portaria: "",
  nome_modelo: "",
  status: "",
  texto_portaria: "",
  variaveis: [],
  tipo_cargo: "CARGO_VAGO",
};

/**
 * Separa o tipo composto ("INSUBSISTENCIA_DESIGNACAO") no tipo base e no ato
 * pai, cortando apenas no primeiro `_` para não descartar o restante do nome.
 */
export function dividirTipoPortaria(
  tipoPortaria: string,
  tipoAtoPai?: string
): { tipo_portaria: string; tipo_ato_pai: string | undefined };
export function dividirTipoPortaria(
  tipoPortaria: string | undefined,
  tipoAtoPai: string | undefined
): { tipo_portaria: string | undefined; tipo_ato_pai: string | undefined };
export function dividirTipoPortaria(
  tipoPortaria: string | undefined,
  tipoAtoPai: string | undefined
): { tipo_portaria: string | undefined; tipo_ato_pai: string | undefined } {
  const separador = tipoPortaria?.indexOf("_") ?? -1;

  if (!tipoPortaria || separador < 0) {
    return { tipo_portaria: tipoPortaria, tipo_ato_pai: tipoAtoPai };
  }

  return {
    tipo_portaria: tipoPortaria.slice(0, separador),
    tipo_ato_pai: tipoPortaria.slice(separador + 1),
  };
}

export function useCriarTextosPortaria(id: number | null = null) {
  const notification = useAppNotification();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const cadastrarTextosPortaria = useCadastrarTextosPortaria();
  const { isPending: isLoadingCadastrarTextoPortaria } = cadastrarTextosPortaria;

  // Um `id` inválido (ex.: "?id=abc" ou "?id=-1") viraria NaN e dispararia uma
  // busca inútil na API.
  const idDoTextoPortaria = id !== null && Number.isInteger(id) && id > 0 ? id : 0;

  const { data: textoPortaria, isLoading: isLoadingBuscarTextoPortaria } =
    useFetchTextoPortariaById(idDoTextoPortaria);

  const filterForm = useForm<FormSchemaCriarTextosPortariaData>({
    resolver: zodResolver(FormSchemaCriarTextosPortaria),
    defaultValues: { ...defaultValues },
    mode: "onChange",
  });
  const tipoCargo = filterForm.watch("tipo_cargo");

  const { data: variaveisOpcoes = [], isLoading: isLoadingVariavel } = useBuscarVariavel(
    tipoCargo as TipoCargo
  );

  useEffect(() => {
    if (!textoPortaria) {
      return;
    }

    let tipoPortaria = textoPortaria.tipo_portaria;
    const tipoAtoPai = textoPortaria.tipo_ato_pai;

    if (tipoAtoPai && tipoPortaria !== "CESSACAO") {
      tipoPortaria = `${tipoPortaria}_${tipoAtoPai}`;
    }

    filterForm.reset({
      tipo_portaria: tipoPortaria,
      nome_modelo: textoPortaria.nome_modelo,
      status: textoPortaria.status,
      texto_portaria: textoPortaria.texto_portaria,
      variaveis: textoPortaria.variaveis ?? [],
      tipo_cargo: textoPortaria.tipo_cargo,
      observacoes: textoPortaria.observacoes ?? "",
    });
  }, [filterForm, textoPortaria]);

  const onSubmitFilterForm = async (values: FormSchemaCriarTextosPortariaData) => {
    const variaveis = values.variaveis ?? [];
    const variavelEstaValida = variaveis.every((item) =>
      values.texto_portaria.includes(`[[${item}]]`)
    );

    if (!variavelEstaValida) {
      setIsModalOpen(true);
      return;
    }

    const { tipo_portaria: tipoPortaria, tipo_ato_pai: tipoAtoPai } = dividirTipoPortaria(
      values.tipo_portaria
    );

    // Cessação sempre se refere a uma designação, mesmo sem ato pai informado.
    const tipoAtoPaiFinal = tipoPortaria === "CESSACAO" ? "DESIGNACAO" : tipoAtoPai;

    try {
      await cadastrarTextosPortaria.mutateAsync({
        values: {
          ...values,
          tipo_ato_pai: tipoAtoPaiFinal,
          tipo_portaria: tipoPortaria,
        },
      });

      notification.success({
        title: "Tudo certo por aqui!",
        description: "O texto da portaria foi cadastrado.",
      });
      router.push("/pages/gestao/textos-de-portaria");
    } catch {
      notification.error({
        title: "Erro!",
        description:
          "Não conseguimos cadastrar o texto da portaria. Por favor, tente novamente.",
      });
    }
  };

  return {
    variaveisOpcoes,
    isLoadingVariavel,
    isLoadingBuscarTextoPortaria,
    isLoadingCadastrarTextoPortaria,
    filterForm,
    onSubmitFilterForm,
    isModalOpen,
    handleCancel,
  };
}
