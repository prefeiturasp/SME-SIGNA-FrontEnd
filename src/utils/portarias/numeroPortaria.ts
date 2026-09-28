/**
 * Limites de numero_portaria.
 *
 * A coluna é um integer (int4) no Postgres, então o valor válido vai de 1 a
 * 2147483647. O limite anterior — 20 caracteres — vinha do varchar(20) que a
 * coluna tinha antes e deixou de existir.
 */
export const NUMERO_PORTARIA_MAX = 2147483647;
export const NUMERO_PORTARIA_MAX_DIGITOS = String(NUMERO_PORTARIA_MAX).length;
export const NUMERO_PORTARIA_MAX_LABEL = "2.147.483.647";

/**
 * Indica se o valor ultrapassa o teto do integer.
 *
 * Só acusa em valor puramente numérico e dentro do limite de dígitos, para não
 * duplicar a mensagem dos checks de formato e de tamanho que rodam junto.
 */
export const excedeNumeroPortaria = (valor: string) =>
  /^\d+$/.test(valor) &&
  valor.length <= NUMERO_PORTARIA_MAX_DIGITOS &&
  Number(valor) > NUMERO_PORTARIA_MAX;
