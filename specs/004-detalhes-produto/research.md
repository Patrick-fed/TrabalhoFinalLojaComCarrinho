# Research: Detalhes do Produto

**Feature**: `004-detalhes-produto` | **Date**: 2026-11-03

Este documento registra as decisões técnicas da feature e os achados da API usados no
plano. Nenhuma nova dependência é necessária.

## Achados da API

**Base URL**: `https://loja-api-wheat.vercel.app` (variável `EXPO_PUBLIC_API_URL`)
**Autenticação**: header obrigatório `x-api-key` (variável `EXPO_PUBLIC_API_KEY`)

O contrato de `GET /produtos/:id` já está documentado em
`specs/002-catalogo-produtos/contracts/api.md`:

```text
GET /produtos/:id
```

| Verificação | Resultado |
|-------------|-----------|
| Resposta 200 | Objeto com `id`, `nome`, `descricao`, `preco`, `categoria`, `estoque` e `imagem` |
| Resposta 404 | `{ "erro": "Produto não encontrado." }` |
| Valores monetários | Centavos (`19990` = `R$ 199,90`) |
| `x-api-key` | Obrigatório na rota protegida |

**Implicações**:

- A tela deve buscar os dados atualizados ao abrir, usando o produto recebido pela
  navegação apenas como conteúdo inicial.
- O `404` precisa de tratamento específico, pois o produto pode ter sido removido.
- O estoque retornado deve ser exibido e usado para bloquear a adição.
- A chave não deve aparecer em logs, mensagens ou código versionado.

## D-301: Busca dos detalhes

**Decision**: Manter a rota `DetalhesProduto: { produto: Produto }` e executar
`GET /produtos/:id` ao montar a tela. O produto da rota é usado como render inicial até a
resposta da API.

**Rationale**: Preserva o comportamento existente do catálogo, exibe conteúdo
imediatamente e garante que descrição, preço e estoque estejam atualizados. Evita uma tela
em branco durante a consulta.

**Alternatives considered**:

- Exibir apenas o produto recebido pela navegação: não atenderia ao requisito de buscar os
  detalhes atualizados.
- Passar apenas o identificador na rota: exigiria alterar o catálogo e perderia o render
  imediato, sem benefício para o escopo.
- Buscar novamente a cada foco: geraria requisições desnecessárias.

## D-302: Camada de serviço

**Decision**: Adicionar `buscarProdutoPorId` em `Service/catalogo.ts`, reutilizando
`requisitar`, `converterProduto` e `erroPorStatus` já existentes.

**Rationale**: A constituição exige centralizar chamadas HTTP em `Service/` e manter as
telas focadas em apresentação. O domínio é o mesmo do catálogo e a rota já existe em
`Service/rotas.ts` como `ROTAS.produtoPorId`.

**Alternatives considered**:

- Criar `Service/detalhesProduto.ts`: duplicaria validação e mapeamento de erros do
  catálogo sem necessidade.
- Chamar `fetch` na tela: violaria a separação de responsabilidades.
- Reaproveitar `listarProdutos` com filtro: não busca por identificador e não trata 404 de
  produto específico.

## D-303: Adição ao carrinho

**Decision**: Reutilizar `adicionarProduto(produtoId, 1)` do `CarrinhoContext`, exatamente
como o catálogo faz.

**Rationale**: A especificação exige reutilizar a funcionalidade e o serviço de carrinho
existentes. O contexto já trata trava de operação, isolamento por usuário, erros e
atualização do contador global.

**Alternatives considered**:

- Chamar `Service/carrinho.ts` diretamente na tela: ignoraria a trava de operação e a
  sincronização do estado global.
- Criar uma nova operação de carrinho: fora do escopo e duplicaria lógica.

## D-304: Disponibilidade de estoque

**Decision**: Calcular `estoqueDisponivel = max(produto.estoque - quantidadeNoCarrinho, 0)`
e considerar esgotado quando o resultado for `0`. A quantidade no carrinho vem de
`carrinho.itens` do contexto.

**Rationale**: Mantém consistência com o catálogo, que já desconta as unidades no
carrinho. Evita prometer disponibilidade que a API rejeitaria na adição.

**Alternatives considered**:

- Exibir o estoque bruto da API: ficaria inconsistente com o catálogo quando o produto já
  estivesse no carrinho.
- Exibir apenas “disponível/indisponível”: não atenderia ao requisito de mostrar a
  quantidade disponível.

## D-305: Feedback após adicionar

**Decision**: Permanecer na tela de detalhes após a adição bem-sucedida, exibindo um
banner temporário de sucesso. O badge do carrinho é atualizado pelo contexto global.

**Rationale**: Mantém o usuário no contexto de decisão, permite adicionar mais unidades e
não introduz navegação não solicitada. O feedback e o contador atendem aos requisitos.

**Alternatives considered**:

- Navegar automaticamente para o carrinho: mudaria o fluxo e surpreenderia o usuário.
- Fechar a tela após adicionar: impediria conferir os detalhes e adicionar novamente.

## D-306: Respostas atrasadas e cancelamento

**Decision**: Usar `AbortController` e um identificador de requisição para descartar
respostas obsoletas. Abortar a consulta ao desmontar a tela.

**Rationale**: Evita que uma resposta antiga sobrescreva o produto atual, cobre navegação
rápida de volta e atende ao requisito de descartar respostas atrasadas.

**Alternatives considered**:

- Apenas `useEffect` sem cancelamento: uma resposta atrasada ainda poderia atualizar o
  estado após a desmontagem.
- Ignorar o problema: risco baixo em uso normal, mas relevante em navegação rápida.

## D-307: Tratamento de erros

**Decision**: Reutilizar `ErroCatalogo` e `obterMensagemDeErro`. Tratar `http_404` como
produto indisponível; falhas de rede/API mostram mensagem em português com “Tentar
novamente”. Não exibir corpo bruto, chave ou stack trace.

**Rationale**: Mantém consistência com o catálogo e permite diferenciar produto removido
de falha temporária, sem vazar detalhes técnicos.

**Alternatives considered**:

- Exibir a mensagem da API diretamente: poderia expor detalhes técnicos ou variar de
  formato.
- Um único erro genérico: não diferenciaria produto removido de falha de rede.

## D-308: Reutilização de interface

**Decision**: Reutilizar `BotaoPrincipal`, `MensagemErro`, `CarregandoScreen`, `CORES` e o
padrão de fallback de imagem já usado em `DetalhesProdutoScreen` e `CartaoProduto`.

**Rationale**: A constituição prioriza componentes reutilizáveis e preservação do código
existente. Os componentes já cobrem botão com loading/disabled, erro acessível e paleta
visual.

**Alternatives considered**:

- Criar novos componentes para botão e erro: duplicaria estilos e comportamento.
- Usar `Alert.alert`: inconsistente no Expo Web e desnecessário para o fluxo.

## D-309: Estratégia de testes

**Decision**: Não adicionar framework de testes. Validar com `npm run typecheck` e o
roteiro manual de `quickstart.md`.

**Rationale**: O projeto é acadêmico, não possui infraestrutura de testes e a
especificação não exige automação. O roteiro cobre os fluxos críticos e os modos de falha.

**Alternatives considered**:

- Jest + React Native Testing Library: configuração e dependências adicionais; pode ser
  introduzido em uma etapa futura.

## Unknowns resolvidos

| Desconhecido | Resolução |
|--------------|-----------|
| Como obter detalhes atualizados? | `buscarProdutoPorId` com `GET /produtos/:id`. |
| Onde centralizar a chamada? | `Service/catalogo.ts`, reutilizando funções existentes. |
| Como adicionar ao carrinho? | `CarrinhoContext.adicionarProduto` com quantidade 1. |
| Como calcular estoque disponível? | `estoque - quantidadeNoCarrinho`, mínimo zero. |
| Como tratar produto removido? | Código `http_404` com estado específico e retorno ao catálogo. |
| Como evitar respostas atrasadas? | `AbortController` + identificador de requisição. |
| Como validar sem testes automatizados? | `tsc --noEmit` + quickstart manual. |
