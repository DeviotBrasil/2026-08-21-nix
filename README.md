# 2026-08-21-nix

Projeto utilizando servidor MCP para Obsidian e um app React de consulta à ViaCEP.

## Consulta de endereços (ViaCEP)

```bash
cd web
npm install
npm run dev
```

A aplicação sobe em Vite e consulta `https://viacep.com.br` direto do navegador. Opcional: defina `VITE_VIACEP_BASE_URL` para apontar a outro host.
