import { AxiosError } from "axios";

export function handleApiError(
    err: unknown,
    defaultMessage: string
): string {
    const error = err as AxiosError<{ detail?: string }>;

    if (error.response?.status === 401) {
        return "Não autorizado. Faça login novamente.";
    }

    if (error.response?.status === 400) {
        return defaultMessage;
    }

    if (error.response?.status === 500) {
        return "Erro interno no servidor";
    }

    if (error.response?.data?.detail) {
        return error.response.data.detail;
    }

    return error.message || "Erro inesperado";
}