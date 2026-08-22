export type ViaCepErrorCode =
  | "invalid_cep"
  | "invalid_address_query"
  | "not_found"
  | "bad_request"
  | "network";

export type SearchOutcome<T> =
  | { kind: "ok"; data: T }
  | { kind: "error"; error: ViaCepErrorCode }
  | { kind: "aborted" };
