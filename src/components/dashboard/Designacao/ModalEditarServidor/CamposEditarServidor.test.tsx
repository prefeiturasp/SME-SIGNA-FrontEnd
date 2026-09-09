import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CamposEditarServidor from "./CamposEditarServidor";

type WatchValues = {
  nome_servidor?: string;
  rf?: string;
  vinculo?: string | number;
  cargo_base?: string;
  lotacao?: string;
  cursos_titulos?: string;
  cargo_sobreposto_funcao_atividade?: string;
  local_de_exercicio?: string;
  laudo_medico?: string;
  cd_cargo_base?: string | number;
  categoria?: string;
};

const {
  inputFieldSpy,
  infoItemSpy,
  modalListaCursosTitulosSpy,
  watchMock,
  registerMock,
  controlMock,
  watchValues,
} = vi.hoisted(() => ({
  inputFieldSpy: vi.fn(),
  infoItemSpy: vi.fn(),
  modalListaCursosTitulosSpy: vi.fn(),
  watchMock: vi.fn(),
  registerMock: vi.fn(),
  controlMock: {},
  watchValues: {} as WatchValues,
}));

vi.mock("react-hook-form", () => ({
  useFormContext: () => ({
    register: registerMock,
    control: controlMock,
    watch: (name: keyof WatchValues) => {
      watchMock(name);
      return watchValues[name];
    },
  }),
}));

vi.mock("@/components/ui/FieldsForm", () => ({
  InputField: (props: { name: string; label: string; placeholder: string; "data-testid": string }) => {
    inputFieldSpy(props);
    return <input aria-label={props.label} data-testid={props["data-testid"]} placeholder={props.placeholder} />;
  },
}));

vi.mock("@/components/ui/info-item", () => ({
  InfoItem: ({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) => {
    infoItemSpy({ label, value, icon });
    return (
      <div data-testid={`info-${label}`}>
        <span>{label}</span>
        <span>{value}</span>
        {icon}
      </div>
    );
  },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    "data-testid": dataTestId,
  }: {
    children: ReactNode;
    onClick?: () => void;
    "data-testid"?: string;
  }) => (
    <button type="button" onClick={onClick} data-testid={dataTestId}>
      {children}
    </button>
  ),
}));

vi.mock("@/assets/icons/Eye", () => ({
  default: () => <span data-testid="eye-icon" />,
}));

vi.mock("../ModalListaCursosTitulo/ModalListaCursosTitulos", () => ({
  default: (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultValues: WatchValues & {
      cd_cargo_sobreposto_funcao_atividade: number;
      local_de_servico: string;
    };
    data: Array<{ id: number; concurso: string }>;
  }) => {
    modalListaCursosTitulosSpy(props);
    return (
      <div data-testid="modal-cursos-titulos" data-open={String(props.open)}>
        <span>{props.defaultValues.nome_servidor}</span>
        <button type="button" onClick={() => props.onOpenChange(false)}>
          fechar modal cursos
        </button>
      </div>
    );
  },
}));

describe("CamposEditarServidor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(watchValues).forEach((key) => {
      delete watchValues[key as keyof WatchValues];
    });
  });

  it("renderiza campos editáveis e infos com fallbacks", () => {
    render(<CamposEditarServidor />);

    expect(screen.getByTestId("input-nome-servidor")).toBeInTheDocument();
    expect(screen.getByTestId("input-nome-civil")).toBeInTheDocument();
    expect(screen.getByTestId("info-RF")).toHaveTextContent("-");
    expect(screen.getByTestId("info-Cursos/Títulos")).toHaveTextContent("Cursos/Títulos de exemplo");
    expect(inputFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "nome_servidor",
        label: "Nome servidor",
      }),
    );
    expect(inputFieldSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "nome_civil",
        label: "Nome Social",
      }),
    );
  });

  it("renderiza os valores vindos do formulário e repassa defaultValues ao modal", () => {
    Object.assign(watchValues, {
      nome_servidor: "Maria",
      rf: "123456",
      vinculo: 1,
      cargo_base: "Professor",
      lotacao: "Escola",
      cursos_titulos: "Mestrado",
      cargo_sobreposto_funcao_atividade: "Diretor",
      local_de_exercicio: "Unidade",
      laudo_medico: "Indisponível",
      cd_cargo_base: "10",
      categoria: "A",
    } satisfies WatchValues);

    render(<CamposEditarServidor />);

    expect(screen.getByTestId("info-RF")).toHaveTextContent("123456");
    expect(screen.getByTestId("info-Vínculo")).toHaveTextContent("1");
    expect(screen.getByTestId("info-Cargo base")).toHaveTextContent("Professor");
    expect(screen.getByTestId("info-Cursos/Títulos")).toHaveTextContent("Mestrado");
    expect(modalListaCursosTitulosSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        open: false,
        defaultValues: expect.objectContaining({
          nome_servidor: "Maria",
          rf: "123456",
          cargo_sobreposto_funcao_atividade: "Diretor",
          vinculo: 1,
          lotacao: "Escola",
          cd_cargo_base: "10",
          cargo_base: "Professor",
          categoria: "A",
          cursos_titulos: "Mestrado",
          local_de_exercicio: "Unidade",
          laudo_medico: "Indisponível",
          cd_cargo_sobreposto_funcao_atividade: 1,
          local_de_servico: "-",
        }),
      }),
    );
  });

  it("alterna abertura do modal de cursos e permite fechar via onOpenChange", () => {
    watchValues.nome_servidor = "Maria";

    render(<CamposEditarServidor />);

    expect(screen.getByTestId("modal-cursos-titulos")).toHaveAttribute("data-open", "false");

    fireEvent.click(screen.getByTestId("btn-visualizar-cursos-titulos"));
    expect(screen.getByTestId("modal-cursos-titulos")).toHaveAttribute("data-open", "true");
    expect(screen.getByTestId("eye-icon")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "fechar modal cursos" }));
    expect(screen.getByTestId("modal-cursos-titulos")).toHaveAttribute("data-open", "false");
  });

  it("envia a lista mockada de concursos ao modal", () => {
    render(<CamposEditarServidor />);

    expect(modalListaCursosTitulosSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          { id: 1, concurso: "201002757777 - PROF ENS FUND II MEDIO" },
          { id: 2, concurso: "201002757778 - PROF ENS FUND II MEDIO" },
        ],
      }),
    );
  });
});
