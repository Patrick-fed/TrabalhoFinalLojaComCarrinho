# Tasks: Catálogo de Produtos

**Input**: Design documents from `/specs/002-catalogo-produtos/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não incluídos. O projeto não possui framework de testes e o plano
(`research.md` D-115) define validação por `npm run typecheck` e roteiro manual.

**Organization**: Tarefas agrupadas por história de usuário para permitir
implementação e validação incrementais.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: História de usuário correspondente (US1–US5)
- Todos os caminhos são relativos à raiz do repositório

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tipos, configuração e utilitários compartilhados

- [ ] T001 [P] Exportar `Categoria`, `FormaPagamento`, `Produto`, `ItemCarrinho`, `Carrinho`, `Compra` e `ErroApi` em `Carrinho/Types/types.ts`, completando `Categoria` com as 9 categorias da API
- [ ] T002 [P] Criar `Carrinho/Types/catalogo.ts` com `CategoriaDisponivel`, `FiltrosCatalogo` e `ErroCatalogo`, importando `Categoria` de `./types`
- [ ] T003 [P] Adicionar `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_API_KEY` vazios em `Carrinho/.env.example`
- [ ] T004 [P] Criar `Carrinho/Utils/formatacao.ts` com `formatarPrecoCentavos` usando `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`
- [ ] T005 [P] Criar `Carrinho/Constants/mensagensCatalogo.ts` com textos de carregamento, catálogo vazio, sem resultados, erros de produtos/categorias e ações "Tentar novamente"/"Limpar filtros"
- [ ] T006 Atualizar `Carrinho/Types/navigation.ts` para `AppStackParamList` com `Catalogo: undefined` e `DetalhesProduto: { produto: Produto }`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Configuração da API, serviço de catálogo e componentes base

**⚠️ CRITICAL**: Nenhuma história pode começar antes desta fase.

- [ ] T007 [P] Criar `Carrinho/Config/apiConfig.ts` lendo e validando `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_API_KEY`, removendo barras finais da URL e sem registrar a chave
- [ ] T008 Atualizar `Carrinho/Service/rotas.ts` para importar `API_URL` de `Config/apiConfig.ts`, mantendo as rotas existentes
- [ ] T009 Implementar `Carrinho/Service/catalogo.ts` com `listarProdutos(filtros, signal?)` e `listarCategorias(signal?)`, header `x-api-key`, query codificada, validação das respostas, mapeamento de erros para `ErroCatalogo` e suporte a `AbortSignal`
- [ ] T010 [P] Criar `Carrinho/Components/CartaoProduto.tsx` com imagem, fallback de imagem, nome, preço formatado, `Pressable` acessível e estado `desabilitado`
- [ ] T011 [P] Criar `Carrinho/Components/SeletorCategorias.tsx` com `ScrollView` horizontal, chip "Todas", chips das categorias, seleção acessível, estado de carregamento, erro e ação de nova tentativa

**Checkpoint**: Serviço e componentes prontos para as histórias.

---

## Phase 3: User Story 1 - Visualizar o catálogo de produtos (Priority: P1) 🎯 MVP

**Goal**: Usuário autenticado vê a lista de produtos com imagem, nome e preço, incluindo carregamento, erro, vazio e logout.

**Independent Test**: Autenticar, abrir o catálogo, conferir cards e preços, rolar a lista, simular erro/vazio e sair pelo cabeçalho.

### Implementation for User Story 1

- [ ] T012 [US1] Criar `Carrinho/Screens/CatalogoScreen.tsx` com `SafeAreaView`, cabeçalho customizado (título, e-mail do usuário e botão "Sair" com loading/erro) e estrutura visual para busca, filtros e lista
- [ ] T013 [US1] Implementar em `Carrinho/Screens/CatalogoScreen.tsx` o carregamento inicial de produtos com `listarProdutos`, `FlatList`, `CartaoProduto`, loading em tela cheia, erro com "Tentar novamente", estado vazio e preço formatado
- [ ] T014 [US1] Atualizar `Carrinho/Navigation/AppNavigator.tsx` para registrar `Catalogo` na `AppStack` no lugar de `Home`, mantendo a proteção por `AuthContext`
- [ ] T015 [US1] Remover `Carrinho/Screens/HomeScreen.tsx` após a atualização do navegador e confirmar que nenhuma referência restou no código

**Checkpoint**: US1 funcional e testável isoladamente (MVP).

---

## Phase 4: User Story 2 - Buscar produtos pelo nome (Priority: P2)

**Goal**: Busca com debounce de 300 ms, atualização da lista, limpeza e estado sem resultados.

**Independent Test**: Digitar "teclado", aguardar 300 ms e verificar o resultado; limpar e testar termo sem correspondência.

### Implementation for User Story 2

- [ ] T016 [US2] Adicionar em `Carrinho/Screens/CatalogoScreen.tsx` o campo de busca com `CampoTexto`, botão "Limpar" e indicação textual de busca ativa
- [ ] T017 [US2] Implementar em `Carrinho/Screens/CatalogoScreen.tsx` os estados `busca`/`buscaAplicada` com debounce de 300 ms, `trim` de espaços e envio de `busca` para `listarProdutos`
- [ ] T018 [US2] Adicionar em `Carrinho/Screens/CatalogoScreen.tsx` `AbortController` e verificação de requisição atual para cancelar/ignorar respostas antigas de busca
- [ ] T019 [US2] Ajustar `Carrinho/Screens/CatalogoScreen.tsx` para exibir mensagem específica de busca sem resultados e manter a lista anterior com erro inline e "Tentar novamente" quando a busca falhar

**Checkpoint**: US2 funcional sobre a US1.

---

## Phase 5: User Story 3 - Filtrar produtos por categoria (Priority: P2)

**Goal**: Carregar categorias da API, permitir selecionar/trocar/remover o filtro e tratar falhas sem esconder produtos.

**Independent Test**: Abrir o seletor, escolher "Eletrônicos", trocar para outra categoria, voltar para "Todas" e simular falha em `/categorias`.

### Implementation for User Story 3

- [ ] T020 [US3] Implementar em `Carrinho/Screens/CatalogoScreen.tsx` o carregamento independente de categorias com `listarCategorias`, estados de loading/erro e ação de nova tentativa
- [ ] T021 [US3] Renderizar `SeletorCategorias` em `Carrinho/Screens/CatalogoScreen.tsx`, conectar a seleção ao estado `categoriaSelecionada` e enviar `categoria` para `listarProdutos`
- [ ] T022 [US3] Ajustar `Carrinho/Screens/CatalogoScreen.tsx` para tratar erro/lista vazia de categorias e estado sem resultados de categoria sem esconder os produtos já exibidos

**Checkpoint**: US3 funcional sobre a US1.

---

## Phase 6: User Story 4 - Combinar busca e filtro por categoria (Priority: P3)

**Goal**: Busca e categoria aplicadas juntas, com limpeza e preservação do outro filtro.

**Independent Test**: Selecionar "Eletrônicos", buscar "teclado", limpar os filtros e alterar apenas um deles.

### Implementation for User Story 4

- [ ] T023 [US4] Adicionar em `Carrinho/Screens/CatalogoScreen.tsx` resumo de filtros ativos e ação "Limpar filtros" que zera busca e categoria e restaura a lista completa
- [ ] T024 [US4] Garantir em `Carrinho/Screens/CatalogoScreen.tsx` que a consulta combine `buscaAplicada` e `categoriaSelecionada`, que alterar um filtro preserve o outro e que "Tentar novamente" reaplique ambos
- [ ] T025 [US4] Ajustar `Carrinho/Screens/CatalogoScreen.tsx` para usar mensagem de erro adequada a filtros combinados e manter a lista anterior visível com erro inline junto aos filtros

**Checkpoint**: US4 funcional e independente das demais histórias de filtro.

---

## Phase 7: User Story 5 - Abrir os detalhes de um produto (Priority: P3)

**Goal**: Tocar em um produto abre a tela provisória correta com imagem, nome e aviso; voltar preserva os filtros.

**Independent Test**: Tocar em um card, conferir o produto correto, voltar e verificar busca/categoria/posição preservadas.

### Implementation for User Story 5

- [ ] T026 [P] [US5] Criar `Carrinho/Screens/DetalhesProdutoScreen.tsx` recebendo `route.params.produto`, exibindo imagem com fallback, nome, preço opcional e aviso de que os detalhes serão implementados depois, com ação de voltar
- [ ] T027 [US5] Registrar `DetalhesProduto` em `Carrinho/Navigation/AppNavigator.tsx` com o parâmetro `{ produto: Produto }`
- [ ] T028 [US5] Conectar o toque do `CartaoProduto` em `Carrinho/Screens/CatalogoScreen.tsx` à navegação para `DetalhesProduto`, passando o objeto `Produto` completo
- [ ] T029 [US5] Adicionar em `Carrinho/Screens/CatalogoScreen.tsx` uma guarda com `useFocusEffect` para impedir navegações duplicadas em toques repetidos, sem resetar busca, categoria ou lista ao voltar

**Checkpoint**: US5 funcional e integrada ao catálogo.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validação final, mensagens, acessibilidade e segurança

- [ ] T030 Executar `npm run typecheck` em `Carrinho/` e corrigir todos os erros de TypeScript
- [ ] T031 Revisar `Carrinho/Constants/mensagensCatalogo.ts` e `Carrinho/Service/catalogo.ts` para garantir mensagens em português, sem detalhes técnicos, chave da API ou corpo bruto
- [ ] T032 Revisar acessibilidade e layout de `Carrinho/Components/CartaoProduto.tsx`, `Carrinho/Components/SeletorCategorias.tsx` e `Carrinho/Screens/CatalogoScreen.tsx` (roles, labels, estados e nomes longos)
- [ ] T033 Executar o roteiro de `specs/002-catalogo-produtos/quickstart.md` no Expo Web e corrigir divergências encontradas
- [ ] T034 Confirmar que `Carrinho/.env` não foi versionado, que `Carrinho/.env.example` está atualizado e que nenhuma chave aparece em `git diff`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup e bloqueia todas as histórias
- **US1 (Phase 3)**: depende da Foundational
- **US2 (Phase 4)**: depende da US1 (mesma tela)
- **US3 (Phase 5)**: depende da US1; deve ser feita após a US2 por editar o mesmo arquivo
- **US4 (Phase 6)**: depende da US2 e US3
- **US5 (Phase 7)**: depende da US1; a tela T026 pode ser feita em paralelo com US2/US3
- **Polish (Phase 8)**: depende de todas as histórias desejadas

### Within Each User Story

- Tipos e serviços antes da tela
- Componentes antes da integração na tela
- Carregamento/erro antes dos filtros
- Busca e categoria antes da combinação
- Navegação para detalhes depois da lista

### Parallel Opportunities

- T001–T005 podem rodar em paralelo
- T007, T010 e T011 podem rodar em paralelo após o Setup
- T026 pode rodar em paralelo com US2/US3, pois usa arquivo diferente
- T031 e T032 podem rodar em paralelo após a implementação

---

## Parallel Example: Setup

```text
Task: "T001 Exportar tipos em Carrinho/Types/types.ts"
Task: "T002 Criar Carrinho/Types/catalogo.ts"
Task: "T003 Atualizar Carrinho/.env.example"
Task: "T004 Criar Carrinho/Utils/formatacao.ts"
Task: "T005 Criar Carrinho/Constants/mensagensCatalogo.ts"
```

## Parallel Example: Foundational

```text
Task: "T007 Criar Carrinho/Config/apiConfig.ts"
Task: "T010 Criar Carrinho/Components/CartaoProduto.tsx"
Task: "T011 Criar Carrinho/Components/SeletorCategorias.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: US1
4. Validar catálogo, preços, loading, erro, vazio e logout
5. Demonstrar o MVP

### Incremental Delivery

1. US1 → catálogo básico
2. US2 → busca
3. US3 → filtro por categoria
4. US4 → combinação e limpeza
5. US5 → detalhes provisórios
6. Polish → typecheck, acessibilidade, quickstart e segurança

### Parallel Team Strategy

- Setup e Foundational em conjunto
- US1 sozinha
- Depois: US2 e US3 sequenciais na mesma tela; T026 (detalhes) em paralelo
- US4 e US5 por último
