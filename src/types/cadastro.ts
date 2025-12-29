export type CadastroResult =
    | { success: true }
    | { success: false; error: string; field?: string };

export interface CadastroRequest {
    username: string;
    name: string;
    cpf: string;
    email: string;
    unidades: string[];
}

export interface CadastroErrorResponse {
    detail: string;
    field?: string;
}