import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CadastrarCargoBase from "./page";

const pushMock = vi.fn();
const pageHeaderSpy = vi.fn();
const principalSpy = vi.fn();
const secundarioSpy = vi.fn();
let searchParamId: string | null = null;
const handleSubmitMock = vi.fn((callback: (payload: unknown) => void) => (event?: Event) => {
  callback({ enviado: true });
  event?.preventDefault();
});
const onSubmitFormMock = vi.fn();
const useCriarEditarCargosBaseMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({
    get: (key: string) => (key === "id" ? searchParamId : null),
  }),
}));

vi.mock("@/hooks/useCriarEditarCargosBase", () => ({
  useCriarEditarCargosBase: () => useCriarEditarCargosBaseMock(),
}));

vi.mock("react-hook-form", () => ({
  FormProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  default: (props: Record<string, unknown>) => {
    pageHeaderSpy(props);
    return (
      <header>
        <span data-testid="page-title">{props.title as React.ReactNode}</span>
        {props.createButton as React.ReactNode}
      </header>
    );
  },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
    <button {...rest}>{children}</button>
  ),
}));

vi.mock("@/components/dashboard/FundoBranco/QuadroBranco", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="quadro-branco">{children}</section>
  ),
}));

vi.mock("@/components/dashboard/Gestao/FormCargosBase/FormCargosBasePrincipal", () => ({
  default: (props: { CargosBaseOpcoes: Array<{ codigoCargo: number; nomeCargo: string }> }) => {
    principalSpy(props);
    return <div data-testid="form-principal">form principal</div>;
  },
}));

vi.mock("@/components/dashboard/Gestao/FormCargosBase/FormCargosBaseSecundario", () => ({
  default: () => {
    secundarioSpy();
    return <div data-testid="form-secundario">form secundario</div>;
  },
}));

describe("Página de cadastro de cargo base", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamId = null;
    useCriarEditarCargosBaseMock.mockReturnValue({
      form: {
        handleSubmit: handleSubmitMock,
      },
      onSubmitForm: onSubmitFormMock,
      CargosBaseOpcoes: [{ codigoCargo: 1, nomeCargo: "Cargo A" }],
      isLoadingEditarCargosBase: false,
      isLoadingCargosBase: false,
    });
  });

  it("renderiza header, formulário e repassa opções ao formulário principal", () => {
    render(<CadastrarCargoBase />);

    expect(screen.getByTestId("page-title")).toHaveTextContent("Cadastrar cargo base");
    expect(screen.getByTestId("btn-voltar")).toHaveTextContent("Cancelar");
    expect(screen.getByTestId("botao-cadastrar-cargo")).toHaveTextContent("Cadastrar cargo");
    expect(screen.getByTestId("form-principal")).toBeInTheDocument();
    expect(screen.getByTestId("form-secundario")).toBeInTheDocument();
    expect(screen.getAllByTestId("quadro-branco")).toHaveLength(2);

    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        showBackButton: false,
        breadcrumbs: [
          { title: "Início", href: "/" },
          { title: "Gestão", href: "/pages/gestao/cargos-base" },
          { title: "Cargos base", href: "/pages/gestao/cargos-base" },
          { title: "Cadastrar cargo base", href: "/" },
        ],
      }),
    );
    expect(principalSpy).toHaveBeenCalledWith({
      CargosBaseOpcoes: [{ codigoCargo: 1, nomeCargo: "Cargo A" }],
      isEditing: false,
      isLoading: false,
    });
    expect(secundarioSpy).toHaveBeenCalledTimes(1);
  });

  it("navega no cancelar e submete formulário no cadastrar", () => {
    render(<CadastrarCargoBase />);

    fireEvent.click(screen.getByTestId("btn-voltar"));
    expect(pushMock).toHaveBeenCalledWith("/pages/gestao/cargos-base");

    fireEvent.click(screen.getByTestId("botao-cadastrar-cargo"));
    expect(handleSubmitMock).toHaveBeenCalledWith(onSubmitFormMock);
    expect(onSubmitFormMock).toHaveBeenCalledWith({ enviado: true });
  });

  it("renderiza modo edição quando existe id na querystring", () => {
    searchParamId = "77";
    useCriarEditarCargosBaseMock.mockReturnValue({
      form: {
        handleSubmit: handleSubmitMock,
      },
      onSubmitForm: onSubmitFormMock,
      CargosBaseOpcoes: [{ codigoCargo: 9, nomeCargo: "Cargo Editável" }],
      isLoadingEditarCargosBase: true,
      isLoadingCargosBase: false,
    });

    render(<CadastrarCargoBase />);

    expect(useCriarEditarCargosBaseMock).toHaveBeenCalledWith(77);
    expect(screen.getByTestId("page-title")).toHaveTextContent("Editar cargo base");
    expect(screen.getByTestId("botao-cadastrar-cargo")).toHaveTextContent("Salvar");
    expect(screen.getByTestId("botao-cadastrar-cargo")).toBeDisabled();

    expect(pageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        breadcrumbs: [
          { title: "Início", href: "/" },
          { title: "Gestão", href: "/pages/gestao/cargos-base" },
          { title: "Cargos base", href: "/pages/gestao/cargos-base" },
          { title: "Editar cargo base", href: "/" },
        ],
      }),
    );

    expect(principalSpy).toHaveBeenCalledWith({
      CargosBaseOpcoes: [{ codigoCargo: 9, nomeCargo: "Cargo Editável" }],
      isEditing: true,
      isLoading: true,
    });
  });
});
