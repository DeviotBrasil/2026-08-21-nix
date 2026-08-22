import type { Address } from "../domain/address";
import { isValidCep, normalizeCep } from "../domain/cep";
import { fetchAddressByCep } from "../infrastructure/viacep-client";
import type { SearchOutcome } from "../infrastructure/viacep-errors";

export async function searchByCep(
  cep: string,
  signal: AbortSignal,
): Promise<SearchOutcome<Address>> {
  const digits = normalizeCep(cep);
  if (!isValidCep(digits)) {
    return { kind: "error", error: "invalid_cep" };
  }
  return fetchAddressByCep(digits, signal);
}
