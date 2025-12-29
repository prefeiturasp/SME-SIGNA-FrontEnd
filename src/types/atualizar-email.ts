export type AtualizarEmailRequest = {
    new_email: string;
};

export type AtualizarEmailErrorResponse = {
    detail?: string;
    field?: string;
};

export type AtualizarEmailResult =
    | { success: true }
    | { success: false; error: string; field?: string };
