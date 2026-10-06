import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FormCargosBaseSecundario from "./FormCargosBaseSecundario";

const {
  useWatchMock,
  simpleTableHeaderSpy,
  switchFieldSpy,
  inputFieldSpy,
  dateFieldSpy,
} = vi.hoisted(() => ({
  useWatchMock: vi.fn(),
  simpleTableHeaderSpy: vi.fn(),
  switchFieldSpy: vi.fn(),
  inputFieldSpy: vi.fn(),
  dateFieldSpy: vi.fn(),
}));

const watchedValues: Record<string, boolean> = {
  pesquisar_licencas_no_sigpec: false,
  possui_periodo_fechado: false,
};

vi.mock("@ant-design/icons", () => ({
  InfoCircleOutlined: (props: { className?: string; style?: React.CSSProperties }) => (
    <span data-testid="info-icon" className={props.className} style={props.style} />
  ),
}));

vi.mock("antd", () => ({
  Tooltip: (props: { children: React.ReactNode; title: string; placement: string }) => (
    <span data-testid="tooltip" data-title={props.title} data-placement={props.placement}>
      {props.children}
    </span>
  ),
}));

vi.mock("react-hook-form", () => ({
  useFormContext: () => ({
    register: vi.fn(),
    control: {},
  }),
  useWatch: useWatchMock,
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
  InputField: (props: { label: React.ReactNode; dataTestId?: string }) => {
    inputFieldSpy(props);
    return <div data-testid={props.dataTestId}>{props.label}</div>;
  },
  DateField: (props: { label: React.ReactNode }) => {
    dateFieldSpy(props);
    return <div data-testid="data-fim-periodo">{props.label}</div>;
  },
}));

describe("FormCargosBaseSecundario", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    watchedValues.pesquisar_licencas_no_sigpec = false;
    watchedValues.possui_periodo_fechado = false;
    useWatchMock.mockImplementation(({ name }: { name: string }) => watchedValues[name]);
  });

  it("renderiza cabeçalho e todos os toggles com as configurações esperadas", () => {
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
    expect(screen.getByTestId("input-testar-laudo")).toHaveTextContent("Testar laudo?");
    expect(screen.getByTestId("input-pesquisar-licencas-no-sigpec")).toHaveTextContent("Pesquisar Licenças no SIGPEC");
    expect(screen.getByTestId("input-permite-substituicao")).toHaveTextContent("O cargo permite substituição");
    expect(screen.getByTestId("input-possui-periodo-fechado")).toHaveTextContent("Possui período fechado?");
    expect(screen.queryByTestId("input-quantidade-maxima-de-dias-de-licenca")).not.toBeInTheDocument();
    expect(screen.queryByTestId("data-fim-periodo")).not.toBeInTheDocument();

    expect(switchFieldSpy).toHaveBeenCalledTimes(9);
    expect(switchFieldSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        name: "utilizado_para_funcoes",
        showBlankSpace: false,
      }),
    );
    expect(switchFieldSpy).toHaveBeenNthCalledWith(
      7,
      expect.objectContaining({
        name: "pesquisar_licencas_no_sigpec",
        showBlankSpace: false,
      }),
    );
    expect(switchFieldSpy).toHaveBeenNthCalledWith(
      8,
      expect.objectContaining({
        name: "permite_substituicao",
        showBlankSpace: false,
      }),
    );
    expect(switchFieldSpy).toHaveBeenNthCalledWith(
      9,
      expect.objectContaining({
        name: "possui_periodo_fechado",
        showBlankSpace: false,
      }),
    );
  });

  it("renderiza campo de quantidade máxima quando pesquisa de licenças está ativa", () => {
    watchedValues.pesquisar_licencas_no_sigpec = true;

    render(<FormCargosBaseSecundario />);

    expect(inputFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "quantidade_maxima_de_dias_de_licenca",
        type: "number",
        maxLength: 4,
        showBlankSpace: false,
      }),
    );
    expect(screen.getByTestId("input-quantidade-maxima-de-dias-de-licenca")).toHaveTextContent(
      "Quantidade máxima de dias de licença*",
    );
    expect(screen.getByTestId("tooltip")).toHaveAttribute(
      "data-title",
      "Licenças maiores que esse período serão ignoradas.",
    );
    expect(screen.getByText("Informe o número máximo de dias que o servidor pode permanecer de licença.")).toBeInTheDocument();
  });

  it("renderiza a data final quando o cargo possui período fechado", () => {
    watchedValues.possui_periodo_fechado = true;

    render(<FormCargosBaseSecundario />);

    expect(dateFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "data_fim_periodo",
        allowClear: false,
      }),
    );
    expect(screen.getByTestId("data-fim-periodo")).toHaveTextContent("Data final do período*");
    expect(screen.getByText("Após a data selecionada, o cargo não possuirá mais validade administrativa.")).toBeInTheDocument();
  });
});
