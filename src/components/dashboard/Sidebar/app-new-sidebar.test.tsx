import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import type { ImgHTMLAttributes, Key, ReactNode } from "react";

import {
    AppNewSidebar,
    MENU_APOIO_ADMINISTRATIVO,
    MENU_DESIGNACAO,
    MENU_GESTAO,
    MENU_MEUS_DADOS,
    MENU_NOMEACAO,
    MENU_PROTOCOLO,
    MenuEnum,
    menus,
} from "./app-new-sidebar";
import type { MenuItemConectaProps, MenuItemSMEProps } from "./app-new-sidebar";

interface SiderMockProps {
    onClick: (item: MenuItemSMEProps) => void;
    styleSider: { zIndex: number };
    items: MenuItemSMEProps[];
    logoMenu: ReactNode;
}

const pushMock = vi.fn();
const prefetchMock = vi.fn();
const siderSpy = vi.fn<(props: SiderMockProps) => void>();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
        prefetch: prefetchMock,
    }),
}));

vi.mock("next/image", () => ({
    default: ({ alt = "", ...props }: ImgHTMLAttributes<HTMLImageElement>) => {
        // Mock do next/image: um <img> simples basta para os testes.
        // oxlint-disable-next-line next/no-img-element
        return <img alt={alt} {...props} />;
    },
}));

vi.mock("@/assets/images/logo-signa-completo-branco.png", () => ({
    default: "/logo-signa.png",
}));

vi.mock("../Sider", () => ({
    default: (props: SiderMockProps) => {
        siderSpy(props);
        return (
            <div>
                <div data-testid="logo-container">{props.logoMenu}</div>
                <button
                    data-testid="trigger-item-with-url"
                    onClick={() =>
                        props.onClick({
                            key: "leaf",
                            title: "Item com URL",
                            url: "/pages/meus-dados",
                        })
                    }
                >
                    click-with-url
                </button>
                <button
                    data-testid="trigger-item-without-url"
                    onClick={() =>
                        props.onClick({
                            key: "no-url",
                            title: "Item sem URL",
                        })
                    }
                >
                    click-without-url
                </button>
            </div>
        );
    },
}));

describe("app-new-sidebar", () => {
    beforeEach(() => {
        pushMock.mockClear();
        prefetchMock.mockClear();
        siderSpy.mockClear();
    });

    it("define menus exportados com as chaves esperadas", () => {
        expect(MENU_MEUS_DADOS.key).toBe(MenuEnum.MeusDados);
        expect(MENU_DESIGNACAO.key).toBe(MenuEnum.Designacao);
        expect(MENU_NOMEACAO.key).toBe(MenuEnum.Nomeacao);
        expect(MENU_PROTOCOLO.key).toBe(MenuEnum.Protocolo);
        expect(MENU_APOIO_ADMINISTRATIVO.key).toBe(MenuEnum.ApoioAdministrativo);
        expect(MENU_GESTAO.key).toBe(MenuEnum.Gestao);

        expect(menus).toEqual([
            MENU_DESIGNACAO,
            MENU_NOMEACAO,
            MENU_PROTOCOLO,
            MENU_APOIO_ADMINISTRATIVO,
            MENU_GESTAO,
            MENU_MEUS_DADOS,
        ]);
    });

    it("mantém Protocolo, Apoio administrativo, Meus dados e Nomeação sem filhos e com url própria", () => {
        expect(MENU_PROTOCOLO.children).toBeUndefined();
        expect(MENU_PROTOCOLO.url).toBe("/pages/protocolo");

        expect(MENU_APOIO_ADMINISTRATIVO.children).toBeUndefined();
        expect(MENU_APOIO_ADMINISTRATIVO.url).toBe("/pages/apoio-administrativo");
        expect(MENU_APOIO_ADMINISTRATIVO.collapsedTitle).toBe("Apoio admin.");

        expect(MENU_MEUS_DADOS.children).toBeUndefined();
        expect(MENU_MEUS_DADOS.url).toBe("/pages/meus-dados");

        expect(MENU_NOMEACAO.children).toBeUndefined();
        expect(MENU_NOMEACAO.url).toBe("/pages/nomeacao");
    });

    it("define Designações com os filhos de atos, publicação, laudas, cargos base e textos de portaria", () => {
        expect(MENU_DESIGNACAO.url).toBeUndefined();
        expect(MENU_DESIGNACAO.children?.map(({ title, url }) => ({ title, url }))).toEqual([
            { title: "Atos administrativos", url: "/pages/atos-administrativos" },
            { title: "Publicação no Diário Oficial", url: "/pages/alterar-data-do" },
            { title: "Laudas", url: "/pages/baixar-lauda" },
            { title: "Cargos base", url: "/pages/gestao/cargos-base" },
            { title: "Textos de portaria", url: "/pages/gestao/textos-de-portaria" },
        ]);
    });

    it("define Gestão com os filhos de acessos e remetentes", () => {
        expect(MENU_GESTAO.url).toBeUndefined();
        expect(MENU_GESTAO.children).toEqual([
            {
                key: MenuEnum.GestaoDeAcessos,
                title: "Gestão de acessos",
                url: "/pages/gestao/gestao-de-acessos",
            },
            {
                key: MenuEnum.GestaoDeRemetentes,
                title: "Gestão de remetentes",
                url: "/pages/gestao/gestao-de-remetentes",
            },
        ]);
    });

    it("renderiza Sider com props esperadas e navega apenas quando item tem url", () => {
        render(<AppNewSidebar />);

        expect(siderSpy).toHaveBeenCalledTimes(1);
        const firstCallProps = siderSpy.mock.calls[0][0];

        expect(firstCallProps.styleSider).toEqual({ zIndex: 12 });
        expect(firstCallProps.items).toBe(menus);
        expect(screen.getByAltText("Logo Signa")).toBeInTheDocument();
        expect(prefetchMock).toHaveBeenCalledWith("/pages/atos-administrativos");
        expect(prefetchMock).toHaveBeenCalledWith("/pages/meus-dados");
        expect(prefetchMock).toHaveBeenCalledWith("/pages/gestao/cargos-base");
        expect(prefetchMock).toHaveBeenCalledWith("/pages/gestao/textos-de-portaria");
        expect(prefetchMock).toHaveBeenCalledWith("/pages/protocolo");
        expect(prefetchMock).toHaveBeenCalledWith("/pages/apoio-administrativo");
        expect(prefetchMock).toHaveBeenCalledWith("/pages/gestao/gestao-de-acessos");
        expect(prefetchMock).toHaveBeenCalledWith("/pages/gestao/gestao-de-remetentes");

        fireEvent.click(screen.getByTestId("trigger-item-with-url"));
        expect(pushMock).toHaveBeenCalledWith("/pages/meus-dados");

        fireEvent.click(screen.getByTestId("trigger-item-without-url"));
        expect(pushMock).toHaveBeenCalledTimes(1);
    });

    it("pré-carrega todas as rotas dos menus uma única vez", () => {
        render(<AppNewSidebar />);

        const urlsEsperadas = [
            "/pages/atos-administrativos",
            "/pages/alterar-data-do",
            "/pages/baixar-lauda",
            "/pages/gestao/cargos-base",
            "/pages/gestao/textos-de-portaria",
            "/pages/nomeacao",
            "/pages/protocolo",
            "/pages/apoio-administrativo",
            "/pages/gestao/gestao-de-acessos",
            "/pages/gestao/gestao-de-remetentes",
            "/pages/meus-dados",
        ];
        const urlsPrefetchadas = prefetchMock.mock.calls.map(([url]) => url);

        expect(urlsPrefetchadas).toHaveLength(urlsEsperadas.length);
        expect(new Set(urlsPrefetchadas)).toEqual(new Set(urlsEsperadas));
    });

    it("mantém chaves únicas em todos os níveis do menu", () => {
        const coletarChaves = (itens: MenuItemConectaProps[]): Key[] =>
            itens.flatMap((item) => [
                item.key,
                ...(item.children ? coletarChaves(item.children) : []),
            ]);

        const chaves = coletarChaves(menus);

        expect(chaves.length).toBeGreaterThan(0);
        expect(new Set(chaves).size).toBe(chaves.length);
    });
});
