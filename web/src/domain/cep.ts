const CEP_DIGITS = /^\d{8}$/;

/** Remove tudo que não for dígito. */
export function normalizeCep(input: string): string {
  return input.replace(/\D/g, "");
}

export function isValidCep(digits: string): boolean {
  return CEP_DIGITS.test(digits);
}

/** Máscara visual `00000-000` a partir da digitação. */
export function formatCepMask(input: string): string {
  const digits = normalizeCep(input).slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
