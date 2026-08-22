import { formatCepMask } from "../../domain/cep";

type CepFormProps = {
  value: string;
  loading: boolean;
  errorId?: string;
  errorMessage?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function CepForm({
  value,
  loading,
  errorId,
  errorMessage,
  onChange,
  onSubmit,
}: CepFormProps) {
  return (
    <form
      className="search-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="field">
        <label htmlFor="cep">CEP</label>
        <input
          id="cep"
          name="cep"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          maxLength={9}
          value={value}
          disabled={loading}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          onChange={(event) => onChange(formatCepMask(event.target.value))}
        />
        {errorMessage ? (
          <p id={errorId} className="field-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Consultando…" : "Buscar"}
      </button>
    </form>
  );
}
