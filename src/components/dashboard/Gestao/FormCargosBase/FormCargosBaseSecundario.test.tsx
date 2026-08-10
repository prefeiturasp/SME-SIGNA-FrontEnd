import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FormCargosBaseSecundario from "./FormCargosBaseSecundario";

const simpleTableHeaderSpy = vi.fn();
const switchFieldSpy = vi.fn();

vi.mock("react-hook-form", () => ({
  useFormContext: () => ({
    register: vi.fn(),
    control: {},
  }),
}));

vi.mock("../../SimpleTableHeader/SimpleTableHeader", () => ({
  default: (props: { title: string; subtitle: string }) => {
    simpleTableHeaderSpy(props);
    return (
      <div>
        <span>{props.title}</span>
        <span>{props.subtitle}</span>
      </div>
    );
  },
}));

vi.mock("@/components/ui/FieldsForm", () => ({
  SwitchField: (props: { label: string; dataTestId?: string }) => {
    switchFieldSpy(props);
    return <div data-testid={props.dataTestId}>{props.label}</div>;
  },
}));

describe("FormCargosBaseSecundario", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza cabeçalho e os cinco toggles com as configurações esperadas", () => {
    render(<FormCargosBaseSecundario />);

    expect(simpleTableHeaderSpy).toHaveBeenCalledWith({
      title: "Utilização do cargo",
      subtitle: "Selecione os processos em que este cargo poderá ser utilizado.",
    });

    expect(screen.getByTestId("input-utilizacao-funcoes")).toHaveTextContent("Utilizado para funções?");
    expect(screen.getByTestId("input-utilizacao-designacoes")).toHaveTextContent("Utilizado para designações?");
    expect(screen.getByTestId("input-utilizado-para-ste")).toHaveTextContent("Utilizado para STE?");
    expect(screen.getByTestId("input-utilizado-para-permutas")).toHaveTextContent("Utilizado para permutas?");
    expect(screen.getByTestId("input-cargo-base-ficticio")).toHaveTextContent("Cargo Base fictício?");

    expect(switchFieldSpy).toHaveBeenCalledTimes(5);
    expect(switchFieldSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        name: "usado_em_funcoes",
        showBlankSpace: false,
      }),
    );
    expect(switchFieldSpy).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        name: "cargo_base_ficticio",
        showBlankSpace: false,
      }),
    );
  });
});
