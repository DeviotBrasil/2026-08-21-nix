export type SearchMode = "cep" | "address";

export type Address = {
  zipCode: string;
  street: string;
  complement: string;
  unit: string;
  district: string;
  city: string;
  stateCode: string;
  stateName: string;
  region: string;
  ibge: string;
  gia: string;
  areaCode: string;
  siafi: string;
};

export function isValidPlaceName(value: string): boolean {
  return value.trim().length >= 3;
}
