# Contract: Serviço e Contexto do Carrinho

**Feature**: `003-carrinho-compras` | **Date**: 2026-11-02
**Arquivos previstos**: `Carrinho/Service/carrinho.ts`,
`Carrinho/Context/CarrinhoContext.tsx`, `Carrinho/Types/carrinho.ts` e
`Carrinho/Constants/mensagensCarrinho.ts`

## Tipos

### `Types/carrinho.ts`

```ts
export type ErroCarrinho = {
  codigo: string;
  mensagem: string;
};

export type OperacaoCarrinho = {
  tipo: "adicionar" | "alterar" | "remover" | "limpar";
  produtoId?: number;
};
```

Reutilizar `Carrinho` e `ItemCarrinho` de `Types/types.ts`.

### `Constants/mensagensCarrinho.ts`

```ts
export const MENSAGENS_CARRINHO = {
  carregando: "Carregando carrinho...",
  vazio: "Seu carrinho está vazio.",
  tentarNovamente: "Tentar novamente",
  adicionar: "Adicionar",
  adicionado: "Produto adicionado ao carrinho.",
  esgotado: "Esgotado",
  remover: "Remover",
  limparCarrinho: "Limpar carrinho",
  confirmarLimpezaTitulo: "Limpar carrinho",
  confirmarLimpezaMensagem:
    "Todos os itens serão removidos. Deseja continuar?",
  confirmar: "Limpar",
  cancelar: "Cancelar",
  quantidade: "Quantidade",
  subtotal: "Subtotal",
  total: "Total",
  quantidadeTotal: "Quantidade total",
  voltar: "Voltar",
  voltarAoCatalogo: "Voltar ao catálogo",
} as const;

export const MENSAGENS_ERRO_CARRINHO = {
  rede: "Não foi possível conectar. Verifique sua internet e tente novamente.",
  http400:
    "Não foi possível atualizar o carrinho. Verifique a quantidade e o estoque.",
  http401: "Acesso à loja não autorizado. Tente novamente mais tarde.",
  http404: "O item não foi encontrado no carrinho.",
  http500: "A loja está indisponível no momento. Tente novamente em instantes.",
  respostaInvalida: "Não foi possível interpretar a resposta da loja.",
  estoque: "Estoque insuficiente para a quantidade desejada.",
  produtoEsgotado: "Produto esgotado.",
  desconhecido: "Não foi possível concluir a operação. Tente novamente.",
} as const;
```

## `Service/carrinho.ts`

```ts
import type { Carrinho } from "../Types/types";

export async function buscarCarrinho(
  usuarioId: string,
  signal?: AbortSignal
): Promise<Carrinho>;

export async function adicionarItem(
  usuarioId: string,
  produtoId: number,
  quantidade: number,
  signal?: AbortSignal
): Promise<Carrinho>;

export async function atualizarQuantidade(
  usuarioId: string,
  produtoId: number,
  quantidade: number,
  signal?: AbortSignal
): Promise<Carrinho>;

export async function removerItem(
  usuarioId: string,
  produtoId: number,
  signal?: AbortSignal
): Promise<Carrinho>;

export async function limparCarrinho(
  usuarioId: string,
  signal?: AbortSignal
): Promise<Carrinho>;
```

### Contrato comum

- Usa `ROTAS.carrinho`, `ROTAS.itensCarrinho` e `ROTAS.itemCarrinho` de
  `Service/rotas.ts`.
- Envia `x-api-key` e `Accept: application/json`.
- Envia `Content-Type: application/json` em `POST` e `PUT`.
- Valida o `Carrinho` retornado.
- Se uma mutação retornar corpo vazio ou formato não reconhecido, executa
  `buscarCarrinho` e retorna o estado canônico.
- Lista vazia é sucesso.
- Lança `ErroCarrinho` para rede, status não OK, JSON inválido, formato inesperado ou falha
  no fallback.
- Propaga `AbortError` quando o `signal` é abortado, para que o contexto ignore o
  resultado.
- Não inclui a chave da API, corpo bruto ou stack trace nas mensagens.

### `buscarCarrinho`

```ts
const carrinho = await buscarCarrinho(usuarioId, signal);
```

- `GET /carrinho/:usuarioId`.
- Retorna o carrinho validado.
- `404` é tratado como erro de recurso não encontrado.

### `adicionarItem`

```ts
const carrinho = await adicionarItem(usuarioId, produtoId, 1, signal);
```

- `POST /carrinho/:usuarioId/itens`.
- Corpo `{ produtoId, quantidade }`.
- Usado pelo catálogo com quantidade inicial 1.

### `atualizarQuantidade`

```ts
const carrinho = await atualizarQuantidade(usuarioId, produtoId, 3, signal);
```

- `PUT /carrinho/:usuarioId/itens/:produtoId`.
- Corpo `{ quantidade }`.
- A quantidade deve ser inteira e maior ou igual a 1.

### `removerItem`

```ts
const carrinho = await removerItem(usuarioId, produtoId, signal);
```

- `DELETE /carrinho/:usuarioId/itens/:produtoId`.

### `limparCarrinho`

```ts
const carrinho = await limparCarrinho(usuarioId, signal);
```

- `DELETE /carrinho/:usuarioId`.
- Retorna carrinho vazio ou o estado canônico obtido no fallback.

## `Context/CarrinhoContext.tsx`

```ts
type CarrinhoContextValue = {
  carrinho: Carrinho | null;
  carregando: boolean;
  erro: string | null;
  operacao: OperacaoCarrinho | null;
  recarregar: () => Promise<void>;
  adicionarProduto: (produtoId: number, quantidade?: number) => Promise<void>;
  alterarQuantidade: (produtoId: number, quantidade: number) => Promise<void>;
  removerItem: (produtoId: number) => Promise<void>;
  limparCarrinho: () => Promise<void>;
};
```

### Regras

- `CarrinhoProvider` fica dentro de `AuthProvider` e lê `usuario` via `useAuth`.
- Ao obter `uid`, executa o carregamento inicial.
- Ao mudar `uid` ou sair, limpa o estado, aborta a requisição ativa e ignora respostas da
  sessão anterior.
- Apenas uma mutação por vez. Chamadas concorrentes são ignoradas.
- `recarregar` ignora a chamada se houver mutação ativa.
- Mutação bem-sucedida substitui `carrinho` pelo estado retornado pelo serviço e limpa
  `erro`.
- Mutação com falha mantém o carrinho anterior e lança `ErroCarrinho`; a tela que iniciou
  a operação decide onde exibir a mensagem.
- Falha de carregamento define `erro` e mantém `carrinho` anterior, se existir.
- `carregando` é usado para a busca inicial e recargas; a tela decide entre loading de
  tela cheia e indicador discreto conforme `carrinho` exista ou não.
- O contexto não persiste dados localmente.

### Exemplo de uso

```ts
const {
  carrinho,
  carregando,
  erro,
  operacao,
  adicionarProduto,
} = useCarrinho();

async function adicionar(produto: Produto) {
  try {
    await adicionarProduto(produto.id, 1);
  } catch (erro) {
    setErroAdicao(obterMensagemDeErro(erro));
  }
}
```

## Restrições

- Telas NÃO devem chamar `fetch` diretamente.
- URLs NÃO devem ser duplicadas fora de `Service/rotas.ts`.
- O contexto NÃO deve armazenar mensagens de erro de mutação; cada tela exibe o erro no
  local adequado.
- O contexto NÃO deve calcular totais; usa os valores da API.
- Nenhuma dependência nova deve ser adicionada.
