import { BRAZILIAN_UFS } from "../../domain/uf";

type AddressFormProps = {
  uf: string;
  city: string;
  street: string;
  loading: boolean;
  errorId?: string;
  errorMessage?: string;
  onUfChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStreetChange: (value: string) => void;
  onSubmit: () => void;
};

export function AddressForm({
  uf,
  city,
  street,
  loading,
  errorId,
  errorMessage,
  onUfChange,
  onCityChange,
  onStreetChange,
  onSubmit,
}: AddressFormProps) {
  return (
    <form
      className="search-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="field">
        <label htmlFor="uf">UF</label>
        <select
          id="uf"
          name="uf"
          value={uf}
          disabled={loading}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          onChange={(event) => onUfChange(event.target.value)}
        >
          <option value="">Selecione</option>
          {BRAZILIAN_UFS.map((item) => (
            <option key={item.code} value={item.code}>
              {item.code} — {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="city">Cidade</label>
        <input
          id="city"
          name="city"
          autoComplete="address-level2"
          placeholder="Ex.: Porto Alegre"
          value={city}
          disabled={loading}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          onChange={(event) => onCityChange(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="street">Logradouro</label>
        <input
          id="street"
          name="street"
          autoComplete="street-address"
          placeholder="Ex.: Domingos"
          value={street}
          disabled={loading}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          onChange={(event) => onStreetChange(event.target.value)}
        />
      </div>
      {errorMessage ? (
        <p id={errorId} className="field-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <button type="submit" disabled={loading}>
        {loading ? "Consultando…" : "Buscar"}
      </button>
    </form>
  );
}
