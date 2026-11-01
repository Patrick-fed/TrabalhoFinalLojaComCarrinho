# Implementation Plan: Autenticação de Usuário

**Branch**: `001-autenticacao-usuario` | **Date**: 2026-10-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-autenticacao-usuario/spec.md`

## Summary

Implementar cadastro, login, logout, sessão persistente e proteção de telas usando
Firebase Authentication. O app será executado como projeto Expo com TypeScript dentro
de `Carrinho/` e navegação com React Navigation. A área principal será uma tela
provisória até a especificação do catálogo.

O plano também inclui uma limpeza opcional do versionamento de `Carrinho/node_modules`,
necessária para evitar commits gigantes ao instalar as dependências do Expo.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Expo SDK (versão estável atual), React Native, Firebase JS SDK
13.1.0 (já instalado), `@react-native-async-storage/async-storage`,
`@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`,
`react-native-safe-area-context`, `react-dom`, `react-native-web`,
`@expo/metro-runtime`
**Storage**: Firebase Authentication + AsyncStorage para persistência da sessão
**Testing**: Sem framework automatizado nesta etapa; `npx tsc --noEmit` e roteiro manual
no navegador
**Target Platform**: Web via `npx expo start --web` (principal); Android/iOS via Expo Go
(compatível)
**Project Type**: mobile-app (Expo managed)
**Performance Goals**: Feedback de carregamento imediato; conclusão das operações conforme
a rede e o Firebase
**Constraints**: Apenas autenticação; sem recuperação de senha, verificação de e-mail ou
login social; sem transação financeira real; preservar a estrutura existente
**Scale/Scope**: Protótipo acadêmico; 4 telas (Login, Cadastro, Home provisória e
Carregando)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Status |
|-----------|-------------|--------|
| I. Simplicidade e Clareza | Context + Service + telas, sem Redux ou abstrações extras | PASSA |
| II. Tecnologias e Dependências | Expo, React Native e TypeScript; novas dependências justificadas em `research.md` | PASSA |
| III. SOLID | Serviço de autenticação, contexto de sessão, navegação e componentes separados | PASSA |
| IV. Componentes Reutilizáveis | `CampoTexto`, `BotaoPrincipal` e `MensagemErro` reutilizados nas telas | PASSA |
| V. TypeScript e Tipagem | Tipos para credenciais, sessão e navegação; sem `any` | PASSA |
| VI. Organização e Responsabilidades | Chamadas ao Firebase centralizadas em `Service/auth.ts` | PASSA |
| VII. Preservação do Código Existente | `Config/`, `Service/` e `Types/` mantidos e aproveitados | PASSA |
| VIII. Desenvolvimento por Etapas | Implementação dividida em fases pequenas | PASSA |
| IX. Requisitos do Trabalho | Cobre FR-001 a FR-017 da especificação | PASSA |
| X. Sem Funcionalidades Desnecessárias | Sem recuperação de senha, verificação ou login social | PASSA |
| XI. Interface e Estilos | Paleta azul centralizada em `Constants/cores.ts` | PASSA |
| XII. Aprendizado e Compreensão | Fluxo simples e explicável pelos integrantes | PASSA |

Nenhuma violação identificada. A seção `Complexity Tracking` permanece vazia.

## Project Structure

### Documentation (this feature)

```text
specs/001-autenticacao-usuario/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── auth-service.md
│   └── navigation.md
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
Carrinho/
├── App.tsx
├── app.json
├── tsconfig.json
├── babel.config.js
├── .env                    # credenciais locais (não versionado)
├── .env.example
├── Config/
│   ├── fireBase.ts         # initializeApp + initializeAuth + persistência
│   └── fireBaseConfig.ts   # leitura de EXPO_PUBLIC_FIREBASE_*
├── Service/
│   ├── auth.ts             # cadastrar, entrar, sair, observar sessão
│   └── rotas.ts            # existente, sem alteração nesta etapa
├── Types/
│   ├── auth.ts             # Credenciais, Conta, ErroAutenticacao
│   ├── navigation.ts       # AuthStackParamList, AppStackParamList
│   └── types.ts            # existente
├── Constants/
│   ├── cores.ts            # paleta azul
│   └── mensagensErro.ts    # códigos Firebase → mensagens em português
├── Context/
│   └── AuthContext.tsx     # estado global de sessão
├── Navigation/
│   └── AppNavigator.tsx    # pilhas condicionais autenticado/não autenticado
├── Components/
│   ├── CampoTexto.tsx
│   ├── BotaoPrincipal.tsx
│   └── MensagemErro.tsx
├── Screens/
│   ├── LoginScreen.tsx
│   ├── CadastroScreen.tsx
│   ├── HomeScreen.tsx      # provisória, com botão Sair
│   └── CarregandoScreen.tsx
└── Utils/
    └── validacoes.ts       # e-mail, senha e campos obrigatórios
```

**Structure Decision**: O app Expo será criado dentro de `Carrinho/`, pois é onde já
existem `package.json`, `Config/`, `Service/` e `Types/`. A estrutura existente será
preservada e apenas complementada.

## Implementation Phases

### Phase 1: Fundação do projeto Expo

1. Criar um projeto Expo `blank-typescript` em pasta temporária e copiar para
   `Carrinho/` os arquivos de configuração (`App.tsx` inicial, `app.json`,
   `tsconfig.json`, `babel.config.js` e `assets/`).
2. Mesclar as dependências geradas no `package.json` existente, preservando
   `firebase`.
3. Remover `Carrinho/node_modules` do controle de versão:
   `git rm -r --cached Carrinho/node_modules`.
4. Adicionar ao `.gitignore`: `Carrinho/node_modules/`, `Carrinho/.expo/`,
   `Carrinho/.env`, `Carrinho/web-build/` e `Carrinho/dist/`.
5. Instalar dependências com `npm install`.
6. Instalar suporte web e navegação:
   `npx expo install react-dom react-native-web @expo/metro-runtime @react-native-async-storage/async-storage @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context`.
7. Configurar `app.json` para `web.bundler: "metro"`.

### Phase 2: Firebase e serviços

1. Criar `Carrinho/.env.example` com as chaves `EXPO_PUBLIC_FIREBASE_*`.
2. Implementar `Config/fireBaseConfig.ts` lendo as variáveis de ambiente.
3. Implementar `Config/fireBase.ts` com `initializeApp` e `initializeAuth`, usando
   `getReactNativePersistence(AsyncStorage)`. Envolver em `try/catch` para evitar erro
   de inicialização duplicada no hot reload.
4. Criar `Types/auth.ts`, `Constants/mensagensErro.ts` e `Utils/validacoes.ts`.
5. Implementar `Service/auth.ts` com cadastro, login, logout e observação da sessão,
   traduzindo erros do Firebase para português.

### Phase 3: Sessão e navegação

1. Implementar `Context/AuthContext.tsx` com `usuario`, `carregando`, `entrar`,
   `cadastrar` e `sair`.
2. Implementar `Navigation/AppNavigator.tsx`:
   - `carregando` → `CarregandoScreen`;
   - `usuario` → pilha da loja (`HomeScreen`);
   - sem usuário → pilha de autenticação (`LoginScreen` e `CadastroScreen`).
3. Implementar `Types/navigation.ts`.

### Phase 4: Interface

1. Criar `Constants/cores.ts` com a paleta azul.
2. Criar `Components/CampoTexto.tsx`, `BotaoPrincipal.tsx` e `MensagemErro.tsx`.
3. Implementar `LoginScreen`: validação, estado de envio, mensagens de erro e link para
   cadastro.
4. Implementar `CadastroScreen`: validação, confirmação de senha, estado de envio,
   mensagens de erro e link para login.
5. Implementar `HomeScreen` provisória com identificação do usuário e botão `Sair`.
6. Implementar `CarregandoScreen` com indicador visual.

### Phase 5: Validação

1. Executar `npx tsc --noEmit` dentro de `Carrinho/`.
2. Executar `npx expo start --web` e percorrer o roteiro do `quickstart.md`.
3. Confirmar:
   - cadastro com e-mail válido e senha ≥ 6;
   - mensagens para e-mail inválido, senha fraca, e-mail já cadastrado e campos vazios;
   - login com credenciais corretas e incorretas;
   - sessão mantida após recarregar a página;
   - logout e bloqueio das telas internas;
   - ausência de `any` e de chamadas Firebase fora de `Service/auth.ts`.

## Risks & Mitigations

| Risco | Mitigação |
|-------|-----------|
| `Config/` vazio e credenciais ausentes | Preencher `Carrinho/.env` conforme `quickstart.md`; app exibe erro claro se faltar configuração |
| `node_modules` versionado | Remover do índice do Git e adicionar ao `.gitignore` na Phase 1 |
| Persistência no web | Usar `getReactNativePersistence(AsyncStorage)` com Metro; se houver problema, usar `browserLocalPersistence` na web |
| Hot reload recriando Firebase | `try/catch` em `initializeAuth` e reutilização da instância existente |
| Firebase com proteção de enumeração de e-mail | Mapear `auth/invalid-credential`, `auth/user-not-found` e `auth/wrong-password` para a mesma mensagem |
| Chave `EXPO_PUBLIC_*` visível no bundle | Documentar que a segurança depende das regras do Firebase; não usar segredos de servidor |

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Nenhuma | - | - |

## Implementation Status (2026-10-31)

**Status**: Fases 1 a 7 implementadas e validadas. A integração da API principal de
produtos foi adiada por decisão do usuário e não faz parte desta feature.

### Desvios registrados

- O template `blank-typescript` do Expo SDK 58 não gera `babel.config.js`; o arquivo
  não foi criado por não ser necessário no SDK atual.
- O template gera `index.ts` como ponto de entrada; ele foi copiado junto com `App.tsx`.
- O build web do Firebase 13.1.0 não exporta `getReactNativePersistence`; por isso foi
  adicionado `Config/fireBase.web.ts`, que usa `getAuth` com a persistência local do
  navegador. `Config/fireBase.ts` mantém `initializeAuth` +
  `getReactNativePersistence(AsyncStorage)` para Android/iOS.
- `Types/firebase-auth.d.ts` foi adicionado para declarar `getReactNativePersistence`
  nos tipos públicos do Firebase 13, que não o expõem em `auth-public.d.ts`.
- `env.d.ts` foi adicionado para referenciar os tipos de ambiente do Expo.
- `Utils/erros.ts` foi adicionado para extrair a mensagem de `ErroAutenticacao` de forma
  reutilizável pelas telas.
- Dependências instaladas: Expo SDK 58, React 19.3.0, React Native 0.88.1 e TypeScript
  6.0.3.
- `Carrinho/node_modules` foi removido do índice do Git e passou a ser ignorado; o
  `.gitignore` foi criado com os padrões do Expo, ambiente e build.

### Validação executada

- `npx tsc --noEmit`: sem erros.
- `npx expo export -p web` com o `Carrinho/.env` real: bundle web gerado com sucesso.
- `npx expo export -p android` com variáveis de ambiente fictícias: bundle Android gerado
  com sucesso, confirmando a resolução de `getReactNativePersistence` no build nativo.
- `npx expo-doctor`: 20/20 verificações aprovadas.
- `npx expo start --web` + Playwright: 20/20 cenários do `quickstart.md` aprovados —
  validações de formulário, cadastro, login, sessão após reload, logout, bloqueio da Home,
  e-mail duplicado, senha incorreta e falha de conexão. A conta de teste foi removida do
  Firebase ao final.
