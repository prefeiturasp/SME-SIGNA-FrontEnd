"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { FormDesignacaoData } from "@/components/dashboard/Designacao/PesquisaUnidade/schema";

type DesignacaoContextValue = {
  formDesignacaoData: FormDesignacaoData | null;
  setFormDesignacaoData: (data: FormDesignacaoData) => void;
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
  const [formDesignacaoData, setFormDesignacaoData] = useState<FormDesignacaoData | null>(null);

  const value = useMemo(
    () => ({
      formDesignacaoData,
      setFormDesignacaoData: (data: FormDesignacaoData) => {
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

