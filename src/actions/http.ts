import { getApiClient } from "@/lib/api";
import { handleApiError } from "@/lib/api-error";

export const sanitizeParams = (filtros: object) => {
  return Object.fromEntries(
    Object.entries(filtros).filter(
      ([_, v]) => v !== "" && v !== undefined && v !== null
    )
  );
};

export const fetchWithClient = async <T>(
  url: string,
  filtros: object,
  errorMessage: string
): Promise<{ success: true; data: T } | { success: false; error: string }> => {
  const apiClient = await getApiClient();

  if (!apiClient) {
    return { success: false, error: "Usuário não autenticado" };
  }

  const params = sanitizeParams(filtros);
  try {
    const { data } = await apiClient.get<T>(url, { params });
    return { success: true, data };
  } catch (err) {
    const message = handleApiError(err, errorMessage);
    return { success: false, error: message };
  }
};
