# Implementation Plan: Checkout e Confirmação de Compra

**Branch**: `005-checkout-compra` | **Date**: 2026-11-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-checkout-compra/spec.md`

## Summary

Implementar o fluxo de checkout e confirmação usando a pilha existente (React Native + Expo +
TypeScript, `fetch`, React Navigation 7, `CarrinhoContext`). O checkout reconsulta o carrinho
na API, carrega as formas de pagamento, exige uma seleção, detecta divergências antes de
confirmar, registra a compra em `POST /compras`, limpa o carrinho via
`DELETE /carrinho/:usuarioId` após o sucesso e apresenta a confirmação com os dados oficiais
da loja. Nenhuma dependência nova será adicionada.

## Technical Context

**Language/Version**: TypeScript 6.0 (`strict: true`), React 19.3, React Native 0.88.1
**Primary Dependencies**: Expo 58, React Navigation 7 (`native-stack`), Firebase 13
(autenticação existente), `fetch` nativo, componentes existentes
**Storage**: Sem persistência local do checkout; carrinho no `CarrinhoContext`; sessão
Firebase existente
**Testing**: Sem framework automatizado; `npm run typecheck` + roteiro manual do
`quickstart.md`
**Target Platform**: Expo Android/iOS, validação principal no Expo Web
**Project Type**: Aplicativo móvel single-project em `Carrinho/`
**Performance Goals**: Resumo visível em até 3 s; formas de pagamento em até 3 s; compra
confirmada em até 3 s; acesso ao checkout em 1 toque
**Constraints**: `x-api-key` obrigatório; preços em centavos; sem novas dependências;
`POST /compras` usa o carrinho do servidor; `DELETE /carrinho/:usuarioId` após sucesso;
formas de pagamento retornadas como `{ id, nome }`
**Scale/Scope**: 2 telas novas, 1 serviço novo, 1 arquivo de tipos, 1 arquivo de mensagens,
pequenas alterações em contexto/navegação/carrinho/tipos

Nenhum item marcado como `NEEDS CLARIFICATION`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Resultado | Justificativa |
|-----------|-----------|---------------|
| I. Simplicidade e Clareza | PASS | Reaproveita contexto, serviços, componentes e padrões existentes. |
| II. Tecnologias e Dependências | PASS | Somente Expo, React Native, TypeScript e `fetch`; nenhuma dependência nova. |
| III. SOLID | PASS | Serviço concentra HTTP; telas concentram apresentação; carrinho permanece no contexto. |
| IV. Componentes Reutilizáveis | PASS | Reutiliza `BotaoPrincipal`, `MensagemErro`, `ItemCarrinhoCard` e `CarregandoScreen`. |
| V. TypeScript e Tipagem | PASS | Reutiliza `Carrinho`, `ItemCarrinho`, `FormaPagamento` e `Compra`; adiciona tipos específicos sem `any`. |
| VI. Organização e Responsabilidades | PASS | `Service/compras.ts`, rotas em `Service/rotas.ts`, mensagens em `Constants/`. |
| VII. Preservação do Código Existente | PASS | Mudanças mínimas e justificadas: retorno de `recarregar` e `Compra.status`. |
| VIII. Desenvolvimento por Etapas | PASS | Feature focada apenas no checkout e confirmação. |
| IX. Requisitos do Trabalho | PASS | Cobre revisão, pagamento, finalização, confirmação, loading, erros e API. |
| X. Sem Funcionalidades Desnecessárias | PASS | Sem histórico, cupons, frete, estorno ou pagamento real. |
| XI. Interface e Estilos | PASS | Mantém `CORES`, `StyleSheet` e a paleta azul. |
| XII. Aprendizado e Compreensão | PASS | Fluxo claro: tela → serviço → API → tipos; carrinho via contexto. |

**Post-design re-check**: PASS. Nenhuma violação; não há complexidade adicional a justificar.

## Project Structure

### Documentation (this feature)

```text
specs/005-checkout-compra/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas e achados da API
├── data-model.md        # Entidades, validações e transições
├── quickstart.md        # Roteiro manual de validação
├── contracts/
│   ├── api.md           # Endpoints de formas de pagamento e compras
│   ├── services.md      # Serviço e integração com o contexto
│   └── ui-navigation.md # Rotas, telas e estados
└── checklists/
    └── requirements.md  # Já existente
```

### Source Code (repository root)

```text
Carrinho/
├── Service/
│   ├── compras.ts                 # NOVO: formas de pagamento e registro de compra
│   └── rotas.ts                   # existente: já possui formasPagamento e compras
├── Types/
│   ├── checkout.ts                # NOVO: ErroCheckout e FormaPagamentoDisponivel
│   ├── types.ts                   # ALTERAR: Compra.status para string
│   └── navigation.ts              # ALTERAR: rotas Checkout e ConfirmacaoCompra
├── Constants/
│   ├── mensagensCheckout.ts       # NOVO: textos do checkout/confirmação
│   └── mensagensCarrinho.ts       # ALTERAR: adicionar "Finalizar compra"
├── Context/
│   └── CarrinhoContext.tsx        # ALTERAR: recarregar retorna Carrinho | null
├── Screens/
│   ├── CheckoutScreen.tsx         # NOVO: revisão, pagamento e finalização
│   ├── ConfirmacaoCompraScreen.tsx# NOVO: dados oficiais da compra
│   └── CarrinhoScreen.tsx         # ALTERAR: botão "Finalizar compra"
├── Navigation/
│   └── AppNavigator.tsx           # ALTERAR: registrar as duas telas
└── AGENTS.md                      # ALTERAR: apontar para specs/005-checkout-compra/plan.md
```

**Structure Decision**: Single-project mobile em `Carrinho/`, preservando a separação por
responsabilidade já usada. O checkout usa o `CarrinhoContext` como fonte da verdade e um
snapshot apenas para detectar divergências.

## Phase 0: Research Summary

As decisões completas estão em [research.md](./research.md). Resumo:

| ID | Decisão |
|----|---------|
| D-401 | Manter a pilha existente; nenhuma dependência nova. |
| D-402 | Criar `Service/compras.ts` com `listarFormasPagamento` e `registrarCompra`; helper HTTP próprio para não refatorar `carrinho.ts`/`catalogo.ts`. |
| D-403 | Validar formas de pagamento como `{ id: string; nome: string }`; mapear ids conhecidos para rótulos fixos (Pix, Cartão, Boleto) e exibir ids desconhecidos desabilitados com o `nome` retornado. |
| D-404 | Enviar `POST /compras` com `{ usuarioId, formaPagamento }`; validar a resposta como `Compra`; `status` aceita qualquer string. |
| D-405 | No checkout, chamar `recarregar()` ao abrir e antes de confirmar; alterar `recarregar` para retornar `Carrinho \| null` para comparação. |
| D-406 | Comparar snapshot de itens/total por `produtoId` + `quantidade` + `total`; se divergir, atualizar o resumo e exigir nova confirmação. |
| D-407 | Após sucesso, chamar `limparCarrinho()`; se falhar, exibir confirmação com aviso e tentar limpar/atualizar ao voltar ao catálogo. |
| D-408 | Navegar do checkout para confirmação com `replace` e da confirmação para o catálogo com `reset`, evitando reabrir o checkout. |
| D-409 | Bloquear toques repetidos com `finalizandoRef` + botão desabilitado; usar `AbortController` e ignorar respostas após logout/desmontagem. |
| D-410 | Mapear erros para `ErroCheckout` com mensagens em português; não exibir corpo bruto, chave ou stack trace. |
| D-411 | Reutilizar `BotaoPrincipal`, `MensagemErro`, `ItemCarrinhoCard`, `CarregandoScreen` e `CORES`. |
| D-412 | Sem testes automatizados; validar com `tsc --noEmit` e quickstart manual. |

## Phase 1: Design Summary

### Modelo

- `FormaPagamentoDisponivel`: `{ id: string; nome: string }`.
- `ErroCheckout`: `{ codigo: string; mensagem: string }`.
- `Compra`: reutilizar de `Types/types.ts`; alterar `status: "confirmada"` para
  `status: string` para aceitar valores desconhecidos.
- Estado da tela: `formasPagamento`, `carregandoFormas`, `erroFormas`,
  `formaSelecionada`, `finalizando`, `erroFinalizacao`, `snapshotRevisao`,
  `avisoDivergencia`, `aguardandoNovaConfirmacao`.
- O estado completo e as transições estão em [data-model.md](./data-model.md).

### Camada de serviço

- `Service/compras.ts` expõe:
  - `listarFormasPagamento(signal?): Promise<FormaPagamentoDisponivel[]>`
  - `registrarCompra(usuarioId, formaPagamento, signal?): Promise<Compra>`
- Usa `ROTAS.formasPagamento` e `ROTAS.compras`, header `x-api-key` e `Accept`.
- Valida as respostas com conversores próprios e mapeia erros para `ErroCheckout`.
- Propaga `AbortError`; não expõe corpo bruto, chave ou stack trace.

### Interface

- `CheckoutScreen`:
  - Cabeçalho “Voltar” + “Checkout”.
  - Resumo com itens, quantidades, subtotais e total.
  - Loading das formas de pagamento; erro com “Tentar novamente”; lista vazia com aviso.
  - Seleção única com indicador visual.
  - Aviso de divergência quando o carrinho mudar.
  - Botão “Finalizar compra” com spinner e bloqueio durante a operação.
- `ConfirmacaoCompraScreen`:
  - Identificador, itens/quantidades, total, forma de pagamento e status.
  - Aviso se a limpeza do carrinho ficou pendente.
  - “Voltar ao catálogo” com `reset`.

### Navegação

- Adicionar `Checkout: undefined` e
  `ConfirmacaoCompra: { compra: Compra; carrinhoAtualizado: boolean }` em
  `Types/navigation.ts`.
- Registrar as telas em `AppNavigator` na pilha autenticada.
- Carrinho → Checkout por botão “Finalizar compra”.
- Checkout → Confirmação com `navigation.replace`.
- Confirmação → Catálogo com `navigation.reset`.

## Implementation Sequence

1. Criar `Types/checkout.ts` e alterar `Types/types.ts` (`Compra.status: string`).
2. Criar `Constants/mensagensCheckout.ts` e adicionar “Finalizar compra” em
   `mensagensCarrinho.ts`.
3. Criar `Service/compras.ts` com validação e mapeamento de erros.
4. Alterar `CarrinhoContext` para `recarregar(): Promise<Carrinho | null>`.
5. Atualizar `Types/navigation.ts` e `Navigation/AppNavigator.tsx`.
6. Implementar `Screens/CheckoutScreen.tsx`.
7. Implementar `Screens/ConfirmacaoCompraScreen.tsx`.
8. Adicionar o botão “Finalizar compra” em `Screens/CarrinhoScreen.tsx`.
9. Atualizar `AGENTS.md` para apontar ao plano 005.
10. Executar `cd Carrinho; npm run typecheck`.
11. Validar o roteiro de `quickstart.md` no Expo Web e, se possível, no mobile.

## Validation Strategy

- `cd Carrinho; npm run typecheck` sem erros.
- Manual:
  - abrir checkout pelo carrinho com 1 toque;
  - conferir itens, quantidades, subtotais e total;
  - carregar formas de pagamento e selecionar uma;
  - bloquear finalização sem seleção;
  - impedir checkout com carrinho vazio;
  - finalizar e conferir os dados oficiais da compra;
  - confirmar carrinho vazio após retorno ao catálogo;
  - simular divergência de carrinho e exigir nova confirmação;
  - simular falha de rede nas formas de pagamento e na compra;
  - toques repetidos sem compra duplicada;
  - logout durante a finalização sem confirmação indevida;
  - falha de limpeza do carrinho com aviso e atualização ao retornar;
  - formas de pagamento desconhecidas sem quebrar a tela.

## Risks and Mitigations

| Risco | Mitigação |
|-------|-----------|
| Corpo de `POST /compras` divergente do esperado | Validar com uma compra real no quickstart; ajustar o payload no serviço se a API retornar 400. |
| Servidor já limpa o carrinho automaticamente | Tratar `DELETE` em carrinho vazio/404 como sucesso; atualizar o contexto local. |
| Compra duplicada por toques repetidos | `finalizandoRef` + botão desabilitado + `AbortController`. |
| Divergência detectada por ordem diferente dos itens | Comparar por `produtoId` + `quantidade` + `total`, não pela ordem do array. |
| Forma de pagamento desconhecida | Exibir com o `nome` retornado e desabilitar a seleção. |
| Logout durante a finalização | Abortar/ignorar resposta e descartar estado ao desmontar. |
| Falha ao limpar o carrinho | Manter a confirmação, avisar o cliente e tentar limpar/atualizar ao voltar ao catálogo. |
| Sem testes automatizados | `tsc --noEmit` + quickstart manual cobrindo fluxos e falhas. |

## Complexity Tracking

Nenhuma violação da constituição. Duas alterações pequenas e justificadas:

| Alteração | Motivo | Alternativa rejeitada |
|-----------|--------|------------------------|
| `recarregar` retorna `Carrinho \| null` | Permitir comparação de divergência antes da confirmação | Duplicar chamada ao serviço na tela |
| `Compra.status` passa a `string` | Exibir status desconhecido sem inventar dados | Fixar apenas `"confirmada"` e descartar respostas válidas |
