import type { Address } from "../domain/address";
import type { SearchOutcome } from "./viacep-errors";

const DEFAULT_BASE_URL = "https://viacep.com.br";
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_ADDRESS_RESULTS = 50;

type ViaCepRaw = {
  cep?: unknown;
  logradouro?: unknown;
  complemento?: unknown;
  unidade?: unknown;
  bairro?: unknown;
  localidade?: unknown;
  uf?: unknown;
  estado?: unknown;
  regiao?: unknown;
  ibge?: unknown;
  gia?: unknown;
  ddd?: unknown;
  siafi?: unknown;
  erro?: unknown;
};

function getBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_VIACEP_BASE_URL;
  const raw = typeof fromEnv === "string" && fromEnv.trim() !== "" ? fromEnv : DEFAULT_BASE_URL;
  return raw.replace(/\/+$/, "");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function hasErrorFlag(payload: Record<string, unknown>): boolean {
  const erro = payload.erro;
  return erro === true || erro === "true";
}

function mapAddress(raw: ViaCepRaw): Address {
  const record = raw as Record<string, unknown>;
  return {
    zipCode: readString(record, "cep"),
    street: readString(record, "logradouro"),
    complement: readString(record, "complemento"),
    unit: readString(record, "unidade"),
    district: readString(record, "bairro"),
    city: readString(record, "localidade"),
    stateCode: readString(record, "uf"),
    stateName: readString(record, "estado"),
    region: readString(record, "regiao"),
    ibge: readString(record, "ibge"),
    gia: readString(record, "gia"),
    areaCode: readString(record, "ddd"),
    siafi: readString(record, "siafi"),
  };
}

async function getJson(url: string, signal: AbortSignal): Promise<SearchOutcome<unknown>> {
  const timeout = new AbortController();
  const timer = window.setTimeout(() => timeout.abort(), REQUEST_TIMEOUT_MS);
  const combined = AbortSignal.any([signal, timeout.signal]);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: combined,
    });

    if (response.status === 400) {
      return { kind: "error", error: "bad_request" };
    }

    if (!response.ok) {
      return { kind: "error", error: "network" };
    }

    try {
      return { kind: "ok", data: await response.json() };
    } catch {
      return { kind: "error", error: "network" };
    }
  } catch {
    if (signal.aborted) {
      return { kind: "aborted" };
    }
    return { kind: "error", error: "network" };
  } finally {
    window.clearTimeout(timer);
  }
}

export async function fetchAddressByCep(
  cepDigits: string,
  signal: AbortSignal,
): Promise<SearchOutcome<Address>> {
  const url = `${getBaseUrl()}/ws/${cepDigits}/json/`;
  const result = await getJson(url, signal);
  if (result.kind !== "ok") {
    return result;
  }

  const record = asRecord(result.data);
  if (!record) {
    return { kind: "error", error: "network" };
  }
  if (hasErrorFlag(record)) {
    return { kind: "error", error: "not_found" };
  }
  return { kind: "ok", data: mapAddress(record) };
}

export async function fetchAddressesByPlace(
  uf: string,
  city: string,
  street: string,
  signal: AbortSignal,
): Promise<SearchOutcome<Address[]>> {
  const ufCode = uf.trim().toUpperCase();
  const cityPart = encodeURIComponent(city.trim());
  const streetPart = encodeURIComponent(street.trim());
  const url = `${getBaseUrl()}/ws/${ufCode}/${cityPart}/${streetPart}/json/`;
  const result = await getJson(url, signal);
  if (result.kind !== "ok") {
    return result;
  }

  if (!Array.isArray(result.data)) {
    const record = asRecord(result.data);
    if (record && hasErrorFlag(record)) {
      return { kind: "error", error: "not_found" };
    }
    return { kind: "error", error: "network" };
  }

  if (result.data.length === 0) {
    return { kind: "error", error: "not_found" };
  }

  const addresses = result.data
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => item !== null)
    .filter((item) => !hasErrorFlag(item))
    .map((item) => mapAddress(item))
    .slice(0, MAX_ADDRESS_RESULTS);

  if (addresses.length === 0) {
    return { kind: "error", error: "not_found" };
  }

  return { kind: "ok", data: addresses };
}
