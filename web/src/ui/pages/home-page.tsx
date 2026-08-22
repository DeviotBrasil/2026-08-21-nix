import { useEffect, useRef, useState } from "react";
import { searchByAddress } from "../../application/search-by-address";
import { searchByCep } from "../../application/search-by-cep";
import type { Address, SearchMode } from "../../domain/address";
import type { ViaCepErrorCode } from "../../infrastructure/viacep-errors";
import { createRequestSwitcher } from "../../lib/abort";
import { AddressCard } from "../components/address-card";
import { AddressForm } from "../components/address-form";
import { CepForm } from "../components/cep-form";
import { ResultList } from "../components/result-list";
import { StatusMessage } from "../components/status-message";
import { messageForError } from "../messages";

type ViewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; address: Address }
  | { status: "success_list"; addresses: Address[] }
  | { status: "empty"; message: string }
  | { status: "error"; message: string; field?: boolean };

function logDomainError(code: ViaCepErrorCode): void {
  if (import.meta.env.DEV) {
    console.error(code);
  }
}

export function HomePage() {
  const switcher = useRef(createRequestSwitcher());
  const [mode, setMode] = useState<SearchMode>("cep");
  const [cep, setCep] = useState("");
  const [uf, setUf] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [view, setView] = useState<ViewState>({ status: "idle" });
  const [selected, setSelected] = useState<Address | null>(null);

  useEffect(() => {
    const current = switcher.current;
    return () => current.abort();
  }, []);

  const loading = view.status === "loading";
  const fieldError = view.status === "error" && view.field ? view.message : undefined;

  function resetResults(): void {
    setSelected(null);
    setView({ status: "idle" });
  }

  function changeMode(next: SearchMode): void {
    if (next === mode) {
      return;
    }
    switcher.current.abort();
    setMode(next);
    resetResults();
  }

  function applyError(code: ViaCepErrorCode): void {
    logDomainError(code);
    const message = messageForError(code, mode);
    if (code === "not_found") {
      setView({ status: "empty", message });
      return;
    }
    const field = code === "invalid_cep" || code === "invalid_address_query";
    setView({ status: "error", message, field });
  }

  async function handleCepSearch(): Promise<void> {
    const signal = switcher.current.next();
    setSelected(null);
    setView({ status: "loading" });
    const result = await searchByCep(cep, signal);
    if (result.kind === "aborted") {
      return;
    }
    if (result.kind === "error") {
      applyError(result.error);
      return;
    }
    setView({ status: "success", address: result.data });
  }

  async function handleAddressSearch(): Promise<void> {
    const signal = switcher.current.next();
    setSelected(null);
    setView({ status: "loading" });
    const result = await searchByAddress({ uf, city, street }, signal);
    if (result.kind === "aborted") {
      return;
    }
    if (result.kind === "error") {
      applyError(result.error);
      return;
    }
    setView({ status: "success_list", addresses: result.data });
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Consulta de endereços</h1>
        <p>Busque um endereço brasileiro pelo CEP ou descubra o CEP a partir da rua.</p>
      </header>

      <div className="tabs" role="tablist" aria-label="Tipo de busca">
        <button
          type="button"
          role="tab"
          id="tab-cep"
          aria-controls="panel-cep"
          aria-selected={mode === "cep"}
          className={mode === "cep" ? "tab is-active" : "tab"}
          onClick={() => changeMode("cep")}
        >
          Por CEP
        </button>
        <button
          type="button"
          role="tab"
          id="tab-address"
          aria-controls="panel-address"
          aria-selected={mode === "address"}
          className={mode === "address" ? "tab is-active" : "tab"}
          onClick={() => changeMode("address")}
        >
          Por endereço
        </button>
      </div>

      <section
        id={mode === "cep" ? "panel-cep" : "panel-address"}
        role="tabpanel"
        aria-labelledby={mode === "cep" ? "tab-cep" : "tab-address"}
        className="panel"
        aria-busy={loading}
      >
        {mode === "cep" ? (
          <CepForm
            value={cep}
            loading={loading}
            errorId="cep-error"
            errorMessage={fieldError}
            onChange={setCep}
            onSubmit={() => void handleCepSearch()}
          />
        ) : (
          <AddressForm
            uf={uf}
            city={city}
            street={street}
            loading={loading}
            errorId="address-error"
            errorMessage={fieldError}
            onUfChange={setUf}
            onCityChange={setCity}
            onStreetChange={setStreet}
            onSubmit={() => void handleAddressSearch()}
          />
        )}

        {loading ? <StatusMessage tone="info">Consultando a ViaCEP…</StatusMessage> : null}

        {view.status === "error" && !fieldError ? (
          <StatusMessage tone="error">{view.message}</StatusMessage>
        ) : null}

        {view.status === "empty" ? <StatusMessage tone="empty">{view.message}</StatusMessage> : null}

        {view.status === "success" ? <AddressCard address={view.address} /> : null}

        {view.status === "success_list" ? (
          <>
            <p className="result-count" role="status">
              {view.addresses.length} resultado{view.addresses.length === 1 ? "" : "s"}
            </p>
            <ResultList addresses={view.addresses} selected={selected} onSelect={setSelected} />
            {selected ? <AddressCard address={selected} /> : null}
          </>
        ) : null}
      </section>
    </main>
  );
}
