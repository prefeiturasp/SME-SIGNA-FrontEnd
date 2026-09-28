import axios from "axios";
import { cookies } from "next/headers";
import { toAxiosError } from "@/lib/axios-error";

// O token fica em cookie httpOnly, então o browser não consegue chamar o
// backend direto. Este handler repassa o arquivo gerado pelo backend (PDF ou
// Word) mantendo Content-Type e Content-Disposition (nome do arquivo).
export async function POST(request: Request): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return Response.json({ detail: "Usuário não autenticado" }, { status: 401 });
  }

  const payload = await request.json();

  try {
    const response = await axios.post<ArrayBuffer>(
      `${process.env.NEXT_PUBLIC_API_URL}/designacao/portarias/lauda/`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "arraybuffer",
      }
    );

    const headers = new Headers();
    for (const name of ["content-type", "content-disposition"]) {
      const value = response.headers[name];
      if (typeof value === "string") headers.set(name, value);
    }

    return new Response(response.data, { status: 200, headers });
  } catch (err) {
    const error = toAxiosError<ArrayBuffer>(err);
    const status = error.response?.status ?? 500;

    return Response.json({ detail: extractDetail(error.response?.data) }, { status });
  }
}

// Com responseType "arraybuffer" o corpo do erro também chega binário;
// decodifica para recuperar o `detail` que o exception handler do backend envia.
const extractDetail = (data: ArrayBuffer | undefined): string => {
  const fallback = "Erro ao gerar a lauda";
  if (!data) return fallback;

  try {
    const parsed = JSON.parse(Buffer.from(data).toString("utf-8"));
    return typeof parsed?.detail === "string" ? parsed.detail : fallback;
  } catch {
    return fallback;
  }
};
