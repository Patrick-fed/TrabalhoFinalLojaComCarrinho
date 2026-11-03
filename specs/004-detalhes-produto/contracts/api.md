# Contract: API de Detalhes do Produto

**Feature**: `004-detalhes-produto` | **Date**: 2026-11-03
**Base URL**: `EXPO_PUBLIC_API_URL` (padrão atual: `https://loja-api-wheat.vercel.app`)

## Autenticação

Todas as requisições DEVEM enviar:

```http
x-api-key: <EXPO_PUBLIC_API_KEY>
Accept: application/json
```

- A chave é lida de `Carrinho/.env` e nunca deve ser registrada em logs ou no código.
- Sem a chave, a API responde com erro; o app exibe mensagem amigável.
- Preços e estoque são numéricos; `preco` está em centavos.

## GET /produtos/:id

Retorna os detalhes atualizados de um produto.

### Parâmetro de rota

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | `number` | Sim | Identificador do produto selecionado |

### Resposta 200

```json
{
  "id": 1,
  "nome": "Fone de ouvido Bluetooth",
  "descricao": "Fone sem fio com cancelamento de ruído e bateria para 20 horas.",
  "preco": 19990,
  "categoria": "eletronicos",
  "estoque": 15,
  "imagem": "https://loja-api-wheat.vercel.app/imagens/1.jpg"
}
```

- `preco` está em centavos (`19990` = `R$ 199,90`).
- `estoque` é o total informado pela API.
- `descricao` pode ser vazia.
- `imagem` pode apontar para uma URL indisponível; a tela deve exibir fallback.

### Erros observados

| Status | Corpo | Situação |
|--------|-------|----------|
| 400 | `{ "erro": "..." }` | Identificador ou requisição inválida |
| 401/403 | `{ "erro": "Chave de acesso inválida ou ausente..." }` | Chave ausente ou inválida |
| 404 | `{ "erro": "Produto não encontrado." }` | Produto removido ou inexistente |
| 500 | `{ "erro": "..." }` | Erro interno |

## Regras de validação da resposta

A resposta DEVE ser um objeto com:

- `id`: número finito;
- `nome`: string não vazia;
- `descricao`: string;
- `preco`: número finito maior ou igual a zero;
- `categoria`: string não vazia;
- `estoque`: número finito maior ou igual a zero;
- `imagem`: string.

Resposta fora desse formato vira `ErroCatalogo` de resposta inválida, sem quebrar a tela.

## Mapeamento de falhas no app

| Situação | Código interno | Mensagem ao usuário |
|----------|----------------|---------------------|
| Falha de rede | `rede` | Não foi possível conectar. Verifique sua internet e tente novamente. |
| HTTP 400 | `http_400` | Não foi possível carregar os detalhes. Verifique o produto e tente novamente. |
| HTTP 401/403 | `http_401` | Acesso à loja não autorizado. Tente novamente mais tarde. |
| HTTP 404 | `http_404` | Produto não encontrado ou indisponível. |
| HTTP 5xx | `http_500` | A loja está indisponível no momento. Tente novamente em instantes. |
| JSON inválido ou formato inesperado | `resposta_invalida` | Não foi possível interpretar a resposta da loja. |
| Requisição cancelada | `cancelada` | Não exibir erro; ignorar resultado |

O corpo `{ "erro": "..." }` da API pode ser usado para diagnóstico interno, mas NÃO deve
ser exibido diretamente ao usuário.

## Restrições

- As telas NÃO devem chamar `fetch` diretamente.
- As URLs NÃO devem ser duplicadas fora de `Service/rotas.ts`.
- A chave NÃO deve ser incluída em mensagens, logs ou parâmetros de navegação.
- Nenhuma dependência HTTP nova deve ser adicionada.
- A consulta deve ser cancelável com `AbortSignal` ao desmontar a tela.
