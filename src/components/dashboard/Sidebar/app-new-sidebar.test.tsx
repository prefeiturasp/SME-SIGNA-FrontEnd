import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import {
    AppNewSidebar,
    MENU_APOIO_ADMINISTRATIVO,
    MENU_DESIGNACAO,
    MENU_MEUS_DADOS,
    MENU_NOMEACAO,
    MENU_PROTOCOLO,
    MenuEnum,
    menus,
} from "./app-new-sidebar";

const pushMock = vi.fn();
const siderSpy = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));

vi.mock("next/image", () => ({
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

vi.mock("@/assets/images/logo-signa-completo-branco.png", () => ({
    default: "/logo-signa.png",
}));

vi.mock("../Sider", () => ({
    default: (props: {
        onClick: (item: { key: string; title: string; url?: string }) => void;
        styleSider: { zIndex: number };
        items: unknown[];
        logoMenu: React.ReactNode;
    }) => {
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
        siderSpy.mockClear();
    });

    it("define menus exportados com as chaves esperadas", () => {
        expect(MENU_MEUS_DADOS.key).toBe(MenuEnum.MeusDados);
        expect(MENU_DESIGNACAO.key).toBe(MenuEnum.Designacao);
        expect(MENU_NOMEACAO.key).toBe(MenuEnum.Nomeacao);
        expect(MENU_PROTOCOLO.key).toBe(MenuEnum.Protocolo);
        expect(MENU_APOIO_ADMINISTRATIVO.key).toBe(MenuEnum.ApoioAdministrativo);

        expect(menus).toEqual([
            MENU_MEUS_DADOS,
            MENU_DESIGNACAO,
            MENU_NOMEACAO,
            MENU_PROTOCOLO,
            MENU_APOIO_ADMINISTRATIVO,
        ]);
    });

    it("renderiza Sider com props esperadas e navega apenas quando item tem url", () => {
        render(<AppNewSidebar />);

        expect(siderSpy).toHaveBeenCalledTimes(1);
        const firstCallProps = siderSpy.mock.calls[0][0] as {
            styleSider: { zIndex: number };
            items: unknown[];
        };

        expect(firstCallProps.styleSider).toEqual({ zIndex: 12 });
        expect(firstCallProps.items).toBe(menus);
        expect(screen.getByAltText("Logo Signa")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("trigger-item-with-url"));
        expect(pushMock).toHaveBeenCalledWith("/pages/meus-dados");

        fireEvent.click(screen.getByTestId("trigger-item-without-url"));
        expect(pushMock).toHaveBeenCalledTimes(1);
    });
});
