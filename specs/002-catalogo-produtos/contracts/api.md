# Contract: API do Catálogo

**Feature**: `002-catalogo-produtos` | **Date**: 2026-11-02
**Base URL**: `EXPO_PUBLIC_API_URL` (padrão atual: `https://loja-api-wheat.vercel.app`)

## Autenticação

Todas as requisições DEVEM enviar:

```http
x-api-key: <EXPO_PUBLIC_API_KEY>
Accept: application/json
```

- A chave é lida de `Carrinho/.env` e nunca deve ser registrada em logs ou no código.
- Sem a chave, a API responde com erro; o app exibe mensagem amigável.

## GET /produtos

Lista os produtos, com filtros opcionais combináveis.

### Query parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `busca` | `string` | Não | Trecho do nome; a API é case-insensitive e sensível a acentos |
| `categoria` | `string` | Não | Um dos IDs retornados por `/categorias` |

**Regras**:
- Parâmetros vazios DEVEM ser omitidos.
- Os valores DEVEM ser codificados com `encodeURIComponent`.
- Busca e categoria PODEM ser enviadas juntas.

### Exemplos válidos

```http
GET /produtos
GET /produtos?busca=teclado
GET /produtos?categoria=eletronicos
GET /produtos?categoria=eletronicos&busca=teclado
```

### Resposta 200

```json
[
  {
    "id": 1,
    "nome": "Fone de ouvido Bluetooth",
    "descricao": "Fone sem fio com cancelamento de ruído e bateria para 20 horas.",
    "preco": 19990,
    "categoria": "eletronicos",
    "estoque": 15,
    "imagem": "https://loja-api-wheat.vercel.app/imagens/1.jpg"
  }
]
```

- Lista vazia (`[]`) é resposta válida e representa "nenhum produto encontrado".
- `preco` está em centavos.
- A ordem retornada pela API é preservada.

### Erros observados

| Status | Corpo | Situação |
|--------|-------|----------|
| 400 | `{ "erro": "Categoria inválida. Use: ..." }` | Categoria não reconhecida |
| 401/403 | `{ "erro": "Chave de acesso inválida ou ausente..." }` | Chave ausente ou inválida |
| 404 | `{ "erro": "..." }` | Rota inexistente |
| 500 | `{ "erro": "..." }` | Erro interno |

## GET /categorias

Retorna as categorias disponíveis para o filtro.

### Resposta 200

```json
[
  { "id": "eletronicos", "nome": "Eletrônicos" },
  { "id": "roupas", "nome": "Roupas" },
  { "id": "casa", "nome": "Casa" },
  { "id": "livros", "nome": "Livros" },
  { "id": "cervejas", "nome": "Cervejas" },
  { "id": "carnes", "nome": "Carnes" },
  { "id": "refrigerantes", "nome": "Refrigerantes" },
  { "id": "chocolates", "nome": "Chocolates" },
  { "id": "cachorro-quente", "nome": "Cachorro-quente" }
]
```

- A tela DEVE usar essa lista para montar os chips.
- Lista vazia é válida e indica que não há categorias para filtrar.
- O filtro "Todas" é local (`categoria = null`) e não é enviado à API.

## GET /produtos/:id

Documentado para referência futura. **Não será usado nesta feature**, pois a tela
provisória de detalhes recebe o `Produto` completo pela navegação.

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

### Resposta 404

```json
{ "erro": "Produto não encontrado." }
```

## Imagens

As URLs de `imagem` são absolutas e respondem com `image/jpeg` quando disponíveis.
Falhas de carregamento da imagem NÃO devem ser tratadas como falha da consulta; o card
deve exibir um placeholder e manter nome e preço.

## Mapeamento de falhas no app

| Situação | Código interno | Mensagem ao usuário |
|----------|----------------|---------------------|
| Falha de rede | `rede` | Não foi possível conectar. Verifique sua internet e tente novamente. |
| HTTP 400 | `http_400` | Não foi possível aplicar os filtros. Atualize as categorias e tente novamente. |
| HTTP 401/403 | `http_401` | Acesso à loja não autorizado. Tente novamente mais tarde. |
| HTTP 404 | `http_404` | Recurso não encontrado. |
| HTTP 5xx | `http_500` | A loja está indisponível no momento. Tente novamente em instantes. |
| JSON inválido ou formato inesperado | `resposta_invalida` | Não foi possível interpretar a resposta da loja. |
| Requisição cancelada | `cancelada` | Não exibir erro; ignorar resultado |

O corpo `{ "erro": "..." }` da API pode ser usado para diagnóstico interno, mas NÃO
deve ser exibido diretamente ao usuário.
