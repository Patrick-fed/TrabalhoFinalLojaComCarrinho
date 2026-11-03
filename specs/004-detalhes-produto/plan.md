# Implementation Plan: Detalhes do Produto

**Branch**: `004-detalhes-produto` | **Date**: 2026-11-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-detalhes-produto/spec.md`

## Summary

Evoluir a tela `DetalhesProduto` existente para exibir imagem ampliada, nome, descrição
completa, preço em reais e estoque disponível, buscando os dados atualizados por
`GET /produtos/:id`. A tela deve permitir adicionar o produto ao carrinho reutilizando o
`CarrinhoContext` existente, bloquear a adição sem estoque, exibir confirmação/erros e
tratar carregamento, falha com retry e produto não encontrado.

A solução reutiliza React Native, Expo, TypeScript, `fetch`, `Service/catalogo.ts`,
`Service/rotas.ts`, `CarrinhoContext`, `Utils/erros.ts`, `Utils/formatacao.ts`,
`BotaoPrincipal`, `MensagemErro` e `CORES`. Nenhuma dependência nova será adicionada.

## Technical Context

**Language/Version**: TypeScript 6.0 (`strict: true`), React 19.3, React Native 0.88.1
**Primary Dependencies**: Expo 58, React Navigation 7 (`native-stack`), Firebase 13
(autenticação existente), `fetch` nativo, componentes existentes do projeto
**Storage**: Sem persistência local dos detalhes; o carrinho permanece no
`CarrinhoContext` e a sessão Firebase/AsyncStorage existente não muda.
**Testing**: Sem framework automatizado; validação com `npm run typecheck` e roteiro
manual do `quickstart.md`.
**Target Platform**: Expo para Android/iOS, com validação principal no Expo Web.
**Project Type**: Aplicativo móvel single-project em `Carrinho/`.
**Performance Goals**: Detalhes visíveis em até 3 s em conexão normal; adição refletida na
interface em até 1 s; adicionar em 1 toque a partir dos detalhes.
**Constraints**: Header `x-api-key` obrigatório; `GET /produtos/:id`; preços em centavos;
quantidade inicial 1; sem novas dependências; preservar catálogo e carrinho.
**Scale/Scope**: 1 tela evoluída, 1 função de serviço, 1 arquivo de mensagens; sem novo
contexto, sem mudança de navegação e sem alteração no catálogo.

Nenhum item marcado como `NEEDS CLARIFICATION`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Resultado | Justificativa |
|-----------|-----------|---------------|
| I. Simplicidade e Clareza | PASS | Reaproveita tela, serviço, contexto e componentes existentes; sem abstrações novas. |
| II. Tecnologias e Dependências | PASS | Usa Expo, React Native, `fetch` e componentes atuais, sem dependências novas. |
| III. SOLID | PASS | Serviço concentra HTTP; tela concentra apresentação; carrinho permanece no contexto. |
| IV. Componentes Reutilizáveis | PASS | Reutiliza `BotaoPrincipal`, `MensagemErro` e `CarregandoScreen`. |
| V. TypeScript e Tipagem | PASS | Reutiliza `Produto` e `ErroCatalogo`; evita `any`. |
| VI. Organização e Responsabilidades | PASS | `buscarProdutoPorId` fica em `Service/catalogo.ts`; rota em `Service/rotas.ts`. |
| VII. Preservação do Código Existente | PASS | Tela existente é evoluída; catálogo, carrinho e navegação são preservados. |
| VIII. Desenvolvimento por Etapas | PASS | Feature focada apenas nos detalhes, antes de pagamento/pedido. |
| IX. Requisitos do Trabalho | PASS | Cobre detalhes, estoque, adição, erros, loading e integração existente. |
| X. Sem Funcionalidades Desnecessárias | PASS | Sem quantidade, checkout, avaliações, recomendações ou cache. |
| XI. Interface e Estilos | PASS | Mantém `CORES`, `StyleSheet` e a paleta azul existente. |
| XII. Aprendizado e Compreensão | PASS | Fluxo claro: tela → serviço → API → tipos; carrinho via contexto existente. |

**Post-design re-check**: PASS. Nenhuma violação; a seção de complexidade não se aplica.

## Project Structure

### Documentation (this feature)

```text
specs/004-detalhes-produto/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas e achados da API
├── data-model.md        # Entidades, validações e transições
├── quickstart.md        # Configuração e roteiro manual
├── contracts/
│   ├── api.md           # Endpoint de detalhes e erros
│   ├── services.md      # Serviço e integração com o carrinho
│   └── ui-navigation.md # Rota, estados e componentes da tela
├── checklists/
│   └── requirements.md  # Checklist já aprovado
└── tasks.md             # Gerado por /speckit.tasks (não neste comando)
```

### Source Code (repository root)

```text
Carrinho/
├── Service/
│   └── catalogo.ts                  # ALTERAR: adicionar buscarProdutoPorId
├── Screens/
│   └── DetalhesProdutoScreen.tsx    # ALTERAR: implementação completa
├── Constants/
│   └── mensagensDetalhesProduto.ts  # NOVO: textos da tela
├── Components/
│   ├── BotaoPrincipal.tsx           # existente, reutilizado
│   └── MensagemErro.tsx             # existente, reutilizado
├── Context/
│   └── CarrinhoContext.tsx          # existente, reutilizado (adicionarProduto/operacao/carrinho)
├── Types/
│   ├── types.ts                     # existente; reutilizar Produto
│   └── catalogo.ts                  # existente; reutilizar ErroCatalogo
├── Utils/
│   ├── erros.ts                     # existente, reutilizado
│   └── formatacao.ts                # existente, reutilizado
├── Screens/
│   └── CatalogoScreen.tsx           # sem alteração (já navega com produto)
├── Navigation/
│   └── AppNavigator.tsx             # sem alteração
└── Types/
    └── navigation.ts                # sem alteração
```

**Structure Decision**: Single-project mobile em `Carrinho/`, mantendo a separação por
responsabilidade já usada. A rota existente recebe o `Produto` do catálogo para render
imediato e a tela atualiza os dados via serviço.

## Phase 0: Research Summary

As decisões completas estão em [research.md](./research.md). Resumo:

| ID | Decisão |
|----|---------|
| D-301 | Manter a rota `DetalhesProduto: { produto: Produto }` e buscar dados atualizados por `GET /produtos/:id`. |
| D-302 | Adicionar `buscarProdutoPorId` em `Service/catalogo.ts`, reutilizando `requisitar`, `converterProduto` e `erroPorStatus`. |
| D-303 | Reutilizar `adicionarProduto(produtoId, 1)` do `CarrinhoContext`; não criar nova lógica de carrinho. |
| D-304 | Calcular disponibilidade como `max(estoque - quantidadeNoCarrinho, 0)`, consistente com o catálogo. |
| D-305 | Permanecer na tela após adicionar, com banner temporário de sucesso; o badge do carrinho é atualizado pelo contexto. |
| D-306 | Usar `AbortController` + identificador de requisição para descartar respostas atrasadas e cancelar ao desmontar. |
| D-307 | Mapear erros com `ErroCatalogo` + `obterMensagemDeErro`; tratar `http_404` como produto indisponível. |
| D-308 | Reutilizar `BotaoPrincipal`, `MensagemErro`, `CarregandoScreen`, `CORES` e o padrão de fallback de imagem. |
| D-309 | Não adicionar dependências nem framework de testes; validar com `tsc --noEmit` e quickstart manual. |

## Phase 1: Design Summary

### Modelo

- Reutilizar `Produto` de `Types/types.ts` e `ErroCatalogo` de `Types/catalogo.ts`.
- Estado da tela: `produto`, `carregando`, `erro`, `erroAdicao`, `sucessoAdicao`,
  `imagemFalhou`.
- Derivados: `quantidadeNoCarrinho`, `estoqueDisponivel`, `esgotado`, `adicionando`,
  `adicaoDesabilitada`.
- O estado completo e as transições estão em [data-model.md](./data-model.md).

### Camada de serviço

- `Service/catalogo.ts` passa a expor
  `buscarProdutoPorId(id: number, signal?: AbortSignal): Promise<Produto>`.
- Usa `ROTAS.produtoPorId(id)`, header `x-api-key` e `Accept`.
- Valida a resposta com `converterProduto`; mapeia 400/401/403/404/5xx, rede, resposta
  inválida e cancelamento.
- Propaga `AbortError`; não expõe corpo bruto, chave ou stack trace.

### Interface

- Cabeçalho com “Voltar” e título “Detalhes do produto”.
- Imagem ampliada com fallback; nome; descrição completa; preço formatado; estoque.
- Indicador discreto de atualização quando já houver produto inicial.
- Erro com “Tentar novamente”; estado específico para produto indisponível (404).
- Banner de sucesso temporário e erro inline de adição.
- `BotaoPrincipal` com “Adicionar ao carrinho” ou “Esgotado”, spinner durante a adição.

### Navegação

- Rota e `AppNavigator` permanecem inalterados.
- O catálogo continua passando o produto e preserva busca, categoria e posição ao voltar.

## Implementation Sequence

1. Adicionar `buscarProdutoPorId` em `Carrinho/Service/catalogo.ts`.
2. Criar `Carrinho/Constants/mensagensDetalhesProduto.ts`.
3. Evoluir `Carrinho/Screens/DetalhesProdutoScreen.tsx` com busca, estados e adição.
4. Confirmar reutilização de `BotaoPrincipal`, `MensagemErro` e `CarregandoScreen`.
5. Atualizar a referência do plano no `AGENTS.md` para `specs/004-detalhes-produto/plan.md`.
6. Executar `cd Carrinho && npm run typecheck`.
7. Validar o roteiro de `quickstart.md` no Expo Web e, se possível, no mobile.

## Validation Strategy

- `cd Carrinho && npm run typecheck` sem erros.
- Manual:
  - abrir detalhes pelo catálogo e conferir todos os campos;
  - preço em `R$ 0,00`, descrição longa com rolagem e estoque correto;
  - adicionar ao carrinho, conferir feedback e badge;
  - adicionar novamente e verificar incremento;
  - produto esgotado e estoque insuficiente;
  - falha de rede com retry; produto removido (404);
  - imagem indisponível;
  - retorno ao catálogo preservando busca/categoria/posição;
  - troca de usuário sem vazamento de estado;
  - toques repetidos sem requisição duplicada.

## Risks and Mitigations

| Risco | Mitigação |
|-------|-----------|
| Dados desatualizados na navegação | Buscar `GET /produtos/:id` ao montar, usando o produto da rota apenas como render inicial. |
| Resposta atrasada de outro produto | `AbortController` + identificador de requisição; descartar respostas obsoletas. |
| Estoque divergente do catálogo | Calcular disponibilidade descontando a quantidade já no carrinho. |
| Produto removido | Tratar `http_404` com estado específico e opção de voltar. |
| Adição duplicada | Usar `operacao` do contexto e desabilitar o botão durante a operação. |
| Resposta inválida da API | Validar com `converterProduto` e exibir mensagem amigável. |
| Sem testes automatizados | `tsc --noEmit` + quickstart manual cobrindo fluxos e falhas. |

## Complexity Tracking

Nenhuma violação da constituição. Não há complexidade adicional a justificar.
