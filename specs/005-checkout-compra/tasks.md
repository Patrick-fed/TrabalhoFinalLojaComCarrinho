# Tasks: Checkout e Confirmação de Compra

**Input**: Design documents from `/specs/005-checkout-compra/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No automated tests requested. Validation via `npm run typecheck` and `quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Types, constants, and navigation contracts shared by all stories

- [x] T001 [P] Create `FormaPagamentoDisponivel` and `ErroCheckout` types in `Carrinho/Types/checkout.ts`
- [x] T002 [P] Change `Compra.status` from `"confirmada"` to `string` in `Carrinho/Types/types.ts`
- [x] T003 [P] Create checkout messages, error texts, and fixed payment labels (`pix` → Pix, `cartao` → Cartão, `boleto` → Boleto) in `Carrinho/Constants/mensagensCheckout.ts`
- [x] T004 [P] Add the "Finalizar compra" label to `Carrinho/Constants/mensagensCarrinho.ts`
- [x] T005 [P] Add `Checkout: undefined` and `ConfirmacaoCompra: { compra: Compra; carrinhoAtualizado: boolean }` to `AppStackParamList` in `Carrinho/Types/navigation.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: HTTP service and cart context changes required by every story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Implement `listarFormasPagamento(signal?)` and `registrarCompra(usuarioId, formaPagamento, signal?)` in `Carrinho/Service/compras.ts` using `ROTAS.formasPagamento`/`ROTAS.compras`, `x-api-key`, response validation, `ErroCheckout` mapping, and `AbortError` propagation (depends T001)
- [ ] T007 [P] Change `recarregar()` in `Carrinho/Context/CarrinhoContext.tsx` to return `Promise<Carrinho | null>` while preserving existing state updates

**Checkpoint**: Types, service, and context are ready; user stories can begin.

---

## Phase 3: User Story 1 - Revisar o carrinho e escolher a forma de pagamento (Priority: P1) 🎯 MVP

**Goal**: Abrir o checkout pelo carrinho, exibir o resumo atual da API, carregar formas de pagamento, permitir seleção única e bloquear finalização sem seleção ou com carrinho vazio.

**Independent Test**: Abrir o checkout com carrinho preenchido, conferir itens/quantidades/preços/subtotais/total, validar loading e retry das formas, seleção única, bloqueio sem seleção e bloqueio com carrinho vazio.

### Implementation for User Story 1

- [ ] T008 [US1] Build `CheckoutScreen` with header/back, cart summary (name, quantity, unit price, subtotal, total), loading, error, and empty-cart states in `Carrinho/Screens/CheckoutScreen.tsx` (depends T003, T006, T007)
- [ ] T009 [US1] Implement payment methods fetch with retry, fixed labels, unknown-id disabled handling, and single-selection state in `Carrinho/Screens/CheckoutScreen.tsx` (depends T008)
- [ ] T010 [US1] Block checkout with empty cart and disable "Finalizar compra" until a known payment method is selected in `Carrinho/Screens/CheckoutScreen.tsx` (depends T009)
- [ ] T011 [US1] Add "Finalizar compra" action to the cart screen that navigates to `Checkout` in `Carrinho/Screens/CarrinhoScreen.tsx` (depends T004, T005)
- [ ] T012 [US1] Register the `Checkout` screen in `Carrinho/Navigation/AppNavigator.tsx` (depends T008, T011)

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Finalizar a compra e visualizar a confirmação (Priority: P1)

**Goal**: Registrar a compra na API, impedir envios duplicados, limpar o carrinho após sucesso, exibir a confirmação com dados oficiais e retornar ao catálogo sem reabrir o checkout.

**Independent Test**: Selecionar forma de pagamento, confirmar a compra, verificar dados oficiais da confirmação, carrinho vazio, retorno ao catálogo, bloqueio de toques repetidos, falhas de rede/API e logout durante a finalização.

### Implementation for User Story 2

- [ ] T013 [P] [US2] Build `ConfirmacaoCompraScreen` with purchase ID, items/quantities, total, payment label, status, cart-update notice, and "Voltar ao catálogo" in `Carrinho/Screens/ConfirmacaoCompraScreen.tsx` (depends T001, T002, T003)
- [ ] T014 [US2] Implement purchase submission in `Carrinho/Screens/CheckoutScreen.tsx` with `finalizandoRef`, disabled button, `AbortController`, and `ErroCheckout` messages (depends T009, T010, T006)
- [ ] T015 [US2] Call `limparCarrinho()` after success, treat `http_404` as already empty, and pass `carrinhoAtualizado` to confirmation in `Carrinho/Screens/CheckoutScreen.tsx` (depends T014, T007)
- [ ] T016 [US2] Register `ConfirmacaoCompra` in `Carrinho/Navigation/AppNavigator.tsx` and wire `navigation.replace` from checkout (depends T013, T014)
- [ ] T017 [US2] Implement "Voltar ao catálogo" with `navigation.reset` to `Catalogo` and retry pending cart cleanup in `Carrinho/Screens/ConfirmacaoCompraScreen.tsx` (depends T013, T015, T016)

**Checkpoint**: User Stories 1 and 2 work together; the full purchase flow is functional.

---

## Phase 5: User Story 3 - Manter a consistência do checkout com o carrinho e a sessão (Priority: P2)

**Goal**: Detectar divergências entre revisão e confirmação, impedir compra com carrinho vazio/desatualizado, descartar respostas de sessões antigas e preservar os fluxos existentes.

**Independent Test**: Alterar o carrinho antes de confirmar, esvaziá-lo, simular respostas atrasadas, alternar usuários e validar autenticação/catálogo/detalhes/carrinho.

### Implementation for User Story 3

- [ ] T018 [US3] Implement snapshot comparison by `produtoId`, `quantidade`, and `total` before confirmation in `Carrinho/Screens/CheckoutScreen.tsx` (depends T014)
- [ ] T019 [US3] Update the summary and require a new explicit confirmation when divergence is detected in `Carrinho/Screens/CheckoutScreen.tsx` (depends T018)
- [ ] T020 [US3] Handle empty cart at confirmation time and clear an invalid payment selection in `Carrinho/Screens/CheckoutScreen.tsx` (depends T014)
- [ ] T021 [US3] Ignore stale responses after logout/unmount using `AbortController` and session checks in `Carrinho/Screens/CheckoutScreen.tsx` (depends T014, T007)
- [ ] T022 [US3] Verify auth, catalog, product details, and cart flows still work after checkout integration in `Carrinho/` (depends T017, T021)

**Checkpoint**: All user stories are independently functional and existing flows remain intact.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Contract confirmation, security review, typecheck, and full manual validation

- [ ] T023 [P] Audit `Carrinho/Service/compras.ts` and `Carrinho/Constants/mensagensCheckout.ts` for sensitive data exposure and consistent Portuguese messages
- [ ] T024 [P] Confirm `POST /compras` with a real test purchase and adjust `Carrinho/Service/compras.ts` payload/validation if the API differs
- [ ] T025 Run `cd Carrinho; npm run typecheck` and fix all TypeScript errors
- [ ] T026 Run all scenarios in `specs/005-checkout-compra/quickstart.md` on Expo Web and record results
- [ ] T027 [P] Verify `Carrinho/package.json` has no new dependencies and no card/payment data is requested, stored, or displayed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — no dependency on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational and US1 checkout UI (T009/T010); T013 can start after Foundational in parallel with US1
- **User Story 3 (Phase 5)**: Depends on US2 purchase submission (T014); T018–T021 are sequential because they edit the same file
- **Polish (Phase 6)**: Depends on all desired user stories

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational; delivers review and payment selection
- **US2 (P1)**: Integrates with US1 but remains independently testable as the purchase/confirmation flow
- **US3 (P2)**: Builds on US2 to enforce consistency and session safety

### Within Each User Story

- Types before services
- Services before screens
- Core layout before interactions
- Submission before cleanup/navigation
- Same-file tasks run sequentially

### Parallel Opportunities

- T001–T005 (Setup) can run in parallel
- T006 and T007 (Foundational) can run in parallel
- T013 (confirmation screen) can run in parallel with US1 tasks after Foundational
- T023, T024, and T027 (Polish) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Different files, no dependency between them:
Task: "T008 Build CheckoutScreen layout in Carrinho/Screens/CheckoutScreen.tsx"
Task: "T011 Add Finalizar compra action in Carrinho/Screens/CarrinhoScreen.tsx"
```

## Parallel Example: User Story 2

```bash
# Different files, after Foundational:
Task: "T013 Build ConfirmacaoCompraScreen in Carrinho/Screens/ConfirmacaoCompraScreen.tsx"
Task: "T014 Implement purchase submission in Carrinho/Screens/CheckoutScreen.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: review, payment loading, selection, empty-cart guard
5. Demo the checkout review flow

### Incremental Delivery

1. Setup + Foundational → contracts ready
2. US1 → review and payment selection (MVP)
3. US2 → full purchase, confirmation, cart cleanup
4. US3 → divergence, session safety, regression
5. Polish → contract confirmation, typecheck, quickstart

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. After Foundational:
   - Developer A: US1 checkout UI
   - Developer B: US2 confirmation screen (T013)
3. US2 submission integrates with US1; US3 follows US2.

---

## Notes

- [P] tasks use different files and have no incomplete dependencies
- [Story] labels map tasks to US1, US2, US3
- No automated tests requested; use typecheck + quickstart
- `POST /compras` must be confirmed with a real test purchase (T024)
- Avoid same-file conflicts: `CheckoutScreen.tsx` and `AppNavigator.tsx` are edited sequentially
- Commit after each task or logical group
