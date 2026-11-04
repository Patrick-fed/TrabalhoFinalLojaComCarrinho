# Service Contract: Checkout e Confirmação

**Feature**: `005-checkout-compra` | **Date**: 2026-11-04

## `Service/compras.ts`

### `listarFormasPagamento(signal?: AbortSignal): Promise<FormaPagamentoDisponivel[]>`

Busca `GET /formas-pagamento`.

**Comportamento**

- Envia `x-api-key` e `Accept: application/json`.
- Valida array de objetos com `id` e `nome` não vazios.
- Retorna a lista na ordem da API.
- Lança `ErroCheckout` em falha de rede, status inesperado, JSON inválido ou formato
  inesperado.
- Propaga `AbortError` sem convertê-lo.

**Erros**

| Situação | `codigo` | `mensagem` |
|----------|----------|------------|
| Falha de rede | `rede` | Verifique sua conexão e tente novamente. |
| `401`/`403` | `http_401`/`http_403` | Não foi possível acessar as formas de pagamento. |
| `5xx` | `http_500` | A loja está indisponível. Tente novamente. |
| JSON inválido | `resposta_invalida` | A loja retornou uma resposta inválida. |
| Formato inesperado | `formato_inesperado` | A loja retornou uma resposta inválida. |

### `registrarCompra(usuarioId: string, formaPagamento: FormaPagamento, signal?: AbortSignal): Promise<Compra>`

Registra `POST /compras`.

**Comportamento**

- Envia `x-api-key`, `Content-Type: application/json` e `Accept: application/json`.
- Corpo: `{ usuarioId, formaPagamento }`.
- Valida `usuarioId` não vazio e `formaPagamento` em `pix`, `cartao`, `boleto`.
- Valida a resposta como `Compra` (`id`, `usuarioId`, `itens`, `total`,
  `formaPagamento`, `status`, `criadaEm`).
- `status` aceita qualquer string não vazia.
- Lança `ErroCheckout` em falha de rede, status inesperado, JSON inválido ou formato
  inesperado.
- Propaga `AbortError` sem convertê-lo.

**Erros**

| Situação | `codigo` | `mensagem` |
|----------|----------|------------|
| Falha de rede | `rede` | Verifique sua conexão e tente novamente. |
| `400` | `http_400` | Não foi possível finalizar a compra. Revise os dados. |
| `401`/`403` | `http_401`/`http_403` | Sua sessão expirou. Entre novamente. |
| `404` | `http_404` | Carrinho ou usuário não encontrado. |
| `409`/`422` | `http_409`/`http_422` | Não foi possível finalizar a compra. Revise o carrinho. |
| `5xx` | `http_500` | A loja está indisponível. Tente novamente. |
| JSON inválido | `resposta_invalida` | A loja retornou uma confirmação inválida. |
| Formato inesperado | `formato_inesperado` | A loja retornou uma confirmação inválida. |

## `Context/CarrinhoContext.tsx`

### Alteração: `recarregar(): Promise<Carrinho | null>`

- Mantém o comportamento atual de carregar o carrinho e atualizar o estado.
- Passa a retornar o carrinho carregado (ou `null` quando não há carrinho/erro).
- Chamadas existentes que ignoram o retorno continuam válidas.
- O checkout usa o retorno para comparar com o snapshot.

### `limparCarrinho(): Promise<void>`

- Já existe; será chamado após uma compra bem-sucedida.
- Em caso de falha, o checkout mantém a confirmação e sinaliza `carrinhoAtualizado =
  false`.
- O checkout trata `http_404` como carrinho já vazio.

## `Types/navigation.ts`

```ts
export type AppStackParamList = {
  Catalogo: undefined;
  DetalhesProduto: { produto: Produto };
  Carrinho: undefined;
  Checkout: undefined;
  ConfirmacaoCompra: { compra: Compra; carrinhoAtualizado: boolean };
};
```

## Regras de Integração

- A tela não chama `fetch` diretamente.
- O serviço não acessa estado de React; recebe dados e retorna dados/erros.
- O contexto é a fonte da verdade do carrinho.
- Nenhuma chave de API ou corpo bruto de erro chega à interface.
