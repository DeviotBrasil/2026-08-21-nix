# PRD — Consulta de Endereços ViaCEP

**Produto:** aplicativo web para consulta de endereços brasileiros  
**Versão:** 1.0  
**Data:** 2026-08-21  
**Status:** rascunho para implementação  
**Fonte da API:** [ViaCEP](https://viacep.com.br/) (base em 21/08/2026: 1.600.730 CEPs)

---

## 1. Visão

Permitir que qualquer pessoa consulte, no navegador, o endereço correspondente a um CEP brasileiro — ou descubra o CEP a partir de UF, cidade e logradouro — usando o webservice público e gratuito da ViaCEP.

O produto é uma SPA em React, sem autenticação e sem backend próprio na versão inicial.

## 2. Problema

Em cadastros e conferências do dia a dia, o usuário precisa do endereço completo ou do CEP e não quer (ou não consegue) consultar o Correios manualmente. A ViaCEP já resolve a consulta, mas não oferece uma interface própria para o uso ocasional com validação, feedback de erro e pesquisa reversa em um único lugar.

## 3. Objetivos

1. Consultar endereço a partir de um CEP válido de 8 dígitos.
2. Pesquisar até 50 CEPs a partir de UF + cidade + logradouro.
3. Impedir chamadas inválidas à API (formato de CEP, tamanho mínimo de cidade/logradouro).
4. Exibir estados claros: ocioso, carregando, sucesso, vazio e erro.
5. Respeitar o aviso da ViaCEP contra uso massivo (sem varredura, sem validação em lote).

## 4. Público-alvo

- Pessoas que preenchem ou conferem endereços no Brasil.
- Desenvolvedores que queiram um exemplo enxuto de consumo da ViaCEP em React.

Não há personas autenticadas nem papéis (admin, operador, etc.).

## 5. Escopo da v1

| Incluído | Não incluído |
| -------- | ------------ |
| Busca por CEP | Conta, login ou backend |
| Busca por endereço (UF, cidade, logradouro) | Persistência em banco |
| Máscara e validação de CEP no cliente | Download ou espelhamento da base de CEPs |
| Lista de resultados (máx. 50) na busca por endereço | Mapa / geolocalização |
| Mensagens de erro em português | Consulta em XML/JSONP |
| Interface responsiva (desktop e mobile) | Validação em lote / scraping |
| Histórico local das últimas buscas (opcional, `localStorage`) | Integração com Correios, IBGE ou outras APIs |

## 6. Jornadas

### 6.1 Consultar por CEP

1. Usuário abre o app e permanece na aba **Por CEP**.
2. Digita o CEP (com ou sem hífen). A máscara exibe `00000-000`.
3. Clica em **Buscar** (ou confirma com Enter).
4. O app só dispara a requisição se o CEP tiver exatamente 8 dígitos numéricos.
5. Enquanto aguarda, exibe estado de carregamento e desabilita o botão.
6. Em sucesso, mostra cartão com logradouro, complemento, bairro, cidade, UF, estado, região, DDD e códigos (IBGE, GIA, SIAFI) quando presentes.
7. Se o CEP não existir, informa que não foi encontrado — sem tratar como falha de rede.

### 6.2 Descobrir o CEP pelo endereço

1. Usuário abre a aba **Por endereço**.
2. Seleciona a UF, informa cidade e logradouro (mínimo de 3 caracteres em cada um).
3. Clica em **Buscar**.
4. O app lista os resultados ordenados pela ViaCEP (proximidade do nome do logradouro), no máximo 50.
5. Usuário pode selecionar um item para ver o detalhe completo (mesmo conjunto de campos da jornada 6.1).

### 6.3 Erro de rede ou HTTP

1. A requisição falha (timeout, 4xx/5xx, CORS, etc.).
2. O app exibe mensagem acionável em português e permite nova tentativa.

## 7. Requisitos funcionais

| ID | Requisito | Prioridade |
| -- | --------- | ---------- |
| RF-01 | Consultar endereço via `GET https://viacep.com.br/ws/{cep}/json/` | Must |
| RF-02 | Aceitar CEP com ou sem hífen; normalizar para 8 dígitos antes da chamada | Must |
| RF-03 | Recusar CEP com tamanho ≠ 8, letras ou espaços **antes** de chamar a API | Must |
| RF-04 | Tratar `{ "erro": true }` como “CEP não encontrado” | Must |
| RF-05 | Consultar lista via `GET https://viacep.com.br/ws/{UF}/{cidade}/{logradouro}/json/` | Must |
| RF-06 | Exigir UF (2 letras), cidade ≥ 3 caracteres e logradouro ≥ 3 caracteres | Must |
| RF-07 | Codificar cidade e logradouro na URL (espaços e acentos) | Must |
| RF-08 | Exibir no máximo os 50 itens devolvidos pela API | Must |
| RF-09 | Mostrar loading, desabilitar submit duplicado e permitir cancelamento visual (ignorar resposta obsoleta) | Must |
| RF-10 | Mensagens de erro distintas: formato inválido, não encontrado, parâmetros curtos, HTTP 400, falha de rede | Must |
| RF-11 | Interface em português (Brasil), acessível (label, foco, `aria-busy`) | Must |
| RF-12 | Layout utilizável em viewport ≥ 360 px | Should |
| RF-13 | Guardar as 5 últimas buscas bem-sucedidas em `localStorage` | Could |
| RF-14 | Copiar endereço formatado para a área de transferência | Could |

## 8. Regras de negócio

Regras derivadas da especificação oficial da ViaCEP ([nota](Projetos/ViaCEP/Especificação%20api.md) no vault).

1. **CEP na URL:** exatamente 8 dígitos, sem hífen, sem espaço, sem letra. Exemplos inválidos que a API responde **400**: `950100100`, `95010A10`, `95010 10`.
2. **CEP inexistente:** formato válido, porém ausente na base (ex.: `99999999`) → JSON com `erro` igual a `"true"` (string ou boolean). Não é 404.
3. **Formato de resposta da v1:** somente JSON. Não usar XML nem JSONP.
4. **Campos de endereço (consulta por CEP):** `cep`, `logradouro`, `complemento`, `unidade`, `bairro`, `localidade`, `uf`, `estado`, `regiao`, `ibge`, `gia`, `ddd`, `siafi`. Campos vazios devem ser omitidos na UI, não exibidos como “—”.
5. **Pesquisa por endereço:** UF, cidade e logradouro são obrigatórios. Cidade e logradouro com menos de 3 caracteres → **400**. Resultado ordenado por proximidade do logradouro, teto de 50 CEPs.
6. **Uma consulta por ação do usuário.** Sem debounce que dispare sozinho a cada tecla. Sem fila de validação em massa.
7. **Uso aceitável:** consultas pontuais feitas por humanos. Uso massivo para validar bases locais pode bloquear o IP na ViaCEP; o produto não oferece essa função.
8. **Sem autenticação.** A ViaCEP não exige chave.
9. **Sem persistência de PII em servidor.** Histórico, se existir, fica só no navegador.

## 9. Requisitos não funcionais

| ID | Requisito |
| -- | --------- |
| RNF-01 | Primeira busca útil em menos de ~2 s em rede doméstica típica (latência da ViaCEP excluída da meta de bundle). |
| RNF-02 | Timeout de 8 s na chamada HTTP; após isso, mensagem de falha de rede. |
| RNF-03 | Bundle inicial enxuto: Vite + React + TypeScript; sem UI kit pesado na v1. |
| RNF-04 | TypeScript strict; validação de entrada no cliente. |
| RNF-05 | Acessibilidade básica: formulários com `label`, erros associados ao campo, contraste adequado. |
| RNF-06 | Não logar CEP ou endereço em serviços externos. Console apenas em desenvolvimento. |

## 10. Fora de escopo (explícito)

- Proxy/BFF, fila, cache em servidor e espelhamento da base ViaCEP.
- Autocomplete contínuo a cada keystroke contra a API.
- Edição colaborativa, favoritos na nuvem, exportação CSV.
- App nativo, PWA com sync offline da base completa.
- Correção de CEP desatualizado (a ViaCEP já tem [formulário próprio](https://viacep.com.br/cep/)).

## 11. Critérios de aceite (v1)

- [ ] CEP `01001000` ou `01001-000` retorna Praça da Sé, Sé, São Paulo/SP.
- [ ] CEP `99999999` mostra “CEP não encontrado”.
- [ ] CEP `95010A10` não chama a API e mostra erro de formato.
- [ ] Busca `RS` + `Porto Alegre` + `Domingos` lista resultados (até 50).
- [ ] Cidade ou logradouro com 2 caracteres não chama a API.
- [ ] Falha de rede exibe mensagem e permite tentar de novo.
- [ ] UI em português, utilizável em mobile.

## 12. Roadmap

| Fase | Entrega |
| ---- | ------- |
| **v1 — MVP** | Busca por CEP e por endereço, validação, estados de UI, TypeScript. |
| **v1.1** | Histórico local, copiar endereço, teclado (Enter). |
| **v2** | Testes de contrato com mocks da ViaCEP, telemetria opcional (sem PII). |
| **v3 (se necessário)** | Proxy próprio apenas se CORS ou bloqueio de IP inviabilizarem o cliente direto. |

## 13. Premissas

1. A ViaCEP continua pública, gratuita e acessível via CORS a partir do navegador (os exemplos oficiais em JavaScript assumem isso).
2. Não há SLA contratual: indisponibilidade da ViaCEP é exibida como falha de rede.
3. Stack: React 19 + Vite + TypeScript. CSS simples (sem Tailwind obrigatório).
4. Idioma da interface: português (Brasil). Código (nomes de variáveis, funções, tipos): inglês.

## 14. Riscos

| Risco | Mitigação |
| ----- | --------- |
| CORS ou bloqueio de IP pela ViaCEP | Documentar fallback de proxy Vite / BFF na arquitetura; não implementar na v1. |
| Campo `erro` como string `"true"` vs boolean | Normalizar no cliente (`erro === true \|\| erro === "true"`). |
| Acentos na URL da busca por endereço | Sempre `encodeURIComponent` em cidade e logradouro. |
| Uso abusivo | Só consultar no submit; sem lote. |
