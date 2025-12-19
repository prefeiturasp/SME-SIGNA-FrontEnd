export type RedefinirSenhaRequest = {
    uid: string;
    token: string;
    password: string;
    password2: string;
};

export type RedefinirSenhaErrorResponse = {
    detail?: string;
    errors?: {
        non_field_errors?: string[];
        [key: string]: string[] | undefined;
    };
};

export type RedefinirSenhaResult =
    | { success: true }
    | { success: false; error: string };
