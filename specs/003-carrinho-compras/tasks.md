# Tasks: Carrinho de Compras

**Input**: Design documents from `/specs/003-carrinho-compras/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Não foram solicitados testes automatizados; não há tarefas de teste.

**Organization**: Tarefas agrupadas por história de usuário para implementação e validação independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: História de usuário associada (`US1`, `US2`, `US3`, `US4`, `US5`)
- Todos os caminhos de arquivo são relativos à raiz do repositório

## Path Conventions

- **Mobile single-project**: código em `Carrinho/`
- **Documentação da feature**: `specs/003-carrinho-compras/`

---

## Phase 1: Setup

**Purpose**: Tipos e mensagens compartilhadas do carrinho

- [x] T001 [P] Adicionar a rota `Carrinho: undefined` ao tipo `AppStackParamList` em `Carrinho/Types/navigation.ts`.
- [x] T002 [P] Criar `ErroCarrinho` (`codigo`, `mensagem`) e `OperacaoCarrinho` (`tipo`, `produtoId?`) em `Carrinho/Types/carrinho.ts`.
- [x] T003 [P] Criar textos e mensagens de erro do carrinho em `Carrinho/Constants/mensagensCarrinho.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Serviço, contexto e provider que bloqueiam todas as histórias

**⚠️ CRITICAL**: Nenhuma história pode começar antes desta fase.

- [x] T004 Implementar `buscarCarrinho`, validação de resposta e mapeamento de erros de rede/HTTP/resposta inválida em `Carrinho/Service/carrinho.ts`.
- [x] T005 Implementar `adicionarItem`, `atualizarQuantidade`, `removerItem` e `limparCarrinho`, com headers, corpos e fallback `GET`, em `Carrinho/Service/carrinho.ts`; depende de T004.
- [x] T006 Criar `CarrinhoProvider` e `useCarrinho` com estado, carregamento inicial por `uid`, trava de mutação, `recarregar` e operações em `Carrinho/Context/CarrinhoContext.tsx`; depende de T004-T005.
- [x] T007 Envolver o `AppNavigator` com `CarrinhoProvider` dentro do `AuthProvider` em `Carrinho/App.tsx`; depende de T006.

**Checkpoint**: serviço, contexto e provider prontos para as histórias.

---

## Phase 3: User Story 1 - Visualizar o carrinho (Priority: P1) (MVP)

**Goal**: Abrir o carrinho pelo cabeçalho e visualizar itens, quantidades, subtotais e totais, com loading, erro/retry e estado vazio.

**Independent Test**: Autenticar, abrir o carrinho, conferir dados e estados, voltar ao catálogo e verificar preservação de busca/categoria/posição.

- [x] T008 [P] [US1] Criar `ItemCarrinhoCard` com imagem/fallback, nome, preço unitário, quantidade e subtotal em `Carrinho/Components/ItemCarrinhoCard.tsx`.
- [x] T009 [US1] Criar `CarrinhoScreen` com loading, erro com retry, estado vazio, `FlatList`, resumo de totais e ação de voltar em `Carrinho/Screens/CarrinhoScreen.tsx`; depende de T008.
- [x] T010 [US1] Registrar `CarrinhoScreen` na rota `Carrinho` em `Carrinho/Navigation/AppNavigator.tsx`; depende de T009.
- [x] T011 [US1] Adicionar botão “Carrinho” com badge `quantidadeTotal` e navegação para `Carrinho` em `Carrinho/Screens/CatalogoScreen.tsx`; depende de T010.

**Checkpoint**: US1 funcional de forma independente com carrinho existente.

---

## Phase 4: User Story 2 - Adicionar produtos pelo catálogo (Priority: P1) (MVP)

**Goal**: Adicionar produto pelo card com quantidade inicial 1, feedback visual, incremento sem duplicação e tratamento de estoque/erros.

**Independent Test**: Adicionar produto com estoque, conferir badge/feedback, repetir a adição para incrementar, testar produto esgotado e falha de rede.

- [x] T012 [P] [US2] Atualizar `CartaoProduto` com ação “Adicionar” separada da navegação, “Esgotado” para estoque `<= 0`, spinner, bloqueio e rótulos de acessibilidade em `Carrinho/Components/CartaoProduto.tsx`.
- [x] T013 [US2] Integrar `adicionarProduto(produto.id, 1)`, banner temporário de sucesso, erro inline e atualização do badge em `Carrinho/Screens/CatalogoScreen.tsx`; depende de T011-T012.

**Checkpoint**: US1 e US2 funcionam e formam o MVP do carrinho.

---

## Phase 5: User Story 3 - Alterar quantidade e remover itens (Priority: P2)

**Goal**: Aumentar, diminuir e remover itens, mantendo quantidade mínima 1 e atualizando subtotais, total e badge.

**Independent Test**: Alterar quantidades, tentar reduzir abaixo de 1, remover itens e remover o último item verificando estado vazio.

- [x] T014 [US3] Estender `ItemCarrinhoCard` com controles “+”, “−” e “Remover”, mínimo 1, estados desabilitados/busy e acessibilidade em `Carrinho/Components/ItemCarrinhoCard.tsx`; depende de T008.
- [x] T015 [US3] Integrar `alterarQuantidade` e `removerItem`, erro inline e estado vazio após remover o último item em `Carrinho/Screens/CarrinhoScreen.tsx`; depende de T009 e T014.

**Checkpoint**: US3 funcional sem quebrar US1/US2.

---

## Phase 6: User Story 4 - Limpar o carrinho (Priority: P2)

**Goal**: Limpar todo o carrinho somente após confirmação, com cancelamento seguro e tratamento de falha.

**Independent Test**: Abrir carrinho com itens, cancelar a confirmação, confirmar a limpeza e verificar estado vazio/totais zerados.

- [x] T016 [P] [US4] Criar `ModalConfirmacao` com título, mensagem, confirmar/cancelar, estado de carregamento e bloqueio do fundo em `Carrinho/Components/ModalConfirmacao.tsx`.
- [x] T017 [US4] Integrar a ação “Limpar carrinho” e o modal com `limparCarrinho` em `Carrinho/Screens/CarrinhoScreen.tsx`; depende de T009 e T016.

**Checkpoint**: US4 funcional e integrada à tela do carrinho.

---

## Phase 7: User Story 5 - Isolamento por usuário e continuidade (Priority: P3)

**Goal**: Garantir que cada usuário veja apenas o próprio carrinho, com descarte no logout e recarga ao reabrir o app.

**Independent Test**: Adicionar itens com dois usuários alternados, sair e entrar com outra conta, reabrir o app com sessão ativa e conferir recarga da API.

- [x] T018 [P] [US5] Adicionar `sessaoRef`, identificadores de requisição, `AbortController` e descarte de respostas atrasadas em troca de `uid`/logout em `Carrinho/Context/CarrinhoContext.tsx`; depende de T006.

**Checkpoint**: isolamento por sessão e recarga inicial cobertos.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Melhorias e validações que afetam todas as histórias

- [x] T019 [P] Auditar `Carrinho/Screens/CatalogoScreen.tsx` e `Carrinho/Screens/CarrinhoScreen.tsx` para garantir ausência de `fetch` direto, URLs duplicadas e recálculo local de totais.
- [x] T020 Executar `npm run typecheck` em `Carrinho/` e corrigir todos os erros de TypeScript.
- [ ] T021 Executar o roteiro de `specs/003-carrinho-compras/quickstart.md` no Expo Web e, se possível, no mobile; corrigir divergências.
- [x] T022 [P] Auditar os arquivos do carrinho para garantir que chave da API, corpos brutos e stack traces não aparecem em UI/logs e que `x-api-key` só é enviado pelo serviço.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001-T003)**: pode começar imediatamente; tarefas paralelas.
- **Foundational (T004-T007)**: depende do Setup; bloqueia todas as histórias.
- **US1 (T008-T011)**: depende de T007.
- **US2 (T012-T013)**: depende de T007; T013 depende de T011.
- **US3 (T014-T015)**: depende de T007, T008 e T009.
- **US4 (T016-T017)**: depende de T007 e T009; T017 depende de T016.
- **US5 (T018)**: depende de T006; pode rodar em paralelo com as histórias de UI.
- **Polish (T019-T022)**: depende das histórias desejadas; T021 depende de T020.

### Within Each User Story

- Tipos e mensagens antes do serviço.
- Serviço antes do contexto.
- Contexto antes das telas.
- Componentes antes da integração na tela.
- História completa e validada antes de avançar para a próxima prioridade.

### Parallel Opportunities

- T001, T002 e T003 podem rodar em paralelo.
- Após T007, podem rodar em paralelo: T008 (US1), T012 (US2), T016 (US4) e T018 (US5).
- T011 e T013 não podem rodar em paralelo: ambos alteram `CatalogoScreen.tsx`.
- T009, T015 e T017 não podem rodar em paralelo: todos alteram `CarrinhoScreen.tsx`.
- T008 e T014 não podem rodar em paralelo: ambos alteram `ItemCarrinhoCard.tsx`.
- T019 e T022 podem rodar em paralelo após as histórias.

---

## Parallel Example: After Foundational

```text
Task: "T008 [US1] Criar ItemCarrinhoCard em Carrinho/Components/ItemCarrinhoCard.tsx"
Task: "T012 [US2] Atualizar CartaoProduto em Carrinho/Components/CartaoProduto.tsx"
Task: "T016 [US4] Criar ModalConfirmacao em Carrinho/Components/ModalConfirmacao.tsx"
Task: "T018 [US5] Adicionar guards de sessão em Carrinho/Context/CarrinhoContext.tsx"
```

---

## Implementation Strategy

### MVP First

1. Completar Phase 1 (Setup).
2. Completar Phase 2 (Foundational).
3. Implementar US1 e US2, ambas P1.
4. Validar visualização e adição de produtos.
5. Demonstrar o MVP.

### Incremental Delivery

1. US1 + US2: MVP.
2. US3: ajustes de quantidade e remoção.
3. US4: limpeza com confirmação.
4. US5: isolamento por usuário e continuidade.
5. Polish: typecheck, quickstart e auditoria de segurança/arquitetura.

### Parallel Team Strategy

- Uma pessoa conclui Setup + Foundational.
- Depois, US1, US2, US4 e US5 podem avançar em paralelo, respeitando os arquivos compartilhados.
- US3 depende dos componentes e da tela criados em US1.
- Integrar e validar cada história antes de avançar para a próxima prioridade.

---

## Notes

- `[P]` indica tarefas em arquivos diferentes e sem dependência de tarefa incompleta.
- Cada história deve ser concluída e validada de forma independente.
- Não há tarefas de teste automatizado porque testes não foram solicitados.
- Commits devem ser feitos após cada tarefa ou grupo lógico.
- Evitar tarefas vagas, conflitos no mesmo arquivo e dependências que quebrem a independência das histórias.
