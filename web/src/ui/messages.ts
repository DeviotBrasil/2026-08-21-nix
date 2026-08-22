import type { SearchMode } from "../domain/address";
import type { ViaCepErrorCode } from "../infrastructure/viacep-errors";

export function messageForError(code: ViaCepErrorCode, mode: SearchMode): string {
  switch (code) {
    case "invalid_cep":
      return "Informe um CEP com 8 números.";
    case "invalid_address_query":
      return "Selecione a UF e informe cidade e logradouro com pelo menos 3 caracteres.";
    case "not_found":
      return mode === "cep"
        ? "CEP não encontrado na base da ViaCEP."
        : "Nenhum endereço encontrado para essa busca.";
    case "bad_request":
      return "A consulta foi recusada. Verifique os dados e tente de novo.";
    case "network":
      return "Não foi possível consultar a ViaCEP. Verifique a conexão e tente de novo.";
  }
}
