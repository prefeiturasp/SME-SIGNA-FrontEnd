export function preencherTemplate(
    template: string,
    dados: Record<string, any>
): string {
    return template.replaceAll(/{{(.*?)}}/g, (_, chave: string) => {
        const valor = dados[chave.trim()];
        return valor !== undefined && valor !== null && valor !== ""
            ? String(valor)
            : "____";
    });
}