# Implementation Plan: Catálogo de Produtos

**Branch**: `002-catalogo-produtos` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-catalogo-produtos/spec.md`

## Summary

Substituir a `HomeScreen` provisória por um catálogo autenticado que lista os produtos
da API com imagem, nome e preço em reais. A tela combina busca por nome (debounce de
300 ms) e filtro por categoria, mantém a lista anterior visível quando uma nova consulta
falha e trata carregamento, erros, lista vazia e categorias indisponíveis. O toque em um
produto abre uma tela provisória de detalhes, recebendo o objeto `Produto` completo. O
logout permanece acessível no cabeçalho da tela principal.

A implementação reutiliza React Native, Expo, TypeScript, os componentes existentes
(`CampoTexto`, `BotaoPrincipal`, `MensagemErro`), o `AuthContext` e a organização atual
de `Service/`, `Types/`, `Utils/` e `Constants/`. Não há novas dependências.

## Technical Context

**Language/Version**: TypeScript 6.0 (`strict: true`), React 19.3, React Native 0.88.1
**Primary Dependencies**: Expo 58, React Navigation 7 (`native-stack`), Firebase 13
(apenas autenticação já existente), `fetch` nativo, `Intl.NumberFormat`
**Storage**: Nenhuma persistência local de catálogo; produtos e categorias vêm da API
externa. A sessão continua no Firebase/AsyncStorage, sem alteração.
**Testing**: Sem framework automatizado no projeto; validação com `npm run typecheck`
(`tsc --noEmit`) e roteiro manual do `quickstart.md`.
**Target Platform**: Aplicativo móvel Expo para Android/iOS, com validação principal no
Expo Web (`npx expo start --web`).
**Project Type**: Mobile app single-project em `Carrinho/`.
**Performance Goals**: Catálogo visível em até 3 s em conexão normal; busca disparada
após 300 ms sem digitação e atualizada em até 1 s; lista de 24 produtos sem paginação.
**Constraints**: Header `x-api-key` obrigatório; chave e URL em variáveis
`EXPO_PUBLIC_*`; preços em centavos; 9 categorias retornadas pela API; busca
case-insensitive e sensível a acentos (comportamento da API); `FlatList` obrigatória;
sem paginação, cache offline ou ordenação.
**Scale/Scope**: Protótipo acadêmico; 1 tela de catálogo, 1 tela provisória de detalhes,
3 componentes novos e 1 serviço de API.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Justificativa |
|-----------|-----------|---------------|
| I. Simplicidade e Clareza | PASS | Estado local na tela, serviço direto e componentes pequenos; sem Redux, cache ou abstrações extras. |
| II. Tecnologias e Dependências | PASS | Nenhuma dependência nova; `fetch`, `Intl` e componentes existentes atendem. |
| III. SOLID | PASS | Serviço concentra HTTP; tela concentra estado/UI; componentes recebem props tipadas. |
| IV. Componentes Reutilizáveis | PASS | Reutiliza `CampoTexto`, `BotaoPrincipal` e `MensagemErro`; cria apenas card e seletor com uso real. |
| V. TypeScript e Tipagem | PASS | Exporta e completa `Types/types.ts`, reutiliza `Produto` e evita `any`. |
| VI. Organização e Responsabilidades | PASS | Chamadas em `Service/catalogo.ts`; URLs em `Service/rotas.ts`; configuração em `Config/apiConfig.ts`. |
| VII. Preservação do Código Existente | PASS | Autenticação, componentes e estilos são mantidos; só a Home provisória é substituída. |
| VIII. Desenvolvimento por Etapas | PASS | A feature é implementada sozinha, antes de detalhes completos e carrinho. |
| IX. Requisitos do Trabalho | PASS | Cobre catálogo, busca, filtro, carregamento, erros e navegação para detalhes. |
| X. Sem Funcionalidades Desnecessárias | PASS | Fora de escopo: ordenação, paginação, favoritos, cache e detalhes completos. |
| XI. Interface e Estilos | PASS | Usa `CORES`, `StyleSheet`, layout limpo e identidade azul existente. |
| XII. Aprendizado e Compreensão | PASS | Fluxo explícito: tela → serviço → API → tipos → componentes. |

**Post-design re-check**: PASS. Nenhuma violação identificada; a seção de complexidade
não se aplica.

## Project Structure

### Documentation (this feature)

```text
specs/002-catalogo-produtos/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas e achados da API
├── data-model.md        # Entidades, filtros e transições de estado
├── quickstart.md        # Roteiro de configuração e validação manual
├── contracts/
│   ├── api.md           # Contrato dos endpoints e erros
│   ├── services.md      # Assinaturas da camada de serviço
│   └── ui-navigation.md # Contrato de navegação e estados de interface
├── checklists/
│   └── requirements.md  # Checklist já aprovado
└── tasks.md             # Gerado por /speckit.tasks (não neste comando)
```

### Source Code (repository root)

```text
Carrinho/
├── Config/
│   ├── fireBase.ts                 # existente, sem alteração
│   ├── fireBaseConfig.ts           # existente, sem alteração
│   └── apiConfig.ts                # NOVO: URL e chave da API via EXPO_PUBLIC_*
├── Service/
│   ├── auth.ts                     # existente, sem alteração
│   ├── rotas.ts                    # ALTERAR: usar API_URL de apiConfig
│   └── catalogo.ts                 # NOVO: listarProdutos e listarCategorias
├── Types/
│   ├── auth.ts                     # existente
│   ├── types.ts                    # ALTERAR: exportar tipos e completar Categoria
│   ├── catalogo.ts                 # NOVO: filtros, categoria da API e erro de catálogo
│   └── navigation.ts               # ALTERAR: Catalogo e DetalhesProduto
├── Constants/
│   ├── cores.ts                    # existente
│   ├── mensagensErro.ts            # existente (reutiliza mensagem padrão)
│   └── mensagensCatalogo.ts        # NOVO: textos de estado/erro do catálogo
├── Utils/
│   ├── erros.ts                    # existente, reutilizado
│   └── formatacao.ts               # NOVO: formatarPrecoCentavos
├── Components/
│   ├── CampoTexto.tsx              # existente, reutilizado
│   ├── BotaoPrincipal.tsx          # existente, reutilizado
│   ├── MensagemErro.tsx            # existente, reutilizado
│   ├── CartaoProduto.tsx           # NOVO: card com imagem, nome e preço
│   └── SeletorCategorias.tsx       # NOVO: chips horizontais + "Todas"
├── Screens/
│   ├── CatalogoScreen.tsx          # NOVO: substitui a Home provisória
│   ├── DetalhesProdutoScreen.tsx   # NOVO: tela provisória de detalhes
│   └── HomeScreen.tsx              # REMOVER após a troca no navegador
├── Navigation/
│   └── AppNavigator.tsx            # ALTERAR: Catalogo + DetalhesProduto
└── .env.example                    # ALTERAR: documentar API_URL e API_KEY
```

**Structure Decision**: Single-project mobile em `Carrinho/`, mantendo a organização por
responsabilidade já usada. A feature adiciona um serviço de catálogo, dois componentes e
duas telas, sem criar camadas ou pastas novas além das existentes.

## Phase 0: Research Summary

As decisões completas estão em [research.md](./research.md). Resumo:

| ID | Decisão |
|----|---------|
| D-101 | Usar `fetch` nativo e um único `Service/catalogo.ts`, sem Axios. |
| D-102 | Ler `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_API_KEY` em `Config/apiConfig.ts`, com falha explícita se ausentes. |
| D-103 | Exportar os tipos de `Types/types.ts` e completar `Categoria` com as 9 categorias da API. |
| D-104 | Reutilizar `Produto`; criar `Types/catalogo.ts` apenas para filtros, categoria da API e erro. |
| D-105 | Busca com debounce de 300 ms em estado separado (`buscaAplicada`). |
| D-106 | Cancelar/ignorar respostas antigas com `AbortController` + verificação de requisição atual. |
| D-107 | Carregamento inicial em tela cheia; consultas seguintes mantêm a lista e usam indicador discreto. |
| D-108 | Falha em consulta posterior mantém a lista anterior e exibe erro inline junto aos filtros. |
| D-109 | Produtos e categorias são carregados independentemente; falha de categorias não esconde produtos. |
| D-110 | Filtro por categoria com chips horizontais e opção "Todas"; sem biblioteca de picker. |
| D-111 | Preço formatado com `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`. |
| D-112 | Navegação para detalhes recebe o objeto `Produto` completo, sem `GET /produtos/:id`. |
| D-113 | Logout permanece no cabeçalho customizado da tela de catálogo, reutilizando `useAuth`. |
| D-114 | Proteção de acesso continua exclusivamente no `AppNavigator`/`AuthContext`. |
| D-115 | Sem framework de testes; validação por `tsc --noEmit` e quickstart manual. |

## Phase 1: Design Summary

### Tipos e modelo

- `Produto` e `Categoria` passam a ser exportados de `Types/types.ts`.
- `Categoria` cobre: `eletronicos`, `roupas`, `casa`, `livros`, `cervejas`, `carnes`,
  `refrigerantes`, `chocolates`, `cachorro-quente`.
- `Types/catalogo.ts` define `CategoriaDisponivel` (`id`, `nome`), `FiltrosCatalogo`
  (`busca`, `categoria`) e `ErroCatalogo` (`codigo`, `mensagem`).
- O modelo completo e as transições estão em [data-model.md](./data-model.md).

### Camada de serviço

- `Config/apiConfig.ts` valida e exporta `API_URL` e `API_KEY`.
- `Service/rotas.ts` passa a montar as URLs a partir de `API_URL`, mantendo as rotas
  existentes.
- `Service/catalogo.ts` expõe:
  - `listarProdutos(filtros, signal?)`: monta query apenas com valores não vazios,
    envia `x-api-key`, valida o formato da resposta e converte falhas em `ErroCatalogo`.
  - `listarCategorias(signal?)`: mesma política de erro e validação.
- Erros HTTP são traduzidos para mensagens em português, sem exibir detalhes técnicos.
- Respostas canceladas não viram erro de tela.

### Estado da tela

- `busca` (texto digitado) e `buscaAplicada` (valor após 300 ms).
- `categoriaSelecionada` (`Categoria | null`).
- `produtos`, `categorias`, `carregandoInicial`, `atualizando`, `erroProdutos`,
  `erroCategorias`, `saindo` e `erroLogout`.
- Produtos e categorias são buscados em efeitos independentes.
- Uma consulta de produtos só aplica o resultado se ainda corresponder aos filtros
  atuais; respostas antigas são abortadas/ignoradas.
- O botão "Tentar novamente" reaplica os filtros ativos e fica desabilitado enquanto
  houver requisição em andamento.

### Interface

- Cabeçalho customizado com título "Loja Virtual", identificação do usuário e botão
  "Sair" com estado de carregamento.
- Campo de busca usando `CampoTexto`, botão para limpar e indicação de filtros ativos.
- `SeletorCategorias` em `ScrollView` horizontal com chip "Todas" e as categorias da API.
- `FlatList` de produtos com `CartaoProduto` (imagem, nome, preço e fallback de imagem).
- `ListEmptyComponent` diferencia catálogo vazio de nenhum resultado para os filtros.
- Erro de categorias aparece na área de filtros; erro de produtos aparece em tela cheia
  apenas quando ainda não há lista carregada.
- Detalhes provisórios exibem imagem, nome e o aviso de implementação futura.

### Navegação

- `AppStackParamList` passa a ter `Catalogo: undefined` e
  `DetalhesProduto: { produto: Produto }`.
- `AppNavigator` registra as duas telas na pilha autenticada e mantém `headerShown:
  false`; o catálogo desenha seu próprio cabeçalho e os detalhes têm ação de voltar.
- O retorno dos detalhes preserva busca, categoria e posição da lista porque a tela de
  catálogo permanece montada na pilha.
- Um guarda simples evita abrir várias telas de detalhes em toques repetidos.

## Implementation Sequence

1. Atualizar `Types/types.ts`, criar `Types/catalogo.ts` e ajustar `Types/navigation.ts`.
2. Criar `Config/apiConfig.ts`, atualizar `Service/rotas.ts` e documentar variáveis em
   `.env.example`.
3. Criar `Utils/formatacao.ts` e `Constants/mensagensCatalogo.ts`.
4. Implementar `Service/catalogo.ts` com validação, erros amigáveis e suporte a
   `AbortSignal`.
5. Criar `Components/CartaoProduto.tsx` e `Components/SeletorCategorias.tsx`.
6. Implementar `Screens/CatalogoScreen.tsx` com busca, filtros, estados e logout.
7. Criar `Screens/DetalhesProdutoScreen.tsx`.
8. Atualizar `Navigation/AppNavigator.tsx` e remover `Screens/HomeScreen.tsx` após a
   substituição.
9. Executar `npm run typecheck` em `Carrinho/` e corrigir eventuais erros.
10. Validar o roteiro do `quickstart.md` no Expo Web, incluindo falhas de rede e
    preservação de filtros.

## Validation Strategy

- `cd Carrinho && npm run typecheck` sem erros.
- API real: `/categorias`, `/produtos`, busca, categoria e combinação retornam 200.
- Sem chave ou com chave inválida, a tela mostra erro em português e permite tentar
  novamente.
- Categoria inválida (400), 404 e 5xx não expõem detalhes técnicos.
- Busca "teclado", "Teclado" e "TECLADO" retornam o mesmo produto; "mecanico" não
  encontra "Teclado mecânico" porque a API é sensível a acentos.
- Falha após a lista carregada mantém os produtos visíveis e mostra erro inline.
- Logout funciona a partir do cabeçalho e a pilha autenticada é descartada.

## Risks and Mitigations

| Risco | Mitigação |
|-------|-----------|
| Respostas fora de ordem durante digitação rápida | `AbortController` + verificação da requisição atual antes de aplicar o resultado. |
| Categorias da API mudarem | Filtro usa os IDs retornados por `/categorias`; a union é apenas tipagem e pode ser atualizada. |
| `Intl` indisponível em alguma plataforma | Validar no Expo Web e no dispositivo; se necessário, usar formatação manual de centavos como fallback. |
| Imagem remota indisponível | `onError` no card troca a imagem por um placeholder, mantendo nome e preço. |
| Lista recarregando e erro simultâneo | Estados separados para carregamento inicial, atualização e erro; erro posterior preserva a lista anterior. |

## Complexity Tracking

Nenhuma violação da constituição. Não há complexidade adicional a justificar.
