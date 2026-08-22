import type { Address } from "../../domain/address";

type AddressCardProps = {
  address: Address;
};

const LABELS: { key: keyof Address; label: string }[] = [
  { key: "zipCode", label: "CEP" },
  { key: "street", label: "Logradouro" },
  { key: "complement", label: "Complemento" },
  { key: "unit", label: "Unidade" },
  { key: "district", label: "Bairro" },
  { key: "city", label: "Cidade" },
  { key: "stateCode", label: "UF" },
  { key: "stateName", label: "Estado" },
  { key: "region", label: "Região" },
  { key: "areaCode", label: "DDD" },
  { key: "ibge", label: "IBGE" },
  { key: "gia", label: "GIA" },
  { key: "siafi", label: "SIAFI" },
];

export function AddressCard({ address }: AddressCardProps) {
  const fields = LABELS.filter((item) => address[item.key].trim() !== "");

  return (
    <article className="address-card">
      <h2>Endereço</h2>
      <dl>
        {fields.map((item) => (
          <div key={item.key} className="address-row">
            <dt>{item.label}</dt>
            <dd>{address[item.key]}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
