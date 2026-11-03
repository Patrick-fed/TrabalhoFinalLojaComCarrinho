# Data Model: Detalhes do Produto

**Feature**: `004-detalhes-produto` | **Date**: 2026-11-03

## Entidades

### Produto

Representa o item do catálogo exibido nos detalhes. Reutiliza o tipo `Produto` de
`Carrinho/Types/types.ts`; nenhum tipo novo é necessário.

| Campo | Tipo | Obrigatório | Origem | Descrição |
|-------|------|-------------|--------|-----------|
| `id` | `number` | Sim | API | Identificador usado na consulta e na adição ao carrinho |
| `nome` | `string` | Sim | API | Nome exibido na tela |
| `descricao` | `string` | Sim | API | Descrição completa do produto |
| `preco` | `number` | Sim | API | Preço unitário em centavos |
| `categoria` | `Categoria` | Sim | API | Categoria do produto |
| `estoque` | `number` | Sim | API | Estoque total informado pela API |
| `imagem` | `string` | Sim | API | URL da imagem |

**Regras**:

- `preco` é sempre exibido em reais com `formatarPrecoCentavos`.
- `descricao` pode ser vazia; nesse caso, exibir um texto padrão.
- `estoque` é usado para calcular a disponibilidade e bloquear a adição.
- O produto da rota é apenas render inicial; o estado canônico vem da consulta.

### EstadoDetalhesProduto

Estado mantido pela `DetalhesProdutoScreen`.

| Campo | Tipo | Inicial | Descrição |
|-------|------|---------|-----------|
| `produto` | `Produto \| null` | Produto da rota | Último produto carregado com sucesso |
| `carregando` | `boolean` | `true` | Consulta de detalhes em andamento |
| `erro` | `string \| null` | `null` | Erro de carregamento atual |
| `erroAdicao` | `string \| null` | `null` | Erro da última adição ao carrinho |
| `sucessoAdicao` | `string \| null` | `null` | Confirmação temporária de adição |
| `imagemFalhou` | `boolean` | `false` | Indica fallback de imagem |

**Regras**:

- `produto !== null`: conteúdo pode ser exibido; `carregando` vira indicador discreto.
- `produto === null && carregando`: estado de carregamento de tela.
- `produto === null && erro !== null`: erro com “Tentar novamente”.
- `erroAdicao` e `sucessoAdicao` são mutuamente exclusivos na última operação.
- O banner de sucesso é limpo após alguns segundos ou ao iniciar nova adição.
- O estado é local da tela; o carrinho permanece no `CarrinhoContext`.

### Valores derivados

| Nome | Cálculo | Uso |
|------|---------|-----|
| `quantidadeNoCarrinho` | `carrinho?.itens.find(item => item.produtoId === produto.id)?.quantidade ?? 0` | Exibir disponibilidade e evitar excesso |
| `estoqueDisponivel` | `max(produto.estoque - quantidadeNoCarrinho, 0)` | Mostrar estoque e decidir bloqueio |
| `esgotado` | `estoqueDisponivel <= 0` | Texto “Esgotado” e botão desabilitado |
| `adicionando` | `operacao?.tipo === "adicionar" && operacao.produtoId === produto.id` | Spinner no botão |
| `adicaoDesabilitada` | `operacao !== null \|\| esgotado` | Bloqueio de novos toques |

### OperacaoCarrinho

Reutilizado de `Carrinho/Types/carrinho.ts`. A tela apenas observa a operação existente.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `tipo` | `"adicionar" \| "alterar" \| "remover" \| "limpar"` | Tipo da operação em andamento |
| `produtoId` | `number \| undefined` | Produto afetado, quando aplicável |

**Regras**:

- A tela não cria operações; usa `adicionarProduto` do contexto.
- Enquanto `operacao !== null`, o botão de adicionar fica desabilitado.
- Toques repetidos não geram nova requisição.

### ErroCatalogo

Reutilizado de `Carrinho/Types/catalogo.ts`, compatível com `obterMensagemDeErro`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `codigo` | `string` | Código interno (`rede`, `http_400`, `http_401`, `http_404`, `http_500`, `resposta_invalida`, etc.) |
| `mensagem` | `string` | Mensagem em português exibida na tela |

**Regras**:

- Mensagens não incluem stack trace, corpo bruto da API ou a chave de acesso.
- `http_404` indica produto indisponível e leva ao estado específico.
- Cancelamentos (`AbortError`) não são convertidos em erro de tela.

## Relacionamentos

```text
Produto 1 ─── 0..N ItemCarrinho        (pelo produtoId)
Usuário autenticado 1 ─── 1 Carrinho   (existente)
Carrinho 1 ─── 0..N ItemCarrinho       (existente)
EstadoDetalhesProduto 1 ─── 0..1 Produto
EstadoDetalhesProduto 1 ─── 0..1 ErroCatalogo
```

- A tela exibe exatamente um produto por vez.
- O produto pode ou não estar no carrinho; isso altera a disponibilidade exibida.
- A adição usa o identificador do produto e a integração existente do carrinho.

## Regras de validação

| Regra | Campo | Condição | Comportamento |
|-------|-------|----------|---------------|
| RV-301 | Resposta de detalhes | Não é objeto com campos obrigatórios válidos | Lançar `ErroCatalogo` de resposta inválida |
| RV-302 | `id` | Número não finito | Lançar `ErroCatalogo` de resposta inválida |
| RV-303 | `nome` / `categoria` | String vazia ou tipo incorreto | Lançar `ErroCatalogo` de resposta inválida |
| RV-304 | `descricao` / `imagem` | Tipo incorreto | Lançar `ErroCatalogo` de resposta inválida |
| RV-305 | `preco` / `estoque` | Número não finito ou negativo | Lançar `ErroCatalogo` de resposta inválida |
| RV-306 | Adição | `estoqueDisponivel <= 0` | Não chamar a API; informar “Esgotado” |
| RV-307 | Adição | Já existe operação ativa | Ignorar novo toque |
| RV-308 | Consulta | `signal` abortado ou requisição obsoleta | Ignorar resultado |
| RV-309 | Produto não encontrado | Código `http_404` | Exibir estado de indisponibilidade e opção de voltar |

## Transições de estado

### Carregamento

```text
[inicial: produto da rota]
   │ GET /produtos/:id
   ▼
[carregando] ── sucesso ──▶ [produto atualizado exibido]
   │                              │
   │ 404                          │ retry
   ▼                              ▼
[produto indisponível]        [carregando]

   │ falha de rede/API
   ▼
[produto inicial + erro + tentar novamente]
```

| De | Evento | Para | Efeito |
|----|--------|------|--------|
| Inicial | Montagem | Carregando | Indicador discreto se já houver produto |
| Carregando | Sucesso | Produto exibido | Substitui dados e limpa erro |
| Carregando | 404 | Indisponível | Remove conteúdo e oferece voltar |
| Carregando | Falha temporária | Produto inicial + erro | Mantém conteúdo e oferece retry |
| Erro | Retry | Carregando | Nova consulta |

### Adição

```text
[produto exibido]
   │ toque em “Adicionar ao carrinho”
   ▼
[adição em andamento] ── sucesso ──▶ [produto + banner de sucesso]
   │                                      │
   │ falha                                │ estoque zera
   ▼                                      ▼
[produto anterior + erro]             [botão “Esgotado”]
```

| De | Evento | Para | Efeito |
|----|--------|------|--------|
| Produto exibido | Adicionar | Operação (adicionar) | Spinner e botão desabilitado |
| Operação | Sucesso | Produto + sucesso | Banner temporário; carrinho e disponibilidade atualizados |
| Operação | Falha | Produto anterior + erro | Mantém dados e exibe mensagem |
| Produto exibido | Estoque disponível = 0 | Esgotado | Botão desabilitado com texto “Esgotado” |

### Sessão

| De | Evento | Para | Efeito |
|----|--------|------|--------|
| Autenticado | Logout | Não autenticado | Tela sai da pilha; carrinho é descartado pelo contexto |
| Autenticado | Troca de usuário | Novo carrinho | Disponibilidade recalculada com o carrinho do novo usuário |

## Observações de implementação

- `Produto` já existe em `Types/types.ts`; não duplicar.
- `ErroCatalogo` já existe em `Types/catalogo.ts`; não criar novo tipo de erro.
- O carrinho é a fonte da verdade para a quantidade já adicionada.
- A tela não calcula totais; apenas exibe preço e estoque.
- O produto da rota é usado apenas para render inicial.
- A consulta deve ser cancelada ao desmontar a tela.
