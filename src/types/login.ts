export interface LoginRequest {
    seu_rf: string;
    senha: string;    
}

export interface LoginSuccessResponse {
    name: string;
    email: string;
    cpf: string;
    login: string;
    perfil_acesso: {
        nome: string;
        codigo: number;
    };
    unidade_lotacao: [
        {
            nomeUnidade: string;
            codigo: string;
        }
    ];
    token: string;
}

export interface LoginErrorResponse {
    detail: string;
}
