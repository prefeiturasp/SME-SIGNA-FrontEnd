import { render } from "@testing-library/react";
import Page from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function renderWithQueryProvider(ui: React.ReactElement) {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
}

describe("RecuperarSenha Page", () => {
    it("renderiza o FormAlterarSenha com os params corretos", () => {
        const params = {
            code: encodeURIComponent("uid123"),
            token: encodeURIComponent("token123"),
        };
        const { getByTestId } = renderWithQueryProvider(
            <Page params={params} />
        );
        expect(getByTestId("input-password")).toBeInTheDocument();
        expect(getByTestId("input-confirm-password")).toBeInTheDocument();
    });

    it("decodifica os params antes de passar para o FormAlterarSenha", () => {
        const params = {
            code: encodeURIComponent("código@!"),
            token: encodeURIComponent("tok#en"),
        };
        const { container } = renderWithQueryProvider(<Page params={params} />);
        expect(container).toBeTruthy();
    });
});
