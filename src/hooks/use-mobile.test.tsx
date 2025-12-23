import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "./use-mobile";

type MediaQueryListEvent = { matches: boolean };
let listeners: Array<(e: MediaQueryListEvent) => void> = [];
beforeAll(() => {
    window.matchMedia = (query: string) =>
        ({
            get matches() {
                return window.innerWidth < 768;
            },
            media: query,
            onchange: null,
            addEventListener: (
                _event: string,
                cb: (e: MediaQueryListEvent) => void
            ) => {
                listeners.push(cb);
            },
            removeEventListener: (
                _event: string,
                cb: (e: MediaQueryListEvent) => void
            ) => {
                listeners = listeners.filter((fn) => fn !== cb);
            },
            dispatchEvent: () => {},
        } as unknown as MediaQueryList);
});

const setWindowWidth = (width: number) => {
    window.innerWidth = width;
    window.dispatchEvent(new Event("resize"));
    listeners.forEach((cb) => cb({ matches: width < 768 }));
};

describe("useIsMobile", () => {
    beforeEach(() => {
        setWindowWidth(1024);
    });

    it("deve retornar false quando a largura da janela for maior ou igual ao breakpoint", () => {
        setWindowWidth(1024);
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
    });

    it("deve retornar true quando a largura da janela for menor que o breakpoint", () => {
        setWindowWidth(500);
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
    });

    it("deve atualizar o valor ao redimensionar a janela", () => {
        setWindowWidth(1024);
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
        act(() => {
            setWindowWidth(500);
        });
        expect(result.current).toBe(true);
        act(() => {
            setWindowWidth(900);
        });
        expect(result.current).toBe(false);
    });
});
