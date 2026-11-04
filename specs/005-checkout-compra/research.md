# Research: Checkout e Confirmação de Compra

**Feature**: `005-checkout-compra` | **Date**: 2026-11-04

## Objetivo

Registrar as decisões técnicas do checkout, os achados verificados na API e os padrões do
código existente que serão reutilizados. Não há `NEEDS CLARIFICATION` pendente.

## Achados da API

Verificações executadas contra `https://loja-api-wheat.vercel.app` com `x-api-key`:

| Verificação | Resultado |
|-------------|-----------|
| `GET /formas-pagamento` | `200` com `[{ "id": "pix", "nome": "Pix" }, { "id": "cartao", "nome": "Cartão de crédito" }, { "id": "boleto", "nome": "Boleto" }]` |
| `GET /compras?usuarioId=teste` | `200` com `[]` |
| `GET /compras` sem `usuarioId` | `400` com mensagem de validação do identificador |
| `POST /compras` | Rota existente; corpo inferido como `{ usuarioId, formaPagamento }` e resposta `Compra` |
| `DELETE /carrinho/:usuarioId` | Rota existente no serviço de carrinho |

O `POST /compras` não foi executado para evitar criar uma compra real. O contrato será
confirmado no quickstart com uma compra de teste; se a API retornar `400`, o payload do
serviço será ajustado.

## Padrões do Código Existente

- `Service/carrinho.ts` centraliza `fetch`, header `x-api-key`, validação de resposta e
  conversão de erros em mensagens. O checkout seguirá o mesmo estilo, com helper próprio
  para não refatorar serviços existentes.
- `Service/rotas.ts` já declara `formasPagamento` e `compras`.
- `CarrinhoContext` expõe `carrinho`, `carregando`, `erro`, `operacao`, `recarregar`,
  `adicionarProduto`, `alterarQuantidade`, `removerItem` e `limparCarrinho`.
- `Types/types.ts` define `FormaPagamento = "pix" | "cartao" | "boleto"`, `ItemCarrinho`,
  `Carrinho` e `Compra`.
- Componentes reutilizáveis: `BotaoPrincipal`, `MensagemErro`, `ItemCarrinhoCard`,
  `ModalConfirmacao` e `CarregandoScreen`.
- Constantes: `CORES`, `MENSAGENS_CARRINHO`, `MENSAGENS_ERRO_CARRINHO`,
  `MENSAGEM_ERRO_PADRAO`.
- Utils: `formatarPrecoCentavos` e `obterMensagemDeErro`.
- Sem framework de testes; validação por `npm run typecheck` (`tsc --noEmit`) e roteiro
  manual.

## Decisões

### D-401 — Manter a pilha existente

**Decisão**: usar Expo, React Native, TypeScript, `fetch`, React Navigation 7 e os
componentes já presentes.

**Motivo**: atende à constituição e evita dependências novas.

**Alternativas rejeitadas**: bibliotecas de formulário, máscaras ou estado global extra;
não são necessárias para um formulário de seleção única.

### D-402 — Serviço dedicado ao checkout

**Decisão**: criar `Service/compras.ts` com `listarFormasPagamento` e `registrarCompra`,
usando `ROTAS.formasPagamento` e `ROTAS.compras`.

**Motivo**: mantém a tela livre de HTTP e segue a separação existente.

**Alternativas rejeitadas**: adicionar funções em `carrinho.ts` (mistura responsabilidades)
ou fazer `fetch` direto na tela (dificulta teste e tratamento de erro).

### D-403 — Formas de pagamento

**Decisão**: validar a resposta como `FormaPagamentoDisponivel[]` (`id` e `nome` não
vazios). Mapear ids conhecidos para rótulos fixos: `pix` → “Pix”, `cartao` → “Cartão”,
`boleto` → “Boleto”. Ids desconhecidos são exibidos com o `nome` retornado e ficam
desabilitados.

**Motivo**: cumpre o requisito de rótulos fixos sem quebrar se a API adicionar uma forma.

**Alternativas rejeitadas**: confiar apenas no `nome` da API (rótulos podem mudar) ou
descartar ids desconhecidos (esconde informação útil).

### D-404 — Registro da compra

**Decisão**: enviar `POST /compras` com `{ usuarioId, formaPagamento }` e validar a
resposta como `Compra`. O campo `status` passa a ser `string`, permitindo valores
desconhecidos.

**Motivo**: a API é a fonte oficial da compra; o app não deve inventar status.

**Alternativas rejeitadas**: montar a compra localmente (pode divergir da API) ou fixar
`status: "confirmada"` (quebra com status novos).

### D-405 — Reconsulta do carrinho

**Decisão**: o checkout chama `recarregar()` ao abrir e novamente antes de confirmar.
`recarregar` passa a retornar `Carrinho | null`.

**Motivo**: garante que o resumo e a compra usem o carrinho atual do servidor; o retorno
permite comparar com o snapshot.

**Alternativas rejeitadas**: usar apenas o estado do contexto (pode estar desatualizado) ou
duplicar a chamada HTTP na tela (quebra a fonte única).

### D-406 — Detecção de divergência

**Decisão**: comparar o snapshot exibido com o carrinho reconsultado por `produtoId`,
`quantidade` e `total`, independentemente da ordem. Se houver diferença, atualizar o resumo,
exibir aviso e exigir uma nova confirmação antes de enviar a compra.

**Motivo**: cumpre FR-021/FR-036 sem bloquear o cliente por reordenação de itens.

**Alternativas rejeitadas**: comparar arrays por ordem (falso positivo) ou ignorar
divergência (compra diferente do revisado).

### D-407 — Limpeza do carrinho

**Decisão**: após sucesso, chamar `limparCarrinho()` do contexto. Se falhar, manter a tela de
confirmação, exibir aviso e tentar limpar/atualizar ao voltar ao catálogo. Tratar `404` no
`DELETE` como carrinho já vazio (sucesso).

**Motivo**: a compra já foi registrada; a falha de limpeza não pode invalidar a confirmação.

**Alternativas rejeitadas**: bloquear a confirmação até limpar (pior experiência) ou ignorar
silenciosamente (carrinho reaparece).

### D-408 — Navegação

**Decisão**: adicionar `Checkout` e `ConfirmacaoCompra` ao `AppStackParamList`. Do checkout
para confirmação usar `navigation.replace`; da confirmação para o catálogo usar
`navigation.reset`.

**Motivo**: impede voltar ao checkout já finalizado e evita compra duplicada.

**Alternativas rejeitadas**: `navigate` (mantém o checkout na pilha) ou modal de sucesso
(menos claro para o trabalho).

### D-409 — Proteção contra duplo envio

**Decisão**: usar `finalizandoRef` + estado `finalizando` para desabilitar o botão e ignorar
toques repetidos; usar `AbortController` e ignorar respostas após logout/desmontagem.

**Motivo**: evita compras duplicadas e atualizações em tela desmontada.

**Alternativas rejeitadas**: confiar apenas no estado (atualizações assíncronas podem
permitir dois toques) ou debounce (não cobre reenvio).

### D-410 — Tratamento de erros

**Decisão**: mapear falhas para `ErroCheckout` (`codigo` + `mensagem` em português). Cobrir
rede, `400`, `401/403`, `404`, `409/422`, `5xx`, JSON inválido e formato inesperado. Não
exibir corpo bruto, chave ou stack trace.

**Motivo**: mensagens claras e seguras, sem vazar detalhes internos.

**Alternativas rejeitadas**: mostrar `response.text()` (pode conter detalhes internos) ou
mensagem genérica para tudo (não orienta o cliente).

### D-411 — Reutilização de componentes

**Decisão**: reutilizar `BotaoPrincipal`, `MensagemErro`, `ItemCarrinhoCard`,
`CarregandoScreen` e `CORES`; criar estilos locais apenas para o layout do checkout e da
confirmação.

**Motivo**: consistência visual e menos código duplicado.

**Alternativas rejeitadas**: criar uma biblioteca de componentes nova (fora do escopo).

### D-412 — Estratégia de validação

**Decisão**: sem testes automatizados; validar com `npm run typecheck` e o roteiro manual de
`quickstart.md`.

**Motivo**: o projeto não possui framework de testes configurado.

**Alternativas rejeitadas**: introduzir Jest/Testing Library (dependência e escopo novos).
