# Contract: API do Carrinho

**Feature**: `003-carrinho-compras` | **Date**: 2026-11-02
**Base URL**: `EXPO_PUBLIC_API_URL` (padrão atual: `https://loja-api-wheat.vercel.app`)

## Autenticação

Todas as requisições DEVEM enviar:

```http
x-api-key: <EXPO_PUBLIC_API_KEY>
Accept: application/json
Content-Type: application/json
```

`Content-Type` é obrigatório apenas em `POST` e `PUT`.

- A chave é lida de `Carrinho/.env` e nunca deve ser registrada em logs ou no código.
- Sem a chave, a API responde com erro; o app exibe mensagem amigável.
- Preços, subtotais e totais estão em centavos.

## GET /carrinho/:usuarioId

Retorna o carrinho do usuário autenticado.

### Resposta 200

```json
{
  "usuarioId": "uid-do-usuario",
  "itens": [
    {
      "produtoId": 1,
      "nome": "Fone de ouvido Bluetooth",
      "preco": 19990,
      "imagem": "https://loja-api-wheat.vercel.app/imagens/1.jpg",
      "quantidade": 2,
      "subtotal": 39980
    }
  ],
  "quantidadeTotal": 2,
  "total": 39980
}
```

### Carrinho vazio

```json
{
  "usuarioId": "uid-do-usuario",
  "itens": [],
  "quantidadeTotal": 0,
  "total": 0
}
```

- Lista vazia é sucesso, não erro.
- `quantidadeTotal` é a soma das quantidades, não a quantidade de linhas.
- A ordem dos itens retornada pela API é preservada.

## POST /carrinho/:usuarioId/itens

Adiciona um produto ao carrinho. Se o produto já existir, a API deve incrementar a
quantidade existente em vez de criar um item duplicado.

### Corpo

```json
{
  "produtoId": 1,
  "quantidade": 1
}
```

### Resposta esperada

- `200` ou `201` com o `Carrinho` atualizado; ou
- `204`/corpo vazio; ou
- outro formato de sucesso.

Se a resposta não for um `Carrinho` válido, o aplicativo executa `GET
/carrinho/:usuarioId` e usa o estado canônico.

### Erros

- `400`, `409` ou `422`: quantidade inválida, estoque insuficiente ou produto indisponível.
- `401`/`403`: chave de acesso inválida ou ausente.
- `404`: produto não encontrado.
- `5xx`: erro interno.

## PUT /carrinho/:usuarioId/itens/:produtoId

Atualiza a quantidade de um item existente.

### Corpo

```json
{
  "quantidade": 3
}
```

### Resposta esperada

- `200` com o `Carrinho` atualizado; ou
- `204`/corpo vazio; ou
- outro formato de sucesso.

Se a resposta não for um `Carrinho` válido, o aplicativo executa `GET
/carrinho/:usuarioId`.

### Erros

- `400`, `409` ou `422`: quantidade inválida ou estoque insuficiente.
- `401`/`403`: chave de acesso inválida ou ausente.
- `404`: item ou produto não encontrado.
- `5xx`: erro interno.

## DELETE /carrinho/:usuarioId/itens/:produtoId

Remove um item individualmente.

### Resposta esperada

- `200` com o `Carrinho` atualizado;
- `204`/corpo vazio; ou
- outro formato de sucesso.

Se a resposta não for um `Carrinho` válido, o aplicativo executa `GET
/carrinho/:usuarioId`.

### Erros

- `401`/`403`: chave de acesso inválida ou ausente.
- `404`: item não encontrado.
- `5xx`: erro interno.

## DELETE /carrinho/:usuarioId

Remove todos os itens do carrinho.

### Resposta esperada

- `200` com o `Carrinho` vazio;
- `204`/corpo vazio; ou
- outro formato de sucesso.

Se a resposta não for um `Carrinho` válido, o aplicativo executa `GET
/carrinho/:usuarioId`.

### Erros

- `401`/`403`: chave de acesso inválida ou ausente.
- `5xx`: erro interno.

## Regras de validação da resposta

### Carrinho

- `usuarioId`: string não vazia;
- `itens`: array;
- `quantidadeTotal`: número finito maior ou igual a zero;
- `total`: número finito maior ou igual a zero.

### ItemCarrinho

- `produtoId`: número finito;
- `nome`: string não vazia;
- `preco`: número finito maior ou igual a zero;
- `imagem`: string;
- `quantidade`: número inteiro maior ou igual a 1;
- `subtotal`: número finito maior ou igual a zero.

Itens fora desse formato invalidam a resposta inteira. Para `GET`, isso vira
`ErroCarrinho` de resposta inválida. Para mutações, o serviço tenta o fallback `GET`;
se o fallback também for inválido, lança `ErroCarrinho`.

## Mapeamento de falhas no app

| Situação | Código interno | Mensagem ao usuário |
|----------|----------------|---------------------|
| Falha de rede | `rede` | Não foi possível conectar. Verifique sua internet e tente novamente. |
| HTTP 400/409/422 | `http_400` / `estoque` | Não foi possível atualizar o carrinho. Verifique a quantidade e o estoque. |
| HTTP 401/403 | `http_401` | Acesso à loja não autorizado. Tente novamente mais tarde. |
| HTTP 404 | `http_404` | O item não foi encontrado no carrinho. |
| HTTP 5xx | `http_500` | A loja está indisponível no momento. Tente novamente em instantes. |
| JSON inválido ou formato inesperado | `resposta_invalida` | Não foi possível interpretar a resposta da loja. |
| Requisição cancelada | `cancelada` | Não exibir erro; ignorar resultado |

O corpo `{ "erro": "..." }` da API pode ser usado para diagnóstico interno, mas NÃO
deve ser exibido diretamente ao usuário.

## Restrições

- As telas NÃO devem chamar `fetch` diretamente.
- As URLs NÃO devem ser duplicadas fora de `Service/rotas.ts`.
- A chave NÃO deve ser incluída em mensagens, logs ou parâmetros de navegação.
- Nenhuma dependência HTTP nova deve ser adicionada.
