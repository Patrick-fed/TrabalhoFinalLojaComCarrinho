# Quickstart: Detalhes do Produto

**Feature**: `004-detalhes-produto` | **Date**: 2026-11-03

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
3. Para testar esgotado, escolha um produto com `estoque = 0` ou esgote o estoque pela API.
4. Para testar produto indisponível, use um identificador inexistente ou remova o produto
   da API antes de abrir os detalhes.

## Validação manual por história

### US1 — Visualizar detalhes completos

1. Autentique-se e abra o catálogo.
2. Toque na área principal de um produto.
3. Verifique:
   - a tela de detalhes do produto correto é aberta;
   - a imagem aparece em tamanho maior;
   - o nome é exibido;
   - o preço aparece no formato `R$ 0,00`;
   - o estoque disponível é exibido;
   - a descrição completa aparece e pode ser rolada.
4. Use um produto com descrição longa e confirme a rolagem.
5. Volte ao catálogo e confirme que busca, categoria e posição foram preservadas.

**Aceite**: todos os campos correspondem ao produto selecionado e o retorno não reinicia a
lista.

### US2 — Adicionar ao carrinho

1. Abra os detalhes de um produto com estoque.
2. Toque em “Adicionar ao carrinho”.
3. Verifique:
   - o botão mostra spinner durante a operação;
   - o banner de sucesso aparece;
   - o badge do carrinho no catálogo é atualizado ao voltar.
4. Abra o carrinho e confirme o item com nome, preço, quantidade e subtotal corretos.
5. Volte aos detalhes e adicione novamente.
6. Verifique que a quantidade foi incrementada, sem duplicar o item.
7. Adicione até atingir o estoque disponível e confirme que o botão passa a “Esgotado”.

**Aceite**: adição usa a integração existente, quantidade inicial `1`, sem duplicação e com
bloqueio ao esgotar.

### US3 — Consistência e sessão

1. Abra detalhes, adicione um item, saia e entre com outro usuário.
2. Verifique que o carrinho e a disponibilidade refletem apenas o novo usuário.
3. Navegue rapidamente entre dois produtos e confirme que os dados exibidos são do produto
   atual.
4. Volte ao catálogo e confirme a preservação de busca, categoria e posição.

**Aceite**: nenhum dado de outro produto ou de outro usuário aparece na tela.

## Validação de estados e falhas

### Carregamento

1. Abra os detalhes em conexão normal.
2. Verifique o indicador de atualização e, depois, os dados atualizados.
3. Em conexão lenta, confirme que o conteúdo inicial não quebra a tela.

### Erro de rede

1. Antes de abrir os detalhes, desative a rede ou pare a API.
2. Abra os detalhes.
3. Verifique a mensagem em português, sem stack trace, e a opção “Tentar novamente”.
4. Restaure a rede e use “Tentar novamente”; confirme que os dados são carregados.

### Produto não encontrado

1. Use um identificador inexistente ou remova o produto antes de abrir os detalhes.
2. Verifique a mensagem de produto indisponível e a opção “Voltar ao catálogo”.

### Imagem indisponível

1. Use um produto com URL de imagem inválida.
2. Verifique o fallback “Imagem indisponível” sem esconder nome, descrição, preço e estoque.

### Estoque

1. Abra um produto com `estoque = 0`.
2. Verifique o texto “Produto esgotado” e o botão desabilitado.
3. Adicione unidades até o limite e confirme o bloqueio.

### Toques repetidos

1. Toque várias vezes rapidamente em “Adicionar ao carrinho”.
2. Verifique que apenas uma requisição é aplicada e que o botão permanece bloqueado durante
   a operação.

## Checklist de conclusão

- [ ] `npm run typecheck` sem erros.
- [ ] Detalhes abertos pelo catálogo com o produto correto.
- [ ] Imagem ampliada, nome, descrição, preço e estoque exibidos.
- [ ] Preço no formato `R$ 0,00`.
- [ ] Descrição longa legível por rolagem.
- [ ] Adicionar ao carrinho reutiliza o contexto existente.
- [ ] Quantidade inicial `1` e incremento sem duplicação.
- [ ] Adição bloqueada quando esgotado.
- [ ] Feedback de sucesso e erro exibidos corretamente.
- [ ] Carregamento, erro com retry e produto indisponível tratados.
- [ ] Imagem indisponível usa fallback.
- [ ] Catálogo e carrinho continuam funcionando.
- [ ] Busca, categoria e posição preservadas ao voltar.
- [ ] Nenhum detalhe técnico ou chave exposto.

## Solução de problemas

| Sintoma | Verificação |
|---------|-------------|
| API retorna 401/403 | Confirme `EXPO_PUBLIC_API_KEY` no `.env` e reinicie o Expo. |
| Requisições falham no navegador | Confirme a URL da API e se o servidor está acessível. |
| Detalhes não atualizam | Confirme `buscarProdutoPorId` e o uso de `ROTAS.produtoPorId`. |
| Estoque incorreto | Verifique se a quantidade no carrinho está sendo descontada. |
| Adicionar não funciona | Confirme o `CarrinhoProvider` e o `useCarrinho` na tela. |
| Badge não atualiza | Verifique se a adição usa o contexto e não o serviço diretamente. |
| Produto removido quebra a tela | Confirme o tratamento de `http_404`. |
| Imagem quebrada | Confirme o fallback de imagem na tela de detalhes. |
| TypeScript aponta erro na rota | Confirme `DetalhesProduto: { produto: Produto }` em `Types/navigation.ts`. |
