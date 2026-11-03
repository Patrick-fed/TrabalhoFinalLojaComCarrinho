# Tasks: Detalhes do Produto

**Input**: Design documents from `specs/004-detalhes-produto/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não incluídos — a spec não solicita TDD e o projeto não possui framework de testes.

**Organization**: Tarefas agrupadas por história para implementação e validação independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: História correspondente (US1, US2, US3)
- Caminhos de arquivo exatos em todas as tarefas

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar ambiente e referências antes da implementação

- [X] T001 Confirmar `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_API_KEY` em `Carrinho/.env` e instalar dependências com `npm install` em `Carrinho/package.json`
- [X] T002 [P] Verificar que `AGENTS.md` aponta para `specs/004-detalhes-produto/plan.md` e que `Carrinho/package.json` não recebeu dependências novas

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Serviço e mensagens compartilhados por todas as histórias

**⚠️ CRITICAL**: Nenhuma história pode começar antes desta fase

- [X] T003 [P] Adicionar `buscarProdutoPorId(id: number, signal?: AbortSignal): Promise<Produto>` em `Carrinho/Service/catalogo.ts`, reutilizando `ROTAS.produtoPorId`, `requisitar`, `converterProduto` e `erroPorStatus`; propagar `AbortError` e mapear 404
- [X] T004 [P] Criar `Carrinho/Constants/mensagensDetalhesProduto.ts` com os textos da tela (título, voltar, carregando, atualizando, tentar novamente, descrição, estoque, esgotado, adicionar, adicionado, indisponível, imagem indisponível)

**Checkpoint**: Serviço e mensagens prontos — histórias podem começar

---

## Phase 3: User Story 1 - Visualizar detalhes completos do produto (Priority: P1) 🎯 MVP

**Goal**: Exibir imagem ampliada, nome, descrição completa, preço formatado e estoque, com carregamento, retry e produto indisponível

**Independent Test**: Autenticar, abrir um produto no catálogo e conferir campos, formato `R$ 0,00`, rolagem da descrição, loading, falha com retry, 404 e fallback de imagem

### Implementation for User Story 1

- [X] T005 [US1] Implementar estados `produto`, `carregando`, `erro`, `imagemFalhou` e `useEffect` com `AbortController`/`requisicaoRef` chamando `buscarProdutoPorId` em `Carrinho/Screens/DetalhesProdutoScreen.tsx`
- [X] T006 [US1] Renderizar cabeçalho com "Voltar", imagem ampliada com fallback, nome, preço via `formatarPrecoCentavos`, estoque e descrição em `ScrollView` em `Carrinho/Screens/DetalhesProdutoScreen.tsx`
- [X] T007 [US1] Implementar estado de carregamento com `CarregandoScreen`, erro com `MensagemErro` + "Tentar novamente" e estado de produto indisponível (404) com "Voltar ao catálogo" em `Carrinho/Screens/DetalhesProdutoScreen.tsx`

**Checkpoint**: US1 funcional e testável isoladamente (MVP)

---

## Phase 4: User Story 2 - Adicionar o produto ao carrinho pelos detalhes (Priority: P1)

**Goal**: Adicionar com quantidade 1 via contexto existente, com confirmação, bloqueio sem estoque e sem requisições duplicadas

**Independent Test**: Adicionar produto com estoque, conferir banner e badge; repetir para incrementar; testar esgotado, falha de rede, rejeição de estoque e toques repetidos

### Implementation for User Story 2

- [X] T008 [US2] Calcular derivados `quantidadeNoCarrinho`, `estoqueDisponivel`, `esgotado`, `adicionando` e `adicaoDesabilitada` a partir de `carrinho` e `operacao` em `Carrinho/Screens/DetalhesProdutoScreen.tsx`
- [X] T009 [US2] Implementar `adicionarAoCarrinho` com `adicionarProduto(produto.id, 1)`, guarda de operação ativa/estoque, banner temporário de sucesso e erro via `obterMensagemDeErro` em `Carrinho/Screens/DetalhesProdutoScreen.tsx`
- [X] T010 [US2] Integrar `BotaoPrincipal` ("Adicionar ao carrinho"/"Esgotado", spinner e desabilitado) e `MensagemErro` para falha de adição em `Carrinho/Screens/DetalhesProdutoScreen.tsx`

**Checkpoint**: US1 e US2 funcionais independentemente

---

## Phase 5: User Story 3 - Manter catálogo e carrinho consistentes (Priority: P2)

**Goal**: Descartar respostas atrasadas, cancelar consultas ao sair e preservar catálogo/isolamento por usuário

**Independent Test**: Buscar/filtrar, abrir detalhes e voltar; alternar usuários; navegar rapidamente entre produtos e confirmar descarte de respostas obsoletas

### Implementation for User Story 3

- [X] T011 [US3] Adicionar guarda por identificador de requisição, abortar consulta ao desmontar/trocar de produto e limpar timers de sucesso no logout em `Carrinho/Screens/DetalhesProdutoScreen.tsx`
- [X] T012 [US3] Verificar preservação de busca/categoria/posição e isolamento por usuário em `Carrinho/Screens/CatalogoScreen.tsx`, `Carrinho/Navigation/AppNavigator.tsx` e `Carrinho/Context/CarrinhoContext.tsx`, ajustando apenas se houver regressão

**Checkpoint**: Todas as histórias funcionais e consistentes

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Acessibilidade, tipagem e validação final

- [X] T013 [P] Revisar rótulos de acessibilidade, estados de botão e uso de `CORES`/`StyleSheet` em `Carrinho/Screens/DetalhesProdutoScreen.tsx`
- [X] T014 Executar `npm run typecheck` em `Carrinho/` e corrigir erros de TypeScript
- [X] T015 Executar os cenários manuais de `specs/004-detalhes-produto/quickstart.md` e registrar os resultados

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup — bloqueia todas as histórias
- **US1 (Phase 3)**: depende de T003 e T004
- **US2 (Phase 4)**: depende de US1 (mesma tela) e T003
- **US3 (Phase 5)**: depende de US1 e US2
- **Polish (Phase 6)**: depende das histórias desejadas

### User Story Dependencies

- **US1 (P1)**: inicia após Foundational — sem dependência de outras histórias
- **US2 (P1)**: inicia após US1 — integra o botão de adição à tela existente
- **US3 (P2)**: inicia após US1/US2 — endurece cancelamento e consistência

### Within Each User Story

- T003/T004 antes de qualquer tarefa de história
- T005 antes de T006/T007
- T008 antes de T009/T010
- T011/T012 após US1/US2

### Parallel Opportunities

- T001 e T002 em paralelo
- T003 e T004 em paralelo (arquivos diferentes)
- T013 em paralelo com revisões de documentação
- US2 e US3 compartilham a mesma tela; executar sequencialmente

---

## Parallel Example: Foundational

```bash
Task: "Adicionar buscarProdutoPorId em Carrinho/Service/catalogo.ts"
Task: "Criar Carrinho/Constants/mensagensDetalhesProduto.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational (T003, T004)
3. Phase 3: US1 (T005–T007)
4. Validar US1 isoladamente
5. Demonstrar MVP

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → validar (MVP)
3. US2 → validar adição
4. US3 → validar consistência
5. Polish → typecheck + quickstart

---

## Notes

- [P] = arquivos diferentes, sem dependências
- Sem testes automatizados: validação por `tsc --noEmit` e quickstart manual
- Nenhuma dependência nova
- Não alterar `CatalogoScreen`, `AppNavigator` ou `Types/navigation.ts` sem regressão comprovada
- Commits apenas quando solicitado
