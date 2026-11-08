# API Contract: Checkout e Confirmação

**Feature**: `005-checkout-compra` | **Base URL**: `https://loja-api-wheat.vercel.app`

Todos os endpoints exigem o header `x-api-key` com a chave configurada no app.

## GET /formas-pagamento

**Status**: verificado em 2026-11-04.

**Request**

```http
GET /formas-pagamento
x-api-key: <chave>
Accept: application/json
```

**Response 200**

```json
[
  { "id": "pix", "nome": "Pix" },
  { "id": "cartao", "nome": "Cartão de crédito" },
  { "id": "boleto", "nome": "Boleto" }
]
```

**Validação no app**

- Corpo deve ser um array.
- Cada item deve ter `id` e `nome` como strings não vazias.
- Ids conhecidos são mapeados para rótulos fixos; ids desconhecidos são exibidos
  desabilitados com o `nome` retornado.

**Erros**

| Status | Tratamento |
|--------|------------|
| `401`/`403` | “Não foi possível acessar as formas de pagamento.” |
| `5xx` | “A loja está indisponível. Tente novamente.” |
| Rede | “Verifique sua conexão e tente novamente.” |
| JSON inválido | “A loja retornou uma resposta inválida.” |

## POST /compras

**Status**: confirmado com uma compra real em 2026-11-08 (`201`). Requer carrinho do
usuário com ao menos um item (`400` com carrinho vazio). Após o sucesso, a loja esvazia o
servidor do carrinho; o `DELETE /carrinho/:usuarioId` do app continua válido (retorna `200`
com carrinho vazio).

**Request**

```http
POST /compras
x-api-key: <chave>
Content-Type: application/json
Accept: application/json
```

```json
{
  "usuarioId": "teste",
  "formaPagamento": "pix"
}
```

**Response 201 (confirmado)**

```json
{
  "id": 7,
  "usuarioId": "teste",
  "itens": [
    {
      "produtoId": 1,
      "nome": "Fone de ouvido Bluetooth",
      "preco": 19990,
      "imagem": "https://loja-api-wheat.vercel.app/imagens/1.jpg",
      "quantidade": 1,
      "subtotal": 19990
    }
  ],
  "quantidadeTotal": 1,
  "total": 19990,
  "formaPagamento": "pix",
  "status": "confirmada",
  "criadaEm": "2026-11-08T18:07:37.791Z"
}
```

**Validação no app**

- `id` é número finito (o exemplo antigo com `"compra_123"` estava errado).
- `usuarioId`, `status` e `criadaEm` são strings não vazias.
- `total` e `quantidadeTotal` são inteiros não negativos.
- `formaPagamento` é `pix`, `cartao` ou `boleto`.
- `itens` é um array válido de `ItemCarrinho` (com `imagem` e `subtotal`).
- `status` aceita qualquer string; o app exibe o valor retornado.

**Erros**

| Status | Tratamento |
|--------|------------|
| `400` | “Não foi possível finalizar a compra. Revise os dados.” |
| `401`/`403` | “Sua sessão expirou. Entre novamente.” |
| `404` | “Carrinho ou usuário não encontrado.” |
| `409`/`422` | “Não foi possível finalizar a compra. Revise o carrinho.” |
| `5xx` | “A loja está indisponível. Tente novamente.” |
| Rede | “Verifique sua conexão e tente novamente.” |
| JSON inválido | “A loja retornou uma confirmação inválida.” |

## DELETE /carrinho/:usuarioId

**Status**: rota existente no serviço de carrinho.

**Request**

```http
DELETE /carrinho/:usuarioId
x-api-key: <chave>
Accept: application/json
```

**Comportamento no checkout**

- Chamado somente após uma compra bem-sucedida.
- `204`/`200` → carrinho limpo no contexto.
- `404` → tratar como carrinho já vazio; limpar o contexto.
- Outros erros → manter a confirmação com aviso e tentar novamente ao voltar ao catálogo.

## GET /carrinho/:usuarioId

**Status**: rota existente, usada por `recarregar()`.

**Uso no checkout**

- Chamada ao abrir o checkout e imediatamente antes de confirmar.
- Resposta vazia/inexistente → carrinho vazio.
- Falha → erro com “Tentar novamente”; não finalizar.

## Observações de Segurança

- A chave da API vem da configuração existente do app e nunca é exibida na interface.
- Mensagens de erro não incluem corpo bruto, headers ou stack trace.
- Requisições usam `AbortController` para cancelar ao desmontar/sair.
