import type { Address } from "../../domain/address";

type ResultListProps = {
  addresses: Address[];
  selected: Address | null;
  onSelect: (address: Address) => void;
};

function summary(address: Address): string {
  const parts = [address.street, address.district, address.city, address.stateCode].filter(
    (part) => part.trim() !== "",
  );
  return parts.join(" · ");
}

export function ResultList({ addresses, selected, onSelect }: ResultListProps) {
  return (
    <ul className="result-list">
      {addresses.map((address, index) => {
        const key = `${address.zipCode}-${address.street}-${index}`;
        const isSelected = address === selected;
        return (
          <li key={key}>
            <button
              type="button"
              className={isSelected ? "result-item is-selected" : "result-item"}
              aria-pressed={isSelected}
              onClick={() => onSelect(address)}
            >
              <span className="result-cep">{address.zipCode || "CEP não informado"}</span>
              <span className="result-summary">{summary(address)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
