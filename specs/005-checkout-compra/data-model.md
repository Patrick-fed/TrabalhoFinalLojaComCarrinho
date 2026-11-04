# Data Model: Checkout e Confirmação de Compra

**Feature**: `005-checkout-compra` | **Date**: 2026-11-04

## Entidades

### FormaPagamentoDisponivel

Representa uma forma de pagamento retornada pela API.

| Campo | Tipo | Obrigatório | Regra |
|-------|------|-------------|-------|
| `id` | `string` | Sim | Não vazio; identificador enviado em `POST /compras` |
| `nome` | `string` | Sim | Não vazio; exibido apenas para ids desconhecidos |

Relação: `id` conhecido (`pix`, `cartao`, `boleto`) é mapeado para o rótulo fixo definido em
`Constants/mensagensCheckout.ts`.

### ErroCheckout

Erro de domínio do checkout.

| Campo | Tipo | Obrigatório | Regra |
|-------|------|-------------|-------|
| `codigo` | `string` | Sim | Código estável para lógica/telemetria |
| `mensagem` | `string` | Sim | Texto em português, sem dados sensíveis |

Códigos previstos: `rede`, `http_400`, `http_401`, `http_403`, `http_404`, `http_409`,
`http_422`, `http_500`, `resposta_invalida`, `formato_inesperado`, `desconhecido`.

### Compra (existente, alterada)

| Campo | Tipo | Regra |
|-------|------|-------|
| `id` | `string` | Retornado pela API |
| `usuarioId` | `string` | Retornado pela API |
| `itens` | `ItemCarrinho[]` | Retornado pela API |
| `total` | `number` | Centavos, inteiro não negativo |
| `formaPagamento` | `FormaPagamento` | `pix`, `cartao` ou `boleto` |
| `status` | `string` | Alterado de `"confirmada"` para `string` |
| `criadaEm` | `string` | Data/hora retornada pela API |

### SnapshotRevisao

Cópia imutável do carrinho exibido no checkout, usada apenas para detectar divergência.

| Campo | Tipo | Regra |
|-------|------|-------|
| `itens` | `ItemCarrinho[]` | Cópia dos itens no momento da revisão |
| `quantidadeTotal` | `number` | Soma das quantidades |
| `total` | `number` | Total em centavos |

### EstadoCheckout

Estado local de `CheckoutScreen`.

| Campo | Tipo | Inicial | Regra |
|-------|------|---------|-------|
| `formasPagamento` | `FormaPagamentoDisponivel[]` | `[]` | Preenchido pela API |
| `carregandoFormas` | `boolean` | `true` | Verdadeiro durante a busca |
| `erroFormas` | `ErroCheckout \| null` | `null` | Erro da busca de formas |
| `formaSelecionada` | `FormaPagamento \| null` | `null` | Só ids conhecidos |
| `finalizando` | `boolean` | `false` | Bloqueia o botão |
| `erroFinalizacao` | `ErroCheckout \| null` | `null` | Erro do registro da compra |
| `snapshotRevisao` | `SnapshotRevisao \| null` | `null` | Última revisão exibida |
| `avisoDivergencia` | `boolean` | `false` | Carrinho mudou desde o snapshot |
| `aguardandoNovaConfirmacao` | `boolean` | `false` | Exige novo toque após divergência |

## Validações

| Entrada | Regra | Mensagem |
|---------|-------|----------|
| Formas de pagamento | Lista de objetos com `id` e `nome` não vazios | “Não foi possível carregar as formas de pagamento.” |
| Seleção | `formaSelecionada` deve ser um id conhecido | “Selecione uma forma de pagamento.” |
| Carrinho | Deve existir e ter ao menos um item | “Seu carrinho está vazio.” |
| Usuário | `usuarioId` não vazio | “Usuário não identificado.” |
| Divergência | Snapshot deve ser igual ao carrinho reconsultado | “Seu carrinho foi atualizado. Revise e confirme novamente.” |
| Compra | Resposta com `id`, `itens`, `total`, `formaPagamento`, `status` | “A loja retornou uma confirmação inválida.” |

## Transições de Estado

```text
[abrindo checkout]
  └─ recarregar carrinho + buscar formas
       ├─ carrinho vazio → estado vazio (sem finalizar)
       ├─ erro no carrinho → erro com "Tentar novamente"
       ├─ erro nas formas → erro com "Tentar novamente"
       └─ sucesso → resumo + formas + snapshot

[revisão]
  └─ selecionar forma
       └─ forma conhecida → habilita "Finalizar compra"

[finalizar]
  ├─ sem forma → aviso de seleção
  ├─ finalizando → ignora novo toque
  └─ reconsultar carrinho
       ├─ divergente → atualiza resumo + aviso + exige nova confirmação
       └─ igual → POST /compras
            ├─ erro → exibe erro e permite tentar novamente
            └─ sucesso → limparCarrinho
                 ├─ limpeza ok → ConfirmacaoCompra (carrinhoAtualizado = true)
                 └─ limpeza falhou → ConfirmacaoCompra (carrinhoAtualizado = false)

[confirmação]
  ├─ carrinhoAtualizado = false → aviso + tentar limpar ao voltar
  └─ "Voltar ao catálogo" → reset para Catalogo
```

## Regras de Comparação

- Comparar por `produtoId`, `quantidade` e `total`; a ordem dos itens não importa.
- Ignorar campos voláteis não exibidos (por exemplo, timestamps internos).
- Se o carrinho reconsultado for `null`, tratar como divergência/erro, nunca como sucesso.
- Se a API retornar `404` no `DELETE` após sucesso, considerar o carrinho já vazio.
