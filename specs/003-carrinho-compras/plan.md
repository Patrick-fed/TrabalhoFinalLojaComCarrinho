# Implementation Plan: Carrinho de Compras

**Branch**: `003-carrinho-compras` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-carrinho-compras/spec.md`

## Summary

Implementar o carrinho como estado global compartilhado entre catálogo, cabeçalho e tela
do carrinho. O catálogo ganha um botão de carrinho com contador e uma ação “Adicionar” no
card. A tela do carrinho permite visualizar itens e totais, alterar quantidades, remover
itens, limpar o carrinho com confirmação, tratar carregamento, erros e estado vazio e
manter isolamento por `uid` do Firebase.

A solução reutiliza React Native, Expo, TypeScript, `fetch`, `AuthContext`,
`Service/rotas.ts`, `Utils/formatacao.ts` e os componentes visuais existentes. Nenhuma
dependência nova será adicionada.

## Technical Context

**Language/Version**: TypeScript 6.0 (`strict: true`), React 19.3, React Native 0.88.1
**Primary Dependencies**: Expo 58, React Navigation 7 (`native-stack`), Firebase 13
(autenticação existente), `fetch` nativo, `Intl.NumberFormat`, `Modal` e `FlatList` do
React Native
**Storage**: Sem persistência local do carrinho. A API é a fonte da verdade; a sessão
Firebase/AsyncStorage existente permanece inalterada.
**Testing**: Sem framework automatizado no projeto; validação com `npm run typecheck`
(`tsc --noEmit`) e roteiro manual do `quickstart.md`.
**Target Platform**: Expo para Android/iOS, com validação principal no Expo Web.
**Project Type**: Aplicativo móvel single-project em `Carrinho/`.
**Performance Goals**: Carrinho visível em até 3 s em conexão normal; operações
refletidas na interface em até 1 s; adicionar um produto em no máximo 2 toques.
**Constraints**: Header `x-api-key` obrigatório; `uid` do Firebase como `usuarioId`;
valores em centavos; sem persistência local, paginação, checkout ou pagamento; sem novas
dependências.
**Scale/Scope**: 1 contexto novo, 1 serviço novo, 1 tela nova, 2 componentes novos e
alterações no catálogo, card e navegação. Carrinho pequeno, sem paginação.

Nenhum item marcado como `NEEDS CLARIFICATION`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Resultado | Justificativa |
|-----------|-----------|---------------|
| I. Simplicidade e Clareza | PASS | O contexto global é o mínimo necessário para manter catálogo, cabeçalho e tela sincronizados; não há cache ou abstração extra. |
| II. Tecnologias e Dependências | PASS | Usa Expo, React Native, `fetch`, `Modal` e componentes existentes, sem dependências novas. |
| III. SOLID | PASS | Serviço concentra HTTP; contexto concentra estado e operações; telas concentram apresentação. |
| IV. Componentes Reutilizáveis | PASS | Cria `ItemCarrinhoCard` e `ModalConfirmacao`, ambos com uso real e props tipadas. |
| V. TypeScript e Tipagem | PASS | Reutiliza `Carrinho` e `ItemCarrinho` de `Types/types.ts` e evita `any`. |
| VI. Organização e Responsabilidades | PASS | Rotas em `Service/rotas.ts`, chamadas em `Service/carrinho.ts`, estado em `Context/`. |
| VII. Preservação do Código Existente | PASS | Catálogo, autenticação e componentes são preservados; mudanças ficam no fluxo do carrinho. |
| VIII. Desenvolvimento por Etapas | PASS | A feature implementa apenas o carrinho, antes de pagamento e pedido. |
| IX. Requisitos do Trabalho | PASS | Cobre carrinho, erros, estoque, confirmação, totais e isolamento por usuário. |
| X. Sem Funcionalidades Desnecessárias | PASS | Fora do escopo: checkout, pagamento, histórico, cupons, frete e offline. |
| XI. Interface e Estilos | PASS | Reutiliza `CORES` e `StyleSheet`, mantendo a paleta azul existente. |
| XII. Aprendizado e Compreensão | PASS | Fluxo explícito e rastreável: tela → contexto → serviço → API → tipos. |

**Post-design re-check**: PASS. Nenhuma violação identificada; a seção de complexidade
não se aplica.

## Project Structure

### Documentation (this feature)

```text
specs/003-carrinho-compras/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas e achados da API
├── data-model.md        # Entidades, validações e transições
├── quickstart.md        # Configuração e roteiro manual
├── contracts/
│   ├── api.md           # Endpoints do carrinho e erros
│   ├── services.md      # Serviço e contexto
│   └── ui-navigation.md # Navegação, componentes e estados
├── checklists/
│   └── requirements.md  # Checklist já aprovado
└── tasks.md             # Gerado por /speckit.tasks (não neste comando)
```

### Source Code (repository root)

```text
Carrinho/
├── App.tsx                              # ALTERAR: envolver navegador com CarrinhoProvider
├── Context/
│   ├── AuthContext.tsx                  # existente, sem alteração
│   └── CarrinhoContext.tsx              # NOVO: estado e operações do carrinho
├── Service/
│   ├── auth.ts                          # existente, sem alteração
│   ├── catalogo.ts                      # existente, sem alteração
│   ├── rotas.ts                         # existente; rotas de carrinho já disponíveis
│   └── carrinho.ts                      # NOVO: HTTP e validação do carrinho
├── Types/
│   ├── types.ts                         # existente; reutilizar Carrinho e ItemCarrinho
│   ├── carrinho.ts                      # NOVO: ErroCarrinho e OperacaoCarrinho
│   └── navigation.ts                    # ALTERAR: adicionar Carrinho
├── Constants/
│   ├── cores.ts                         # existente
│   ├── mensagensCatalogo.ts             # existente
│   └── mensagensCarrinho.ts             # NOVO: textos e erros do carrinho
├── Components/
│   ├── BotaoPrincipal.tsx               # existente, reutilizado
│   ├── CartaoProduto.tsx                # ALTERAR: ação Adicionar/Esgotado
│   ├── ItemCarrinhoCard.tsx             # NOVO: item, quantidades e remoção
│   ├── MensagemErro.tsx                 # existente, reutilizado
│   └── ModalConfirmacao.tsx             # NOVO: confirmação de limpeza
├── Screens/
│   ├── CatalogoScreen.tsx               # ALTERAR: badge, adicionar e feedback
│   └── CarrinhoScreen.tsx               # NOVO: tela do carrinho
├── Navigation/
│   └── AppNavigator.tsx                 # ALTERAR: registrar Carrinho
└── Utils/
    ├── erros.ts                         # existente, reutilizado
    └── formatacao.ts                    # existente, reutilizado
```

**Structure Decision**: Single-project mobile em `Carrinho/`, mantendo a organização por
responsabilidade já usada. O contexto é justificado pela necessidade real de estado
compartilhado entre cabeçalho, catálogo e tela do carrinho.

## Phase 0: Research Summary

As decisões completas estão em [research.md](./research.md). Resumo:

| ID | Decisão |
|----|---------|
| D-201 | Criar `Context/CarrinhoContext.tsx` como fonte única do carrinho. |
| D-202 | Criar `Service/carrinho.ts` com busca, adição, atualização, remoção e limpeza. |
| D-203 | Usar `POST { produtoId, quantidade }` e `PUT { quantidade }`; normalizar a resposta e refazer `GET` quando necessário. |
| D-204 | Permitir uma mutação por vez com trava em `ref` + identificadores de requisição e sessão. |
| D-205 | Carregar o carrinho ao ter usuário autenticado; recarregar em retry ou quando não houver dados. |
| D-206 | Descartar o estado ao logout/troca de `uid` e ignorar respostas atrasadas. |
| D-207 | Exibir botão “Carrinho” com badge de `quantidadeTotal` no cabeçalho do catálogo. |
| D-208 | Adicionar ação “Adicionar” no card, separada da navegação, com “Esgotado” e spinner. |
| D-209 | Criar `CarrinhoScreen` com lista, resumo, controles de quantidade e remoção. |
| D-210 | Usar `ModalConfirmacao` customizado para limpar o carrinho. |
| D-211 | Usar `subtotal`, `quantidadeTotal` e `total` retornados pela API; não recalcular localmente. |
| D-212 | Mapear erros para mensagens em português, sem expor detalhes técnicos. |
| D-213 | Não adicionar framework de testes; validar com `tsc --noEmit` e quickstart manual. |

## Phase 1: Design Summary

### Tipos e modelo

- Reutilizar `Carrinho` e `ItemCarrinho` de `Types/types.ts`.
- Criar `Types/carrinho.ts` com `ErroCarrinho` e `OperacaoCarrinho`.
- O estado completo e as transições estão em [data-model.md](./data-model.md).

### Camada de serviço

- `Service/carrinho.ts` expõe:
  - `buscarCarrinho(usuarioId, signal?)`;
  - `adicionarItem(usuarioId, produtoId, quantidade, signal?)`;
  - `atualizarQuantidade(usuarioId, produtoId, quantidade, signal?)`;
  - `removerItem(usuarioId, produtoId, signal?)`;
  - `limparCarrinho(usuarioId, signal?)`.
- Todas as mutações enviam `x-api-key`, `Accept` e `Content-Type` quando houver corpo.
- O serviço valida o `Carrinho` retornado. Se a mutação não retornar um carrinho válido,
  busca o estado canônico com `GET /carrinho/:usuarioId`.
- Erros são convertidos em `ErroCarrinho` com `codigo` e `mensagem`, sem corpo bruto ou
  chave da API.
- Cancelamentos (`AbortError`) não viram erro de tela.

### Contexto

- `CarrinhoProvider` fica dentro de `AuthProvider` e usa `useAuth`.
- Estado: `carrinho`, `carregando`, `erro` e `operacao`.
- Operações expostas: `recarregar`, `adicionarProduto`, `alterarQuantidade`,
  `removerItem` e `limparCarrinho`.
- Carregar ao obter `usuario.uid`; limpar estado e abortar requisições ao logout/troca.
- Apenas uma mutação por vez; chamadas concorrentes são ignoradas.
- Operações com erro preservam o carrinho anterior e lançam `ErroCarrinho` para a tela
  exibir a mensagem no contexto adequado.

### Interface

- Catálogo: cabeçalho com botão “Carrinho” e badge; ação “Adicionar” no card; banner de
  sucesso temporário; erro de adição inline.
- Card: imagem, nome, preço e detalhes preservados; ação separada para não abrir detalhes;
  “Esgotado” quando `estoque <= 0`; spinner durante adição.
- Carrinho: carregamento, erro com retry, estado vazio, lista de itens, controles de
  quantidade, remoção, limpeza com confirmação e resumo de totais.
- Imagem indisponível usa placeholder sem esconder nome, preço e quantidades.

### Navegação

- `AppStackParamList` passa a ter `Carrinho: undefined`.
- `AppNavigator` registra `CarrinhoScreen`.
- O catálogo permanece montado na pilha; ao voltar do carrinho, busca, categoria e posição
  da lista são preservadas.

## Implementation Sequence

1. Criar `Types/carrinho.ts` e adicionar `Carrinho` em `Types/navigation.ts`.
2. Criar `Constants/mensagensCarrinho.ts`.
3. Implementar `Service/carrinho.ts` com validação, normalização e erros amigáveis.
4. Criar `Context/CarrinhoContext.tsx` e envolver o navegador em `App.tsx`.
5. Criar `Components/ModalConfirmacao.tsx`.
6. Criar `Components/ItemCarrinhoCard.tsx`.
7. Alterar `Components/CartaoProduto.tsx` para a ação de adicionar.
8. Alterar `Screens/CatalogoScreen.tsx` para badge, adição, feedback e navegação.
9. Criar `Screens/CarrinhoScreen.tsx`.
10. Registrar `Carrinho` em `Navigation/AppNavigator.tsx`.
11. Executar `npm run typecheck` em `Carrinho/`.
12. Validar o roteiro do `quickstart.md` no Expo Web e, se possível, no mobile.

## Validation Strategy

- `cd Carrinho && npm run typecheck` sem erros.
- API real:
  - `GET /carrinho/:uid` retorna carrinho válido;
  - a primeira chamada de `POST`/`PUT`/`DELETE` confirma os formatos de corpo e resposta;
  - se a resposta não for um carrinho, o fallback `GET` mantém a tela correta.
- Manual:
  - adicionar do card, contador e feedback;
  - adicionar novamente incrementa sem duplicar;
  - produto esgotado e estoque insuficiente;
  - aumentar/diminuir, com mínimo 1;
  - remover item e remover o último;
  - limpar com cancelar/confirmar;
  - carregamento, erro de rede, resposta inválida e retry;
  - imagem indisponível;
  - voltar ao catálogo preservando busca/categoria/posição;
  - logout e login de outro usuário sem vazamento de carrinho;
  - reabrir o app com sessão ativa e recarregar da API.

## Risks and Mitigations

| Risco | Mitigação |
|-------|-----------|
| Formato de resposta das mutações diferente do esperado | Serviço normaliza e refaz `GET` quando o corpo não for um carrinho válido. |
| Respostas atrasadas sobrescrevendo estado | Trava de mutação única + `requisicaoRef` + `sessaoRef`. |
| Logout durante requisição | Abortar/invalidar requisição e limpar estado ao trocar `uid`. |
| `Alert` inconsistente no Expo Web | Usar `ModalConfirmacao` customizado. |
| Cabeçalho apertado com badge e logout | Botão compacto, badge e ajuste de layout em uma linha. |
| Estoque rejeitado com status ambíguo | Tratar 400/409/422 como falha de quantidade/estoque com mensagem amigável. |
| Sem testes automatizados | `tsc --noEmit` + quickstart manual cobrindo todos os fluxos. |

## Complexity Tracking

Nenhuma violação da constituição. Não há complexidade adicional a justificar.
