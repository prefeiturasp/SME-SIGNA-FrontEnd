import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";

// 🔹 mocks do Next
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

vi.mock(
  "@/components/dashboard/Designacao/BuscaUE/FormularioUEDesignacao",
  () => ({
    default: ({ onSubmitDesignacao }: { onSubmitDesignacao: (data: { dre: string; ue: string }) => void }) => (
      <button
        onClick={() =>
          onSubmitDesignacao({ dre: "dre-1", ue: "ue-1" })
        }
      >
        Mock Formulario
      </button>
    ),
  })
);

vi.mock(
  "@/components/dashboard/Designacao/StepperDesignacao",
  () => ({
    default: () => <div>Mock Stepper</div>,
  })
);

vi.mock(
  "@/components/dashboard/FundoBranco/QuadroBranco",
  () => ({
    default: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  })
);

vi.mock(
  "@/components/dashboard/PageHeader/PageHeader",
  () => ({
    default: ({ title }: { title: string }) => (
      <h1>{title}</h1>
    ),
  })
);

vi.mock("@/assets/icons/Designacao", () => ({
  default: () => <span>Icon</span>,
}));

// 🔹 componente testado
import Designacoes from "./page";

describe("Página Designações", () => {
  it("renderiza o título da página", () => {
    render(<Designacoes />);

    expect(
      screen.getByText("Designação")
    ).toBeInTheDocument();
  });

  it("renderiza o formulário de busca de UE", () => {
    render(<Designacoes />);

    expect(
      screen.getByText("Mock Formulario")
    ).toBeInTheDocument();
  });

  it("renderiza o stepper", () => {
    render(<Designacoes />);

    expect(
      screen.getByText("Mock Stepper")
    ).toBeInTheDocument();
  });
});
