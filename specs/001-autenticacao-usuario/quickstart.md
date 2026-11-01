# Quickstart: Autenticação de Usuário

**Feature**: `001-autenticacao-usuario` | **Date**: 2026-10-31

Este roteiro descreve como configurar e validar a autenticação no Expo Web.

## Pré-requisitos

- Node.js e npm instalados.
- Acesso ao console do Firebase com um projeto criado.
- Navegador atualizado para testar com `npx expo start --web`.

## 1. Configurar o Firebase

1. Acesse o console do Firebase e abra o projeto da loja.
2. Em **Authentication > Sign-in method**, habilite **E-mail/senha**.
3. Em **Configurações do projeto > Seus apps**, registre um app Web e copie as
   credenciais.

## 2. Configurar as variáveis de ambiente

Crie `Carrinho/.env` a partir de `Carrinho/.env.example` e preencha:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

**Importante**:

- `Carrinho/.env` não deve ser commitado.
- Valores `EXPO_PUBLIC_*` ficam embutidos no bundle do app. Não coloque segredos de
  servidor nesse arquivo.
- A segurança da autenticação depende das regras e configurações do Firebase.

## 3. Instalar dependências

```bash
cd Carrinho
npm install
npx expo install react-dom react-native-web @expo/metro-runtime
npx expo install @react-native-async-storage/async-storage
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

Se `Carrinho/node_modules` tiver sido removido do Git, o `npm install` recria a pasta
localmente.

## 4. Rodar o app na web

```bash
cd Carrinho
npx expo start --web
```

O navegador deve abrir a tela de login.

## 5. Verificação de tipos

```bash
cd Carrinho
npx tsc --noEmit
```

Não deve haver erros de TypeScript.

## 6. Roteiro manual de validação

Execute os cenários abaixo no navegador, usando um e-mail de teste ainda não cadastrado.

### Cadastro

- [ ] Campos vazios → mensagem "Preencha todos os campos." e nenhuma conta criada.
- [ ] E-mail inválido → mensagem "Informe um e-mail válido."
- [ ] Senha com menos de 6 caracteres → mensagem "A senha deve ter pelo menos 6 caracteres."
- [ ] Confirmação diferente da senha → mensagem "As senhas não coincidem."
- [ ] Cadastro válido → conta criada e redirecionamento para a Home.
- [ ] Repetir o mesmo e-mail → mensagem "Este e-mail já está cadastrado."

### Login

- [ ] E-mail ou senha incorretos → mensagem "E-mail ou senha incorretos."
- [ ] Campos vazios → mensagem "Preencha todos os campos."
- [ ] Credenciais corretas → redirecionamento para a Home.

### Sessão e proteção

- [ ] Com usuário logado, recarregar a página → continua autenticado.
- [ ] Sem usuário logado, tentar acessar a Home → permanece na autenticação.
- [ ] Durante a restauração da sessão → indicador de carregamento é exibido.

### Logout

- [ ] Na Home, tocar em "Sair" → retorna para a tela de login.
- [ ] Após o logout, tentar voltar pelo navegador → não acessa a Home.
- [ ] Recarregar a página após o logout → permanece na autenticação.

### Rede e erros gerais

- [ ] Sem conexão, tentar login → mensagem de falha de conexão.
- [ ] Repetir a operação rapidamente → botão fica desabilitado durante o envio.

## 7. Problemas comuns

| Sintoma | Verificação |
|---------|-------------|
| App não abre | Confirmar `app.json` com `web.bundler: "metro"` e dependências web instaladas |
| Erro de configuração do Firebase | Confirmar se `Carrinho/.env` existe e contém todas as chaves |
| Sessão não persiste | Confirmar uso de `getReactNativePersistence(AsyncStorage)` |
| Erro de inicialização duplicada | O `fireBase.ts` deve reutilizar a instância existente |
| Mensagens em inglês | Confirmar se o mapeamento em `Constants/mensagensErro.ts` está sendo usado |
