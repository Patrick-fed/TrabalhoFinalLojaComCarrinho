# Contract: Serviços e Configuração

**Feature**: `002-catalogo-produtos` | **Date**: 2026-11-02
**Arquivos previstos**: `Carrinho/Config/apiConfig.ts`,
`Carrinho/Service/catalogo.ts` e `Carrinho/Service/rotas.ts`

## Configuração

### `Config/apiConfig.ts`

```ts
export const API_URL: string;
export const API_KEY: string;
```

**Regras**:
- Lê `process.env.EXPO_PUBLIC_API_URL` e `process.env.EXPO_PUBLIC_API_KEY`.
- Remove barras finais de `API_URL`.
- Lança erro claro no carregamento do módulo se alguma variável estiver ausente ou vazia.
- Não registra a chave no console.

### `Service/rotas.ts`

```ts
export const ROTAS: {
  produtos: string;
  produtoPorId: (id: number) => string;
  categorias: string;
  // demais rotas existentes permanecem
};
```

- Passa a usar `API_URL` importado de `Config/apiConfig.ts`.
- Mantém as rotas existentes para carrinho, compras e formas de pagamento.

## Tipos auxiliares

```ts
import type { Categoria, Produto } from "../Types/types";

export type CategoriaDisponivel = {
  id: Categoria;
  nome: string;
};

export type FiltrosCatalogo = {
  busca: string;
  categoria: Categoria | null;
};

export type ErroCatalogo = {
  codigo: string;
  mensagem: string;
};
```

## `Service/catalogo.ts`

### `listarProdutos`

```ts
export async function listarProdutos(
  filtros: FiltrosCatalogo,
  signal?: AbortSignal
): Promise<Produto[]>;
```

**Contrato**:
- Monta `GET ${ROTAS.produtos}`.
- Inclui `?busca=` somente se `filtros.busca.trim()` não for vazio.
- Inclui `?categoria=` somente se `filtros.categoria` não for `null`.
- Codifica os valores e combina os parâmetros com `&`.
- Envia `x-api-key` e `Accept: application/json`.
- Retorna o array validado de `Produto` na ordem da API.
- Lista vazia é sucesso, não erro.
- Lança `ErroCatalogo` para falha de rede, status HTTP não OK, JSON inválido ou formato
  inesperado.
- Propaga `AbortError` (ou erro equivalente) quando `signal` é abortado, para que a tela
  ignore o resultado.

### `listarCategorias`

```ts
export async function listarCategorias(
  signal?: AbortSignal
): Promise<CategoriaDisponivel[]>;
```

**Contrato**:
- Monta `GET ${ROTAS.categorias}`.
- Envia os mesmos headers de `listarProdutos`.
- Valida que a resposta é um array de objetos com `id: string` e `nome: string`.
- Lista vazia é sucesso e significa "sem categorias para filtrar".
- Lança `ErroCatalogo` nas mesmas condições de `listarProdutos`.

## Validação das respostas

### Produto

Cada item deve ter:
- `id`: `number` finito;
- `nome`: `string` não vazia;
- `descricao`: `string`;
- `preco`: `number` finito e maior ou igual a zero;
- `categoria`: `string` não vazia;
- `estoque`: `number` finito;
- `imagem`: `string`.

Itens fora desse formato invalidam a resposta inteira, que vira
`{ codigo: "resposta_invalida", mensagem: "Não foi possível interpretar a resposta da loja." }`.

### Categoria

Cada item deve ter:
- `id`: `string` não vazia;
- `nome`: `string` não vazia.

## Tratamento de erros

```ts
type ErroCatalogo = {
  codigo: string;
  mensagem: string;
};
```

- `Utils/erros.ts` (`obterMensagemDeErro`) já lê `mensagem`, portanto as telas podem
  reutilizá-lo.
- Nenhum erro deve conter a chave da API, o corpo bruto da resposta ou stack trace.
- Cancelamentos não devem ser convertidos em `ErroCatalogo` nem exibidos.

## Exemplo de uso na tela

```ts
const controller = new AbortController();

try {
  const produtos = await listarProdutos(
    { busca: buscaAplicada, categoria: categoriaSelecionada },
    controller.signal
  );

  if (!controller.signal.aborted) {
    setProdutos(produtos);
  }
} catch (erro) {
  if (controller.signal.aborted) {
    return;
  }

  setErroProdutos(obterMensagemDeErro(erro));
}
```

## Restrições

- As telas NÃO devem chamar `fetch` diretamente.
- As URLs NÃO devem ser duplicadas fora de `Service/rotas.ts`.
- A chave NÃO deve ser passada como parâmetro de tela ou incluída em mensagens.
- Nenhuma dependência HTTP nova deve ser adicionada.
