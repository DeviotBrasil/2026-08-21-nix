/** Troca o AbortController a cada busca, cancelando a anterior. */
export function createRequestSwitcher() {
  let controller: AbortController | null = null;

  return {
    next(): AbortSignal {
      controller?.abort();
      controller = new AbortController();
      return controller.signal;
    },
    abort(): void {
      controller?.abort();
      controller = null;
    },
  };
}
