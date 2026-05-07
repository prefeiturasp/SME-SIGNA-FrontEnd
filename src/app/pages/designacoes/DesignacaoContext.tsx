"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { FormDesignacaoData } from "@/components/dashboard/Designacao/PesquisaUnidade/schema";
import { DesignacaoUnidadeResponse, Servidor } from "@/types/designacao-unidade";
import { formSchemaDesignacaoPasso2Data } from "@/app/pages/designacoes/designacoes-passo-2/schema";
import { CargoSelect } from "@/types/designacao";

const STORAGE_KEY = "designacao-form-data";

export type FormDesignacaoEServidorIndicado =
  Partial<FormDesignacaoData> &
  Partial<formSchemaDesignacaoPasso2Data> & {
    servidorIndicado?: Servidor;
    dadosTitular?: Servidor | null;
    designacaoUnidade?: DesignacaoUnidadeResponse;
    funcionariosOptions?: CargoSelect[];
    informacoes_adicionais?: string;
    detalhe_para_quadro_de_historico_por_ano?: string;
  };

type DesignacaoContextValue = {
  formDesignacaoData: FormDesignacaoEServidorIndicado | null;
  setFormDesignacaoData: (
    data: FormDesignacaoEServidorIndicado
  ) => void;
  clearFormDesignacaoData: () => void;
};

const DesignacaoContext =
  createContext<DesignacaoContextValue | undefined>(
    undefined
  );

export function DesignacaoProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [formDesignacaoData, setFormDesignacaoData] =
    useState<FormDesignacaoEServidorIndicado | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTimeout(() => {
          setFormDesignacaoData(parsed);
        }, 100);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

  }, [])

  useEffect(() => {
    if (formDesignacaoData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formDesignacaoData))
    }
  }, [formDesignacaoData])

  const clearFormDesignacaoData = () => {
    setFormDesignacaoData(null);
    localStorage.removeItem(STORAGE_KEY)
  };

  const value = useMemo(
    () => ({
      formDesignacaoData,
      setFormDesignacaoData,
      clearFormDesignacaoData,
    }),
    [formDesignacaoData]
  );

  return (
    <DesignacaoContext.Provider value={value}>
      {children}
    </DesignacaoContext.Provider>
  );
}

export function useDesignacaoContext() {
  const context = useContext(DesignacaoContext);

  if (!context) {
    throw new Error(
      "useDesignacaoContext precisa ser usado dentro do DesignacaoProvider"
    );
  }

  return context;
}