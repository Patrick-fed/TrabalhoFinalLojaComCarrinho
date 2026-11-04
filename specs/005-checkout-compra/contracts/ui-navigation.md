# UI & Navigation Contract: Checkout e Confirmação

**Feature**: `005-checkout-compra` | **Date**: 2026-11-04

## Rotas

```ts
type AppStackParamList = {
  Catalogo: undefined;
  DetalhesProduto: { produto: Produto };
  Carrinho: undefined;
  Checkout: undefined;
  ConfirmacaoCompra: { compra: Compra; carrinhoAtualizado: boolean };
};
```

| Origem | Ação | Destino |
|--------|------|---------|
| Carrinho | “Finalizar compra” | `Checkout` (`navigate`) |
| Checkout | Compra confirmada | `ConfirmacaoCompra` (`replace`) |
| Confirmação | “Voltar ao catálogo” | `Catalogo` (`reset`) |
| Checkout | “Voltar” | `Carrinho` (`goBack`) |

## CheckoutScreen

### Estrutura

- Cabeçalho com “Voltar” e título “Checkout”.
- Resumo do carrinho:
  - itens com nome, quantidade, subtotal;
  - total geral.
- Seção “Forma de pagamento”:
  - loading enquanto busca;
  - erro com “Tentar novamente”;
  - aviso se a lista estiver vazia;
  - opções selecionáveis (uma por vez).
- Aviso de divergência, quando aplicável.
- Botão “Finalizar compra”.

### Estados

| Estado | Condição | Interface |
|--------|----------|-----------|
| Carregando inicial | `carregando` do contexto ou `carregandoFormas` | `CarregandoScreen`/spinner |
| Carrinho vazio | Sem itens | Aviso + botão desabilitado |
| Erro no carrinho | `erro` do contexto | `MensagemErro` + “Tentar novamente” |
| Erro nas formas | `erroFormas` | `MensagemErro` + “Tentar novamente” |
| Formas vazias | Lista vazia | Aviso “Nenhuma forma de pagamento disponível.” |
| Pronto | Carrinho + formas | Resumo + seleção + botão habilitado |
| Sem seleção | `formaSelecionada === null` | Botão desabilitado ou aviso ao tocar |
| Finalizando | `finalizando` | Spinner no botão + desabilitado |
| Erro na compra | `erroFinalizacao` | `MensagemErro` + botão reabilitado |
| Divergência | `avisoDivergencia` | Aviso + exigir novo toque |

### Ações

- **Voltar**: `navigation.goBack()`.
- **Selecionar forma**: apenas ids conhecidos.
- **Tentar novamente**: recarrega carrinho e/ou formas.
- **Finalizar compra**:
  1. Ignora se `finalizandoRef.current` ou carrinho vazio ou sem forma.
  2. Reconsulta o carrinho.
  3. Compara com o snapshot.
  4. Se divergir, atualiza resumo, exibe aviso e exige nova confirmação.
  5. Se igual, chama `registrarCompra`.
  6. Em sucesso, chama `limparCarrinho` e navega com `replace`.
  7. Em erro, exibe mensagem e reabilita.

### Acessibilidade

- Botões com rótulos claros.
- Opções de pagamento com estado selecionado visível.
- Mensagens de erro em texto legível, não apenas cor.
- Alvos de toque com tamanho adequado.

## ConfirmacaoCompraScreen

### Estrutura

- Título “Compra confirmada”.
- Identificador da compra.
- Lista de itens e quantidades.
- Total.
- Forma de pagamento (rótulo fixo).
- Status retornado pela API.
- Aviso opcional se `carrinhoAtualizado === false`.
- Botão “Voltar ao catálogo”.

### Regras

- Exibir somente dados de `compra` recebida por parâmetro.
- Não refazer requisições automaticamente.
- Não reenviar a compra.
- `navigation.reset` para `Catalogo` ao voltar.
- Se `carrinhoAtualizado === false`, tentar limpar/atualizar o carrinho ao voltar.

## Componentes Reutilizados

| Componente | Uso |
|------------|-----|
| `BotaoPrincipal` | “Finalizar compra” e “Voltar ao catálogo” |
| `MensagemErro` | Erros de carrinho, formas e compra |
| `ItemCarrinhoCard` | Itens no resumo do checkout |
| `CarregandoScreen` | Carregamento inicial |
| `CORES` | Paleta e estados |

## Mensagens

- “Seu carrinho está vazio.”
- “Selecione uma forma de pagamento.”
- “Não foi possível carregar as formas de pagamento.”
- “Nenhuma forma de pagamento disponível.”
- “Seu carrinho foi atualizado. Revise e confirme novamente.”
- “Não foi possível finalizar a compra.”
- “Compra confirmada.”
- “O carrinho será atualizado ao voltar ao catálogo.”
