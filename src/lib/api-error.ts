import { toAxiosError } from "@/lib/axios-error";

export function handleApiError(
    err: unknown,
    defaultMessage: string
): string {
    const error = toAxiosError<{ detail?: string }>(err);

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