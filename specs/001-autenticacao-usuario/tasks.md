# Tasks: Autenticação de Usuário

**Input**: Design documents from `/specs/001-autenticacao-usuario/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Tests**: Nenhum teste automatizado foi solicitado. As tarefas de validação manual
estão incluídas com base no `quickstart.md`.

**Organization**: Tarefas agrupadas por história de usuário para permitir implementação
e validação independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências pendentes)
- **[Story]**: História de usuário relacionada (US1, US2, US3, US4)
- Todos os caminhos são relativos à raiz do repositório

## Path Conventions

- App Expo: `Carrinho/`
- Documentação: `specs/001-autenticacao-usuario/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Transformar `Carrinho/` em um app Expo TypeScript executável na web.

- [X] T001 Criar app Expo `blank-typescript` em pasta temporária e copiar `App.tsx`, `app.json`, `tsconfig.json`, `babel.config.js` e `assets/` para `Carrinho/`
- [X] T002 Mesclar as dependências geradas no `Carrinho/package.json`, preservando `firebase`
- [X] T003 Remover `Carrinho/node_modules` do índice do Git com `git rm -r --cached Carrinho/node_modules` e adicionar `Carrinho/node_modules/`, `Carrinho/.expo/`, `Carrinho/.env`, `Carrinho/web-build/` e `Carrinho/dist/` ao `.gitignore`
- [X] T004 Executar `npm install` em `Carrinho/`
- [X] T005 Instalar dependências web e de navegação em `Carrinho/` com `npx expo install react-dom react-native-web @expo/metro-runtime @react-native-async-storage/async-storage @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context`
- [X] T006 Configurar `Carrinho/app.json` com `web.bundler: "metro"` e metadados do app
- [X] T007 Criar `Carrinho/.env.example` com as chaves `EXPO_PUBLIC_FIREBASE_*`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base compartilhada por todas as histórias. Nenhuma história começa antes
desta fase.

- [X] T008 Criar `Carrinho/Types/auth.ts` com `Credenciais`, `Conta` e `ErroAutenticacao`
- [X] T009 [P] Criar `Carrinho/Types/navigation.ts` com `AuthStackParamList` e `AppStackParamList`
- [X] T010 [P] Criar `Carrinho/Constants/mensagensErro.ts` com o mapa de códigos Firebase para português
- [X] T011 [P] Criar `Carrinho/Constants/cores.ts` com a paleta azul
- [X] T012 Criar `Carrinho/Config/fireBaseConfig.ts` lendo `EXPO_PUBLIC_FIREBASE_*` e validando as chaves obrigatórias
- [X] T013 Criar `Carrinho/Config/fireBase.ts` com `initializeApp`, `initializeAuth` e `getReactNativePersistence(AsyncStorage)`, reutilizando a instância em hot reload
- [X] T014 Criar `Carrinho/Service/auth.ts` com `cadastrarUsuario`, `entrar`, `sair` e `observarSessao`, usando o mapa de mensagens
- [X] T015 Criar `Carrinho/Utils/validacoes.ts` com validação de campos obrigatórios, e-mail, senha e confirmação
- [X] T016 Criar `Carrinho/Context/AuthContext.tsx` com `usuario`, `entrar`, `cadastrar` e `sair` (sem restauração de sessão ainda)
- [X] T017 Criar `Carrinho/Components/CampoTexto.tsx` com label, erro, `secureTextEntry` e tipos de teclado
- [X] T018 [P] Criar `Carrinho/Components/BotaoPrincipal.tsx` com estado de carregamento e desabilitado
- [X] T019 [P] Criar `Carrinho/Components/MensagemErro.tsx` para mensagens em português
- [X] T020 [P] Criar `Carrinho/Screens/LoginScreen.tsx` como stub navegável
- [X] T021 [P] Criar `Carrinho/Screens/CadastroScreen.tsx` como stub navegável
- [X] T022 [P] Criar `Carrinho/Screens/HomeScreen.tsx` como stub autenticado
- [X] T023 Criar `Carrinho/Navigation/AppNavigator.tsx` com pilhas condicionais baseadas em `usuario` (sem estado de carregamento)
- [X] T024 Substituir `Carrinho/App.tsx` para usar `AuthProvider`, `NavigationContainer` e `AppNavigator`

**Checkpoint**: App compila, navega entre stubs e a base está pronta para as histórias.

---

## Phase 3: User Story 1 - Criar conta e acessar a loja (Priority: P1) 🎯 MVP

**Goal**: Permitir que um visitante crie uma conta e chegue à Home autenticado.

**Independent Test**: Criar uma conta válida e verificar o redirecionamento para a Home;
testar campos vazios, e-mail inválido, senha fraca, confirmação diferente e e-mail
duplicado.

- [X] T025 [US1] Implementar estado do formulário e validação de e-mail, senha e confirmação em `Carrinho/Screens/CadastroScreen.tsx`
- [X] T026 [US1] Integrar `cadastrar` do `AuthContext` em `Carrinho/Screens/CadastroScreen.tsx` com loading, botão desabilitado e mensagens de erro em português
- [X] T027 [US1] Adicionar link "Já tenho conta" para a rota `Login` em `Carrinho/Screens/CadastroScreen.tsx`
- [X] T028 [US1] Aplicar estilos da paleta azul em `Carrinho/Screens/CadastroScreen.tsx`
- [X] T029 [US1] Validar manualmente os cenários de cadastro do `quickstart.md`

**Checkpoint**: Cadastro funcional e testável isoladamente.

---

## Phase 4: User Story 2 - Entrar com credenciais existentes (Priority: P2)

**Goal**: Permitir que um usuário cadastrado faça login e chegue à Home.

**Independent Test**: Entrar com uma conta existente e verificar a Home; testar senha
incorreta, e-mail inexistente e campos vazios.

- [X] T030 [US2] Implementar estado do formulário e validação de e-mail e senha em `Carrinho/Screens/LoginScreen.tsx`
- [X] T031 [US2] Integrar `entrar` do `AuthContext` em `Carrinho/Screens/LoginScreen.tsx` com loading, botão desabilitado e mensagens de erro em português
- [X] T032 [US2] Adicionar link "Criar conta" para a rota `Cadastro` em `Carrinho/Screens/LoginScreen.tsx`
- [X] T033 [US2] Aplicar estilos da paleta azul em `Carrinho/Screens/LoginScreen.tsx`
- [X] T034 [US2] Validar manualmente os cenários de login do `quickstart.md`

**Checkpoint**: Login funcional e testável isoladamente.

---

## Phase 5: User Story 3 - Manter sessão e proteger telas internas (Priority: P3)

**Goal**: Manter o usuário autenticado após recarregar o app e impedir acesso sem sessão.

**Independent Test**: Autenticar, recarregar a página e confirmar que continua logado;
sem sessão, tentar acessar a Home e confirmar o bloqueio; observar o carregamento
inicial.

- [X] T035 [US3] Criar `Carrinho/Screens/CarregandoScreen.tsx` com indicador visual centralizado
- [X] T036 [US3] Adicionar o estado `carregando` e o branch `CarregandoScreen` em `Carrinho/Navigation/AppNavigator.tsx`
- [X] T037 [US3] Adicionar `carregando` ao `Carrinho/Context/AuthContext.tsx` e inscrever `observarSessao` para restaurar a sessão salva
- [X] T038 [US3] Tratar sessão nula ou inválida em `Carrinho/Context/AuthContext.tsx`, definindo `usuario = null` e `carregando = false`
- [X] T039 [US3] Revisar `Carrinho/Navigation/AppNavigator.tsx` para garantir que a pilha `Home` só exista quando `usuario != null`
- [X] T040 [US3] Validar manualmente restauração de sessão, carregamento inicial e bloqueio sem autenticação

**Checkpoint**: Sessão persistente e telas protegidas.

---

## Phase 6: User Story 4 - Sair da conta (Priority: P4)

**Goal**: Encerrar a sessão e impedir o retorno às telas internas.

**Independent Test**: Autenticar, tocar em "Sair" e verificar o retorno à autenticação;
tentar voltar e confirmar o bloqueio.

- [X] T041 [US4] Implementar `Carrinho/Screens/HomeScreen.tsx` provisória com e-mail do usuário e botão "Sair"
- [X] T042 [US4] Integrar `sair` do `AuthContext` em `Carrinho/Screens/HomeScreen.tsx` com loading e botão desabilitado
- [X] T043 [US4] Garantir que o logout troque para a pilha de autenticação e não permita voltar para `Home` em `Carrinho/Navigation/AppNavigator.tsx`
- [X] T044 [US4] Validar manualmente logout, retorno à autenticação e bloqueio da Home após sair

**Checkpoint**: Logout funcional e telas internas inacessíveis após sair.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T045 Executar `npx tsc --noEmit` em `Carrinho/` e corrigir erros de tipagem
- [X] T046 Executar `npx expo start --web` e percorrer o roteiro completo de `specs/001-autenticacao-usuario/quickstart.md`
- [X] T047 Revisar o código para garantir ausência de `any`, mensagens em português e chamadas Firebase restritas a `Carrinho/Service/auth.ts`
- [X] T048 Registrar no `specs/001-autenticacao-usuario/plan.md` qualquer desvio de implementação e atualizar `AGENTS.md` se necessário

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende da Phase 1; bloqueia todas as histórias.
- **US1 (Phase 3)**: depende da Phase 2.
- **US2 (Phase 4)**: depende da Phase 2; pode ser implementada em paralelo com US1.
- **US3 (Phase 5)**: depende da Phase 2; implementação pode rodar em paralelo com US1/US2, mas a validação manual depende de ao menos um fluxo de login/cadastro.
- **US4 (Phase 6)**: depende da Phase 2 e da Home stub; validação depende de US2.
- **Polish (Phase 7)**: depende de todas as histórias desejadas.

### Within Each User Story

- Validação local antes da integração com o contexto.
- Integração com `Service/auth.ts` e `AuthContext`.
- Estilos antes da validação manual.
- Validação manual antes de considerar a história concluída.

### Parallel Opportunities

- T009, T010 e T011 podem rodar em paralelo.
- T018 e T019 podem rodar em paralelo.
- T020, T021 e T022 podem rodar em paralelo.
- US1 e US2 podem ser implementadas em paralelo após a Phase 2.
- US3 e US4 podem ser implementadas em paralelo após a Phase 2, desde que a validação
  final aguarde US1/US2.

---

## Parallel Example: User Story 1 and User Story 2

```text
Task: "T025 [US1] Implementar formulário de cadastro em Carrinho/Screens/CadastroScreen.tsx"
Task: "T030 [US2] Implementar formulário de login em Carrinho/Screens/LoginScreen.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Concluir Phase 1 (Setup).
2. Concluir Phase 2 (Foundational).
3. Concluir Phase 3 (US1 - Cadastro).
4. Validar o cadastro isoladamente.
5. Demonstrar o MVP.

### Incremental Delivery

1. Setup + Foundational.
2. US1 → validar cadastro.
3. US2 → validar login.
4. US3 → validar sessão e proteção.
5. US4 → validar logout.
6. Polish → typecheck e roteiro completo.

---

## Notes

- Tarefas [P] usam arquivos diferentes e não dependem de tarefas incompletas.
- O rótulo [USx] existe apenas nas fases de histórias.
- As validações manuais seguem o `quickstart.md`.
- Nenhum teste automatizado será adicionado nesta etapa.
- T029, T034, T040, T044 e T046 foram validadas em 2026-10-31 via navegador
  automatizado (Playwright), percorrendo o roteiro do `quickstart.md`. A conta de teste
  foi removida do Firebase após a validação.
