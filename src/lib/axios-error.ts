import axios, { AxiosError } from "axios";

/**
 * Estreita um erro `unknown` de bloco catch para AxiosError<T>, verificado
 * em tempo de execução via axios.isAxiosError. Erros que não são do Axios
 * (ex: lançados antes da requisição ser feita) são envolvidos num AxiosError
 * com response vazio, para os chamadores continuarem lendo `.response`/`.message`
 * sem precisar checar de novo.
 */
export function toAxiosError<T = unknown>(err: unknown): AxiosError<T> {
  if (axios.isAxiosError(err)) {
    return err as AxiosError<T>;
  }

  return new AxiosError<T>(extractMessage(err));
}

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "";
}
