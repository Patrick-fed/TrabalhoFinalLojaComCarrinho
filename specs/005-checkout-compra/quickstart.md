# Quickstart: Checkout e Confirmação de Compra

**Feature**: `005-checkout-compra` | **Date**: 2026-11-04

## Pré-requisitos

- Node.js e npm instalados.
- Dependências instaladas em `Carrinho/`.
- API `https://loja-api-wheat.vercel.app` acessível.
- Conta de teste válida no app (Firebase) para obter `usuarioId`.
- Carrinho com ao menos um produto para os cenários de sucesso.

## Comandos

```powershell
cd Carrinho
npm install
npm run typecheck
npm run web
```

Para validar no mobile, usar o Expo Go ou um emulador configurado.

## Cenários de Validação

### 1. Acesso ao checkout

1. Abrir o catálogo e adicionar um produto ao carrinho.
2. Abrir o carrinho.
3. Tocar em “Finalizar compra”.

Esperado: checkout abre em 1 toque, com resumo do carrinho e loading das formas de
pagamento.

### 2. Revisão do carrinho

1. No checkout, conferir itens, quantidades, subtotais e total.

Esperado: valores iguais aos do carrinho e formatados em reais.

### 3. Formas de pagamento

1. Aguardar o carregamento.
2. Selecionar “Pix”, “Cartão” ou “Boleto”.
3. Tentar finalizar sem selecionar.

Esperado: apenas uma forma selecionada por vez; sem seleção, a finalização é bloqueada com
mensagem clara.

### 4. Compra confirmada

1. Selecionar uma forma de pagamento.
2. Tocar em “Finalizar compra”.
3. Aguardar a confirmação.

Esperado: tela de confirmação com identificador, itens, total, forma de pagamento e status
retornados pela API. O carrinho fica vazio.

4. Tocar em “Voltar ao catálogo”.

Esperado: catálogo aberto; voltar não reabre o checkout.

### 5. Carrinho vazio

1. Esvaziar o carrinho.
2. Tentar abrir o checkout pelo carrinho.

Esperado: ação de finalizar indisponível ou checkout com aviso de carrinho vazio; nenhuma
compra é enviada.

### 6. Divergência de carrinho

1. Abrir o checkout com um item.
2. Em outra sessão/aba, alterar a quantidade ou remover o item.
3. Tocar em “Finalizar compra”.

Esperado: o resumo é atualizado, um aviso de divergência aparece e uma nova confirmação é
exigida antes de enviar a compra.

### 7. Falha de rede nas formas de pagamento

1. Ativar o modo offline (ou bloquear a API).
2. Abrir o checkout.

Esperado: mensagem de erro com “Tentar novamente”; ao restaurar a rede e tentar novamente,
as formas carregam.

### 8. Falha ao registrar a compra

1. Bloquear a API antes de finalizar.
2. Tocar em “Finalizar compra”.

Esperado: mensagem de erro clara, botão reabilitado e nenhuma confirmação falsa; o carrinho
permanece intacto.

### 9. Toques repetidos

1. Tocar várias vezes em “Finalizar compra”.

Esperado: apenas uma requisição é enviada; o botão fica desabilitado durante a operação.

### 10. Falha ao limpar o carrinho

1. Simular falha no `DELETE /carrinho/:usuarioId` após uma compra bem-sucedida.

Esperado: confirmação continua visível com aviso de que o carrinho será atualizado; ao
voltar ao catálogo, o carrinho é limpo/atualizado.

### 11. Forma de pagamento desconhecida

1. Simular a API retornando uma forma com id desconhecido.

Esperado: a forma aparece com o `nome` retornado e não pode ser selecionada; as demais
funcionam normalmente.

### 12. Logout durante a finalização

1. Iniciar a finalização e sair da conta antes da resposta.

Esperado: nenhuma confirmação é exibida após o logout; a resposta é ignorada.

## Checklist Final

- [ ] `npm run typecheck` sem erros.
- [ ] Checkout abre pelo carrinho.
- [ ] Resumo confere com o carrinho.
- [ ] Formas de pagamento carregam e são selecionáveis.
- [ ] Finalização exige forma de pagamento.
- [ ] Compra confirmada exibe dados oficiais da API.
- [ ] Carrinho fica vazio após sucesso.
- [ ] Divergência exige nova confirmação.
- [ ] Erros de rede e de API são exibidos sem dados sensíveis.
- [ ] Toques repetidos não duplicam a compra.
- [ ] Falha de limpeza é avisada e tratada no retorno.
- [ ] Formas desconhecidas não quebram a tela.
- [ ] Logout durante a finalização não gera confirmação indevida.
