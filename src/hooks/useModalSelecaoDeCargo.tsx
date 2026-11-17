"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { fetchCargosBaseAction } from "@/actions/cargos-base";
import formSchemaSelecaoDeCargo, {
  formSchemaSelecaoDeCargoData,
} from "@/components/dashboard/Gestao/ModalSelecaoDeCargo/formSchemaSelecaoDeCargo";
import { useAppNotification } from "@/components/providers/NotificationProvider";
import type { ICargoType } from "@/types/cargos";

/** Cargos do EOL exibidos no select do modal. */
export function useCargosEol(enabled = true) {
  return useQuery({
    queryKey: ["get-cargos-eol"],
    queryFn: async () => {
      const response = await fetchCargosBaseAction();
      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    enabled,
  });
}

export const defaultValuesSelecaoDeCargo: formSchemaSelecaoDeCargoData = {
  codigo_cargo: "",
};

export interface UseModalSelecaoDeCargoParams {
  onConfirm?: (values: formSchemaSelecaoDeCargoData, cargo: ICargoType | undefined) => void;
  onClose?: () => void;
}

export function useModalSelecaoDeCargo({ onConfirm, onClose }: UseModalSelecaoDeCargoParams = {}) {
  const { error: notifyError } = useAppNotification();

  const filterForm = useForm<formSchemaSelecaoDeCargoData>({
    resolver: zodResolver(formSchemaSelecaoDeCargo),
    defaultValues: { ...defaultValuesSelecaoDeCargo },
    mode: "onChange",
  });

  const { data: cargosOpcoes = [], isLoading: isLoadingCargos, isError } =
    useCargosEol();

  useEffect(() => {
    if (!isError) {
      return;
    }

    notifyError({
      title: "Erro ao buscar os cargos, por favor, tente novamente mais tarde!",
      clearPrevious: true,
    });
  }, [isError, notifyError]);

  const onSubmitFilterForm = (values: formSchemaSelecaoDeCargoData) => {
    const cargo = cargosOpcoes.find(
      (item: ICargoType) => String(item.codigoCargo) === values.codigo_cargo
    );

    onConfirm?.(values, cargo);
    onClose?.();
  };

  return {
    filterForm,
    onSubmitFilterForm,
    cargosOpcoes,
    isLoadingCargos,
    defaultValues: defaultValuesSelecaoDeCargo,
  };
}
