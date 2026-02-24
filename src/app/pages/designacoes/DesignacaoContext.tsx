"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { FormDesignacaoData } from "@/components/dashboard/Designacao/PesquisaUnidade/schema";
import { Servidor } from "@/types/designacao-unidade";


type FormDesignacaoEServidorIndicado = FormDesignacaoData & { servidorIndicado: Servidor };

type DesignacaoContextValue = {
  formDesignacaoData: FormDesignacaoEServidorIndicado | null;
  setFormDesignacaoData: (data: FormDesignacaoEServidorIndicado) => void;
  clearFormDesignacaoData: () => void;
};

const DesignacaoContext = createContext<DesignacaoContextValue | undefined>(
  undefined
);

export function DesignacaoProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [formDesignacaoData, setFormDesignacaoData] = useState<FormDesignacaoEServidorIndicado | null>({
    "dre": "109300",
    "ue": "013692",
    "funcionarios_da_unidade": "3085",
    "quantidade_turmas": "-",
    "codigo_estrutura_hierarquica": "",
    "cargo_sobreposto": "ASSISTENTE DE DIRETOR DE ESCOLA - v4",
    "modulos": 0,
    "servidorIndicado": {
        "nome": "ADALBERTO PAVLIDIS DA SILVA",
        "rf": "7311559",
        "vinculo_cargo_sobreposto": 1,
        "lotacao_cargo_sobreposto": "JOSE BORGES ANDRADE",
        "cargo_base": "AUXILIAR TECNICO DE EDUCACAO - v1",
        "cargo_sobreposto": "SECRETARIO DE ESCOLA - v1",
        "funcao_atividade": null
    }
});

  const value = useMemo(
    () => ({
      formDesignacaoData,
      setFormDesignacaoData: (data: FormDesignacaoEServidorIndicado) => {
        setFormDesignacaoData(data);
      },
      clearFormDesignacaoData: () => {
        setFormDesignacaoData(null);
      },
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
    throw new Error("useDesignacaoContext must be used within DesignacaoProvider");
  }
  return context;
}

