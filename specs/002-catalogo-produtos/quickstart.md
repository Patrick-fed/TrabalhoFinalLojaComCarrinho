# Quickstart: Catálogo de Produtos

**Feature**: `002-catalogo-produtos` | **Date**: 2026-11-02

Este roteiro configura e valida o catálogo no Expo Web. A autenticação da feature 001
deve estar funcionando.

## Pré-requisitos

- Node.js e npm instalados.
- Dependências de `Carrinho/` instaladas (`npm install`).
- Projeto Firebase da feature 001 configurado.
- Acesso à API da loja e à chave `x-api-key`.
- Navegador atualizado.

## 1. Configurar as variáveis de ambiente

Confirme que `Carrinho/.env` contém, além das variáveis do Firebase:

```env
EXPO_PUBLIC_API_URL=https://loja-api-wheat.vercel.app
EXPO_PUBLIC_API_KEY=<sua-chave>
```

**Importante**:

- `Carrinho/.env` não deve ser commitado.
- Valores `EXPO_PUBLIC_*` ficam embutidos no bundle; não coloque segredos de servidor.
- A chave usada pela API não deve aparecer em logs, prints ou mensagens de erro.

## 2. Instalar dependências

Nenhuma dependência nova é necessária. Se `Carrinho/node_modules` não existir:

```bash
cd Carrinho
npm install
```

## 3. Rodar o app na web

```bash
cd Carrinho
npx expo start --web
```

O navegador deve abrir a tela de login. Autentique-se para acessar o catálogo.

## 4. Verificação de tipos

```bash
cd Carrinho
npm run typecheck
```

Não deve haver erros de TypeScript.

## 5. Verificação rápida da API

Opcional, para confirmar a chave e os endpoints antes de testar a tela:

```bash
curl -H "x-api-key: $EXPO_PUBLIC_API_KEY" \
  "https://loja-api-wheat.vercel.app/categorias"

curl -H "x-api-key: $EXPO_PUBLIC_API_KEY" \
  "https://loja-api-wheat.vercel.app/produtos?busca=teclado"

curl -H "x-api-key: $EXPO_PUBLIC_API_KEY" \
  "https://loja-api-wheat.vercel.app/produtos?categoria=eletronicos&busca=teclado"
```

No PowerShell, use `Invoke-RestMethod` com o header:

```powershell
$key = (Get-Content Carrinho\.env | Where-Object { $_ -match '^EXPO_PUBLIC_API_KEY=' }) -replace '^EXPO_PUBLIC_API_KEY=', ''
$headers = @{ 'x-api-key' = $key.Trim() }

Invoke-RestMethod -Uri 'https://loja-api-wheat.vercel.app/categorias' -Headers $headers
Invoke-RestMethod -Uri 'https://loja-api-wheat.vercel.app/produtos?busca=teclado' -Headers $headers
```

## 6. Roteiro manual de validação

### Acesso e carregamento inicial

- [ ] Sem autenticação, o catálogo não é acessível e o app permanece na autenticação.
- [ ] Após o login, o catálogo é exibido com carregamento em tela cheia na primeira carga.
- [ ] Com a API disponível, os produtos aparecem em cards com imagem, nome e preço.
- [ ] O preço de `19990` centavos aparece como `R$ 199,90`.
- [ ] A lista rola e mantém a posição ao voltar dos detalhes.
- [ ] Com resposta vazia, aparece "Nenhum produto disponível no momento.".

### Busca

- [ ] Digitar "teclado" e parar: após 300 ms, apenas "Teclado mecânico" aparece.
- [ ] Digitar "Teclado" e "TECLADO" retorna o mesmo produto (API case-insensitive).
- [ ] Digitar "mecanico" não encontra "Teclado mecânico" (API sensível a acentos).
- [ ] Digitar "mecânico" encontra "Teclado mecânico".
- [ ] Uma busca sem resultados exibe a mensagem de nenhum produto encontrado.
- [ ] Limpar a busca restaura a lista completa.
- [ ] Digitar apenas espaços é tratado como busca vazia.

### Filtro por categoria

- [ ] Todas as 9 categorias da API aparecem no seletor.
- [ ] Selecionar "Eletrônicos" mostra apenas produtos de `eletronicos`.
- [ ] Trocar a categoria atualiza a lista.
- [ ] Selecionar "Todas" remove o filtro.
- [ ] A categoria selecionada fica visualmente destacada.
- [ ] Uma categoria sem produtos exibe a mensagem de nenhum resultado.

### Busca + categoria

- [ ] Com "Eletrônicos" selecionado, buscar "teclado" mostra apenas o teclado.
- [ ] Uma combinação sem resultados exibe a mensagem de nenhum produto para os filtros.
- [ ] "Limpar filtros" restaura a lista completa.
- [ ] Alterar apenas a busca preserva a categoria; alterar apenas a categoria preserva a
      busca.

### Erros e recuperação

- [ ] Sem conexão, a primeira carga mostra erro em português com "Tentar novamente".
- [ ] A nova tentativa carrega os produtos quando a conexão volta.
- [ ] Com a lista já exibida, simular falha de rede e mudar o filtro: a lista anterior
      permanece visível e o erro aparece junto aos filtros.
- [ ] "Tentar novamente" reaplica a busca e a categoria ativas.
- [ ] Uma chave de API inválida gera mensagem amigável, sem expor a chave.
- [ ] Categoria inválida (HTTP 400) gera mensagem amigável.
- [ ] Resposta com formato inesperado não quebra a tela.
- [ ] Toques repetidos em "Tentar novamente" não geram requisições duplicadas.

### Detalhes do produto

- [ ] Tocar em um card abre a tela provisória do produto correto.
- [ ] A tela exibe imagem, nome e o aviso de implementação futura.
- [ ] Voltar preserva busca, categoria e posição da lista.
- [ ] Toques repetidos no mesmo card não abrem várias telas.
- [ ] Imagem inválida exibe placeholder sem esconder nome/preço.

### Logout

- [ ] "Sair" está acessível no cabeçalho do catálogo.
- [ ] "Sair" retorna à tela de login.
- [ ] Após o logout, voltar pelo navegador não acessa o catálogo.
- [ ] Falha no logout mantém a tela e exibe mensagem de erro.

## 7. Problemas comuns

| Sintoma | Verificação |
|---------|-------------|
| Catálogo não carrega | Confirmar `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_API_KEY` em `Carrinho/.env` |
| Erro de acesso à API | Confirmar que a chave está correta e que o header `x-api-key` está sendo enviado |
| Busca não retorna resultado com acento | A API é sensível a acentos; testar com a grafia exata do nome |
| Categorias não aparecem | Verificar `GET /categorias` e se a tela está usando a lista retornada |
| Preço incorreto | Confirmar conversão de centavos para reais e uso de `Intl.NumberFormat` |
| Lista some durante a busca | Confirmar que a lista anterior só é substituída em caso de sucesso |
| Erro ao sair | Confirmar que `AuthContext` e a pilha de autenticação continuam configurados |
| Tipo `Categoria` inválido | Confirmar que `Types/types.ts` foi exportado e inclui as 9 categorias |
