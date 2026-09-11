export function preencherTemplate(
    template: string,
    dados: Record<string, unknown>
): string {
    return template.replaceAll(/{{([^{}]*)}}/g, (_, chave: string) => {
        const valor = dados[chave.trim()];
        if (valor === undefined || valor === null) return "____";
        if (valor === "") return "";
        return String(valor)
            .replaceAll("<​br>", "\n")
            .replaceAll("<​BR>", "\n")
            .replaceAll("<​br/>", "\n")
            .replaceAll("<​BR/>", "\n")
            .replaceAll("<​br />", "\n")
            .replaceAll("<​BR />", "\n");
    });
}