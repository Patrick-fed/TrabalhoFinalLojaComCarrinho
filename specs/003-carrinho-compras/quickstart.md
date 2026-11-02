# Quickstart: Carrinho de Compras

**Feature**: `003-carrinho-compras` | **Date**: 2026-11-02

Roteiro para executar e validar a feature após a implementação. Nenhuma dependência nova é
necessária.

## Pré-requisitos

- Node.js compatível com Expo 58.
- npm.
- Conta de teste com e-mail e senha válidos no Firebase configurado pelo projeto.
- Acesso à API `https://loja-api-wheat.vercel.app`.
- Arquivo `Carrinho/.env` com as variáveis abaixo.

```env
EXPO_PUBLIC_API_URL=https://loja-api-wheat.vercel.app
EXPO_PUBLIC_API_KEY=<chave-fornecida-pelo-projeto>
```

> Não versionar o `.env` nem colar a chave em issues, prints ou mensagens de erro.

## Instalação e execução

No PowerShell, a partir da raiz do repositório:

```powershell
Set-Location -LiteralPath "Carrinho"
npm install
npm run typecheck
npm run web
```

Para executar no celular:

```powershell
Set-Location -LiteralPath "Carrinho"
npm start
```

Abra o QR code no Expo Go ou pressione `a` para Android/iOS, conforme o ambiente.

## Verificação automática

```powershell
Set-Location -LiteralPath "Carrinho"
npm run typecheck
```

Critério de aceite: comando termina com código `0` e sem erros de TypeScript.

Não há suíte de testes automatizados neste projeto. A validação funcional é manual.

## Preparação dos dados

1. Crie ou use um usuário de teste no aplicativo.
2. No catálogo, escolha um produto com `estoque > 0`.
3. Para testar carrinho vazio, use um usuário recém-criado ou limpe o carrinho.

A API também aceita um UUID fixo para consulta manual de carrinho vazio:

```powershell
$headers = @{
  "x-api-key" = $env:EXPO_PUBLIC_API_KEY
  "Accept" = "application/json"
}
Invoke-RestMethod `
  -Uri "https://loja-api-wheat.vercel.app/carrinho/00000000-0000-0000-0000-000000000000" `
  -Headers $headers
```

Resposta esperada:

```json
{
  "usuarioId": "00000000-0000-0000-0000-000000000000",
  "itens": [],
  "quantidadeTotal": 0,
  "total": 0
}
```

## Validação manual por história

### US1 — Adicionar produto pelo catálogo

1. Autentique-se e abra o catálogo.
2. Confirme que o botão “Carrinho” aparece no cabeçalho com badge `0`.
3. Toque em “Adicionar” em um produto com estoque.
4. Verifique:
   - o card mostra spinner durante a operação;
   - o badge passa a exibir `1`;
   - a mensagem de sucesso aparece;
   - a tela continua no catálogo.
5. Toque em “Adicionar” novamente no mesmo produto.
6. Verifique que o badge exibe `2` e que o item não foi duplicado.

**Aceite**: produto aparece uma única vez no carrinho, com quantidade incrementada e
contador atualizado.

### US2 — Abrir e revisar o carrinho

1. Toque no botão “Carrinho”.
2. Verifique nome, imagem, preço unitário, quantidade e subtotal do item.
3. Confira o resumo com quantidade total e total.
4. Toque em “Voltar”.
5. Verifique que busca, categoria e posição da lista do catálogo foram preservadas.

**Aceite**: tela do carrinho exibe dados consistentes com o catálogo e o retorno não
reinicia a lista.

### US3 — Alterar quantidade

1. No carrinho, toque em “+” em um item.
2. Verifique o novo subtotal, o total e o badge.
3. Toque em “−”.
4. Verifique que a quantidade diminui e os totais são atualizados.
5. Com quantidade `1`, verifique que “−” está desabilitado.

**Aceite**: cada alteração é refletida nos subtotais, no total e no contador; quantidade
nunca fica abaixo de `1`.

### US4 — Remover item

1. No carrinho, toque em “Remover” em um item.
2. Verifique que o item desaparece, os totais são recalculados e o badge é atualizado.
3. Remova o último item.

**Aceite**: carrinho vazio exibe mensagem e totais `0`; badge exibe `0`.

### US5 — Limpar carrinho

1. Adicione pelo menos dois itens.
2. Toque em “Limpar carrinho”.
3. Verifique o modal de confirmação.
4. Toque em “Cancelar” e confirme que nada mudou.
5. Toque em “Limpar carrinho” novamente e confirme.
6. Verifique que todos os itens foram removidos e os totais ficaram zerados.

**Aceite**: limpeza só ocorre após confirmação; cancelar não altera o carrinho.

## Validação de estados e falhas

### Estoque

1. Identifique um produto com `estoque = 0` ou esgote o estoque pela API.
2. No catálogo, verifique que a ação exibe “Esgotado” e não adiciona.

### Rede

1. Antes de uma operação, desative a rede ou pare a API.
2. Tente adicionar ou alterar quantidade.
3. Verifique mensagem amigável, ausência de stack trace e preservação dos dados anteriores.
4. Restaure a rede e use “Tentar novamente” quando disponível.

### Sessão

1. Adicione itens, saia e entre com outro usuário.
2. Verifique que o carrinho do usuário anterior não aparece.
3. Entre novamente com o primeiro usuário e confirme que o carrinho foi recarregado da API.

### Toques repetidos

1. Toque várias vezes rapidamente em “Adicionar” ou “+”.
2. Verifique que apenas uma requisição é aplicada e que não há duplicação nem saltos
   inconsistentes de quantidade.

## Checklist de conclusão

- [ ] `npm run typecheck` sem erros.
- [ ] Badge do cabeçalho reflete `quantidadeTotal`.
- [ ] Adicionar pelo card usa quantidade `1` e não abre detalhes.
- [ ] Carrinho vazio exibe estado vazio e totais `0`.
- [ ] Aumentar/diminuir quantidade respeita mínimo `1`.
- [ ] Remover item atualiza totais e badge.
- [ ] Limpar carrinho exige confirmação.
- [ ] Totais exibidos vêm da API.
- [ ] Logout/troca de usuário isola os carrinhos.
- [ ] Falhas exibem mensagens em português sem detalhes técnicos.

## Solução de problemas

| Sintoma | Verificação |
|---------|-------------|
| API retorna 401/403 | Confirme `EXPO_PUBLIC_API_KEY` no `.env` e reinicie o Expo. |
| Requisições falham no navegador | Confirme a URL da API e se o servidor está acessível. |
| Carrinho não atualiza | Confirme o `uid` do usuário e se o header `x-api-key` foi enviado. |
| Totais divergentes | Verifique se a API retorna os valores em centavos e se o app não recalcula. |
| Badge não muda | Verifique se o `CarrinhoProvider` envolve o `AppNavigator` e se o contexto é consumido no cabeçalho. |
| TypeScript aponta erro em `Carrinho` na navegação | Confirme a rota `Carrinho: undefined` em `Types/navigation.ts`. |
| Modal não aparece no web | Confirme o uso de `Modal` do React Native, não de `Alert.alert`. |
| Imagem quebrada | Confirme o fallback de imagem no card e no item do carrinho. |
