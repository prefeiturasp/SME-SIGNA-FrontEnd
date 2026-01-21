export type AtualizarSenhaRequest = {
    senha_atual: string;
    nova_senha: string;
    confirmacao_nova_senha: string;
};

export type AtualizarSenhaErrorResponse = {
    detail?: string;
    field?: string;
};

export type AtualizarSenhaResult =
    | { success: true }
    | { success: false; error: string; field?: string };
