export function preencherTemplate(
    template: string,
    dados: Record<string, any>
): string {
    return template.replaceAll(/{{([^{}]*)}}/g, (_, chave: string) => {
        const valor = dados[chave.trim()];
        return valor !== undefined && valor !== null && valor !== ""
            ? String(valor)
                .replaceAll("<​br>", "\n")
                .replaceAll("<​BR>", "\n")
                .replaceAll("<​br/>", "\n")
                .replaceAll("<​BR/>", "\n")
                .replaceAll("<​br />", "\n")
                .replaceAll("<​BR />", "\n")
            : "____";
    });
}