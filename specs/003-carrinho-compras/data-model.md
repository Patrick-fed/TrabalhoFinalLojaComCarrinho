# Data Model: Carrinho de Compras

**Feature**: `003-carrinho-compras` | **Date**: 2026-11-02

## Entidades

### Carrinho

Representa a compra em andamento de um usuário. Reutiliza o tipo `Carrinho` de
`Carrinho/Types/types.ts`.

| Campo | Tipo | Obrigatório | Origem | Descrição |
|-------|------|-------------|--------|-----------|
| `usuarioId` | `string` | Sim | API | `uid` do usuário autenticado |
| `itens` | `ItemCarrinho[]` | Sim | API | Itens do carrinho; pode ser vazio |
| `quantidadeTotal` | `number` | Sim | API | Soma das quantidades dos itens |
| `total` | `number` | Sim | API | Valor total em centavos |

**Regras**:

- `quantidadeTotal` e `total` são sempre provenientes da API.
- `itens: []`, `quantidadeTotal: 0` e `total: 0` representam carrinho vazio, não erro.
- O `usuarioId` deve corresponder ao usuário autenticado da sessão.
- O carrinho é recarregado da API; não há persistência local.

### ItemCarrinho

Representa um produto dentro do carrinho. Reutiliza o tipo `ItemCarrinho` de
`Carrinho/Types/types.ts`.

| Campo | Tipo | Obrigatório | Origem | Descrição |
|-------|------|-------------|--------|-----------|
| `produtoId` | `number` | Sim | API | Identificador do produto |
| `nome` | `string` | Sim | API | Nome exibido no item |
| `preco` | `number` | Sim | API | Preço unitário em centavos |
| `imagem` | `string` | Sim | API | URL da imagem |
| `quantidade` | `number` | Sim | API | Quantidade no carrinho; mínimo 1 |
| `subtotal` | `number` | Sim | API | Preço unitário × quantidade, em centavos |

**Regras**:

- A quantidade nunca deve ser menor que 1.
- O item continua sendo exibido mesmo que o produto não esteja mais no catálogo.
- A imagem pode falhar; nesse caso, exibir placeholder e manter os demais dados.
- O subtotal exibido é o retornado pela API, não recalculado localmente.

### Produto

Representa o produto do catálogo que pode ser adicionado. Reutiliza o tipo `Produto` de
`Carrinho/Types/types.ts`.

| Campo | Tipo | Uso no carrinho |
|-------|------|-----------------|
| `id` | `number` | Enviado como `produtoId` na adição |
| `nome` | `string` | Exibição no card |
| `preco` | `number` | Exibição no card |
| `estoque` | `number` | Bloqueia adição quando `<= 0` |
| `imagem` | `string` | Exibição no card |

**Regras**:

- Produto com estoque zero não pode ser adicionado; a ação exibe “Esgotado”.
- O estoque é validado novamente pela API na adição e alteração.
- O produto não é copiado para o carrinho localmente; o estado canônico vem da API.

### OperacaoCarrinho

Representa a mutação em andamento.

```ts
type OperacaoCarrinho = {
  tipo: "adicionar" | "alterar" | "remover" | "limpar";
  produtoId?: number;
};
```

**Regras**:

- No máximo uma operação pode estar ativa por vez.
- `produtoId` identifica o item afetado nas operações de adicionar, alterar e remover.
- A operação de limpar não possui `produtoId`.
- Enquanto houver operação, os controles correspondentes ficam desabilitados.
- Toques repetidos não geram nova requisição.

### ErroCarrinho

Falha compreensível para o usuário, no formato aceito por `Utils/erros.ts`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `codigo` | `string` | Código interno (`rede`, `http_400`, `http_401`, `http_404`, `http_500`, `resposta_invalida`, `estoque`, etc.) |
| `mensagem` | `string` | Mensagem em português exibida na tela |

**Regras**:

- Mensagens não incluem stack trace, corpo bruto da API ou a chave de acesso.
- Cancelamentos (`AbortError`) não são convertidos em erro de tela.
- O código é útil para depuração e não precisa ser exibido.

### Estado do Carrinho

Estado mantido pelo `CarrinhoContext`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `carrinho` | `Carrinho \| null` | Último carrinho carregado com sucesso |
| `carregando` | `boolean` | Busca inicial ou recarga em andamento |
| `erro` | `string \| null` | Erro de carregamento atual |
| `operacao` | `OperacaoCarrinho \| null` | Mutação em andamento |

**Regras**:

- `carrinho === null` e `carregando === true`: tela de carregamento.
- `carrinho === null` e `erro !== null`: erro com opção de retry.
- `carrinho !== null`: dados anteriores permanecem visíveis durante recargas.
- Erros de mutação são tratados pela tela que iniciou a operação; o estado anterior do
  carrinho é preservado.
- Ao trocar de usuário ou sair, o estado é limpo e respostas antigas são ignoradas.

## Relacionamentos

```text
Usuário autenticado 1 ─── 1 Carrinho
Carrinho 1 ─── 0..N ItemCarrinho
ItemCarrinho 1 ─── 1 Produto           (pelo produtoId)
Estado do Carrinho 1 ─── 0..1 Carrinho
Estado do Carrinho 1 ─── 0..1 Operação
Estado do Carrinho 1 ─── 0..1 Erro
```

- Cada usuário possui exatamente um carrinho no escopo da aplicação.
- Um carrinho pode ter zero ou vários itens.
- Um item referencia exatamente um produto.
- O carrinho é identificado por `usuarioId` em todas as chamadas.

## Regras de validação

| Regra | Campo | Condição | Comportamento |
|-------|-------|----------|---------------|
| RV-201 | `Carrinho` | Não é objeto com `itens` array | Lançar `ErroCarrinho` de resposta inválida |
| RV-202 | `Carrinho.usuarioId` | String vazia ou tipo incorreto | Lançar `ErroCarrinho` de resposta inválida |
| RV-203 | `quantidadeTotal` | Número finito menor que zero | Lançar `ErroCarrinho` de resposta inválida |
| RV-204 | `total` | Número finito menor que zero | Lançar `ErroCarrinho` de resposta inválida |
| RV-205 | `ItemCarrinho` | Campo obrigatório ausente ou tipo incorreto | Lançar `ErroCarrinho` de resposta inválida |
| RV-206 | `ItemCarrinho.quantidade` | Inteiro menor que 1 | Lançar `ErroCarrinho` de resposta inválida |
| RV-207 | `ItemCarrinho.preco` / `subtotal` | Menor que zero | Lançar `ErroCarrinho` de resposta inválida |
| RV-208 | Adição | `produto.estoque <= 0` | Não chamar a API; informar “Produto esgotado.” |
| RV-209 | Diminuição | `quantidade <= 1` | Não chamar a API; manter quantidade 1 |
| RV-210 | Mutação | Já existe operação ativa | Ignorar novo toque |
| RV-211 | Recarga | Já existe mutação ativa | Ignorar recarga |
| RV-212 | Resposta de mutação | Corpo vazio ou não é `Carrinho` | Executar `GET` do carrinho |
| RV-213 | Sessão | `uid` mudou durante a requisição | Ignorar resultado |

## Transições de estado

### Carregamento

```text
[inicial]
   │ usuário autenticado
   ▼
[carregando] ── sucesso ──▶ [carrinho exibido]
   │                              │
   │ falha                        │ retry
   ▼                              ▼
[erro + tentar novamente] ──▶ [carregando]

Sucesso com itens: [lista + resumo]
Sucesso sem itens: [estado vazio + totais zerados]
```

| De | Evento | Para | Efeito |
|----|--------|------|--------|
| Inicial | `uid` disponível | Carregando | Indicador de carregamento |
| Carregando | Sucesso com itens | Carrinho exibido | Lista e resumo |
| Carregando | Sucesso vazio | Estado vazio | Mensagem e totais zerados |
| Carregando | Falha | Erro | Mensagem + “Tentar novamente” |
| Erro | Retry | Carregando | Nova busca |
| Carrinho exibido | Recarga bem-sucedida | Carrinho atualizado | Substitui dados |
| Carrinho exibido | Recarga com falha | Carrinho anterior + erro | Mantém dados |

### Mutação

```text
[carrinho exibido]
   │ adicionar / alterar / remover / limpar
   ▼
[operação em andamento]
   ├── sucesso ──▶ [carrinho atualizado]
   └── falha ────▶ [carrinho anterior + erro]
```

| De | Evento | Para | Efeito |
|----|--------|------|--------|
| Carrinho exibido | Adicionar | Operação (adicionar) | Spinner no card, ações de adição bloqueadas |
| Carrinho exibido | Aumentar/diminuir | Operação (alterar) | Controles do item desabilitados |
| Carrinho exibido | Remover | Operação (remover) | Controles do item desabilitados |
| Carrinho exibido | Limpar confirmado | Operação (limpar) | Controles e limpeza desabilitados |
| Operação | Sucesso | Carrinho atualizado | Substitui estado e atualiza contador |
| Operação | Falha | Carrinho anterior + erro | Preserva itens/totais e exibe mensagem |
| Carrinho com 1 item | Remover | Estado vazio | Itens vazios e totais zerados |

### Sessão

| De | Evento | Para | Efeito |
|----|--------|------|--------|
| Autenticado | Logout | Não autenticado | Estado descartado; pilha de autenticação |
| Autenticado | Troca de `uid` | Novo carregamento | Estado limpo; requisições antigas ignoradas |
| Autenticado | Reabertura do app | Carregando | Carrinho recarregado da API |

## Observações de implementação

- `Carrinho` e `ItemCarrinho` já existem em `Types/types.ts`; não duplicar.
- `ErroCarrinho` e `OperacaoCarrinho` ficarão em `Types/carrinho.ts`.
- O estado fica no `CarrinhoContext`, não em cada tela.
- O contador do cabeçalho usa `carrinho.quantidadeTotal`.
- A tela do carrinho não calcula totais; apenas formata os valores da API.
- A posição da lista do catálogo é preservada porque a tela permanece na pilha.
