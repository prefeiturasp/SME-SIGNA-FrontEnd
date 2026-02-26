export type ConfirmarEmailRequest = {
    code: string;
};

export type ConfirmarEmailErrorResponse = {
    detail?: string;
    field?: string;
};

export type ConfirmarEmailResult =
    | { success: true; new_mail: string }
    | { success: false; error: string; field?: string };
