import type { Address } from "../domain/address";
import { isValidPlaceName } from "../domain/address";
import { isValidUf } from "../domain/uf";
import { fetchAddressesByPlace } from "../infrastructure/viacep-client";
import type { SearchOutcome } from "../infrastructure/viacep-errors";

export type AddressQuery = {
  uf: string;
  city: string;
  street: string;
};

export async function searchByAddress(
  query: AddressQuery,
  signal: AbortSignal,
): Promise<SearchOutcome<Address[]>> {
  if (!isValidUf(query.uf) || !isValidPlaceName(query.city) || !isValidPlaceName(query.street)) {
    return { kind: "error", error: "invalid_address_query" };
  }
  return fetchAddressesByPlace(query.uf, query.city, query.street, signal);
}
