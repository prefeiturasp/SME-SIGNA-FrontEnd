import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MainDOForm, {
  PORTARIAS_SEM_DATA_DE_PUBLICACAO,
  PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA,
} from "./MainDOForm";

const registerMock = vi.fn();
const onChangeMock = vi.fn();
let selectedOption = PORTARIAS_SEM_DATA_DE_PUBLICACAO;

vi.mock("react-hook-form", () => ({
  useFormContext: () => ({
    register: registerMock,
    control: {},
  }),
  Controller: ({
    render,
  }: {
    render: (args: { field: { value: number; onChange: (value: number) => void } }) => ReactNode;
  }) => render({ field: { value: selectedOption, onChange: onChangeMock } }),
}));

vi.mock("@/components/ui/FieldsForm", () => ({
  DateField: ({
    name,
    label,
    "data-testid": dataTestId,
  }: {
    name: string;
    label: string;
    "data-testid"?: string;
  }) => <div data-testid={dataTestId ?? `date-field-${name}`}>{label}</div>,
}));

vi.mock("antd", () => ({
  Radio: ({ children, checked }: { children: ReactNode; checked: boolean }) => (
    <div data-testid="radio" data-checked={checked}>
      {children}
    </div>
  ),
}));

describe("MainDOForm", () => {
  beforeEach(() => {
    selectedOption = PORTARIAS_SEM_DATA_DE_PUBLICACAO;
    vi.clearAllMocks();
  });

  it("renderiza data de publicação e opções de filtro", () => {
    render(<MainDOForm />);

    expect(screen.getByTestId("input-data-publicacao")).toBeInTheDocument();
    expect(
      screen.getByText("Somente portarias sem data de publicação")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Portarias sem data e portarias com data específica")
    ).toBeInTheDocument();
  });

  it("troca para opção 1 ao clicar no card correspondente", () => {
    render(<MainDOForm />);

    fireEvent.click(screen.getByText("Somente portarias sem data de publicação"));

    expect(onChangeMock).toHaveBeenCalledWith(PORTARIAS_SEM_DATA_DE_PUBLICACAO);
  });

  it("troca para opção 2 ao clicar no card correspondente", () => {
    render(<MainDOForm />);

    fireEvent.click(screen.getByText("Portarias sem data e portarias com data específica"));

    expect(onChangeMock).toHaveBeenCalledWith(
      PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA
    );
  });

  it("exibe data considerada apenas quando opção 2 está selecionada", () => {
    const { rerender } = render(<MainDOForm />);
    expect(
      screen.queryByTestId("input-data-considerada-portaria")
    ).not.toBeInTheDocument();

    selectedOption = PORTARIAS_SEM_DATA_DE_PUBLICACAO_COM_DATA_ESPECIFICA;
    rerender(<MainDOForm />);

    expect(screen.getByTestId("input-data-considerada-portaria")).toBeInTheDocument();
  });
});
