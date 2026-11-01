# Research: Autenticação de Usuário

**Feature**: `001-autenticacao-usuario` | **Date**: 2026-10-31

Este documento registra as decisões técnicas para implementar a autenticação sem
contrariar a constituição do projeto.

## D-001: Local do projeto Expo

**Decision**: Criar o app Expo dentro de `Carrinho/`, reaproveitando o `package.json`,
`Config/`, `Service/` e `Types/` existentes.

**Rationale**: O projeto já possui a dependência `firebase` e os arquivos de
configuração, serviço e tipos nessa pasta. Criar o app em outro lugar exigiria mover
arquivos e aumentaria o risco de quebrar a estrutura definida no trabalho.

**Alternatives considered**:
- Raiz do repositório: exigiria mover `Carrinho/` ou tratar a pasta como código-fonte
  separado, contrariando a preservação da estrutura existente.
- Novo diretório `app/`: duplicaria configurações e deixaria `Carrinho/` sem uso.

## D-002: SDK de autenticação

**Decision**: Usar o Firebase JS SDK já instalado (`firebase@13.1.0`).

**Rationale**: É a dependência que o projeto já possui, funciona no Expo Go e no Expo
Web, e atende ao requisito de autenticação por e-mail e senha. Não exige `expo-dev-client`
nem prebuild nativo.

**Alternatives considered**:
- React Native Firebase (`@react-native-firebase/auth`): exige código nativo,
  `expo-dev-client` e configuração de build; complexidade desnecessária para o escopo.
- Solução de autenticação própria: contraria o requisito de usar Firebase Authentication.

## D-003: Persistência da sessão

**Decision**: Inicializar o Firebase Auth com `initializeAuth` e
`getReactNativePersistence(AsyncStorage)`.

**Rationale**: No React Native/Expo, o Firebase JS SDK usa persistência em memória por
padrão, o que encerraria a sessão ao fechar o app. O `AsyncStorage` mantém a sessão
entre aberturas e funciona no Expo Web com bundler Metro.

**Alternatives considered**:
- `getAuth(app)` sem persistência: a sessão seria perdida ao fechar/reabrir.
- `browserLocalPersistence` apenas: não funciona em Android/iOS; pode ser usado como
  fallback específico para web se necessário.
- Armazenar tokens manualmente: aumentaria a complexidade e o risco de segurança.

**Reference**: documentação do Firebase Auth e guia do Expo sobre Firebase JS SDK.

## D-004: Navegação

**Decision**: Usar `@react-navigation/native` com `@react-navigation/native-stack`.

**Rationale**: Permite separar a pilha de autenticação da pilha principal e prepara o
projeto para as próximas telas (catálogo, detalhes, carrinho e pagamento). A troca de
pilha é feita pelo estado de autenticação, o que também protege as telas internas.

**Alternatives considered**:
- Renderização condicional simples: atenderia só à autenticação, mas exigiria
  retrabalho quando as demais telas forem implementadas.
- Expo Router: adiciona estrutura baseada em arquivos e mais dependências; o projeto
  já tem organização manual por pastas.

## D-005: Proteção das telas

**Decision**: O `AppNavigator` renderiza pilhas diferentes conforme o estado do
`AuthContext`: carregando, autenticado ou não autenticado.

**Rationale**: Usuários não autenticados nunca recebem acesso à pilha interna. Após o
logout, a pilha de autenticação substitui a pilha principal, impedindo o retorno por
navegação.

**Alternatives considered**:
- Verificação manual em cada tela: repetitiva e sujeita a esquecimento.
- Redirecionamento por evento: mais complexo e menos previsível.

## D-006: Estado de autenticação

**Decision**: Criar `Context/AuthContext.tsx` com `usuario`, `carregando`, `entrar`,
`cadastrar` e `sair`, alimentado por `onAuthStateChanged`.

**Rationale**: Mantém o estado de sessão em um único lugar, evita duplicação nas telas e
torna explícito o fluxo de restauração da sessão.

**Alternatives considered**:
- Estado local em cada tela: não compartilharia a sessão e duplicaria lógica.
- Redux/Zustand: excesso de complexidade para uma única funcionalidade.

## D-007: Serviço de autenticação

**Decision**: Centralizar as chamadas ao Firebase em `Service/auth.ts` e manter as
telas responsáveis apenas por formulário, validação e feedback.

**Rationale**: Atende ao princípio de organização e responsabilidades da constituição.

**Alternatives considered**:
- Chamar `createUserWithEmailAndPassword` e `signInWithEmailAndPassword` diretamente
  nas telas: espalharia regras e dificultaria manutenção.

## D-008: Mensagens de erro

**Decision**: Mapear códigos do Firebase para português em
`Constants/mensagensErro.ts`.

**Rationale**: O requisito pede mensagens compreensíveis e específicas para e-mail já
cadastrado, senha fraca e credenciais incorretas. Separar o mapa de mensagens evita
`if/else` extensos nas telas.

**Códigos previstos**:

| Código Firebase | Mensagem |
|-----------------|----------|
| `auth/email-already-in-use` | Este e-mail já está cadastrado. |
| `auth/weak-password` | A senha deve ter pelo menos 6 caracteres. |
| `auth/invalid-email` | Informe um e-mail válido. |
| `auth/invalid-credential` | E-mail ou senha incorretos. |
| `auth/user-not-found` | E-mail ou senha incorretos. |
| `auth/wrong-password` | E-mail ou senha incorretos. |
| `auth/network-request-failed` | Não foi possível conectar. Verifique sua internet e tente novamente. |
| `auth/too-many-requests` | Muitas tentativas. Tente novamente mais tarde. |
| Outros | Não foi possível concluir a operação. Tente novamente. |

**Alternatives considered**:
- Exibir `error.message` do Firebase: viria em inglês e com detalhes técnicos.
- Uma única mensagem genérica: não atenderia ao requisito de mensagens específicas.

## D-009: Validação de formulário

**Decision**: Criar funções simples em `Utils/validacoes.ts` para campos obrigatórios,
formato de e-mail e senha mínima de 6 caracteres.

**Rationale**: A validação é usada nas duas telas e não pertence à camada de serviço.
Mantém as telas mais limpas e permite testar manualmente cada regra.

**Alternatives considered**:
- Biblioteca de validação (Yup/Zod): dependência extra sem necessidade neste escopo.
- Validação apenas no Firebase: não cobre campos vazios e gera chamadas desnecessárias.

## D-010: Suporte ao Expo Web

**Decision**: Instalar `react-dom`, `react-native-web` e `@expo/metro-runtime`, e rodar
com `npx expo start --web`.

**Rationale**: O app é testado no navegador. O Expo Web exige essas dependências para
funcionar com Metro. A navegação e o Firebase JS SDK funcionam nessa plataforma.

**Alternatives considered**:
- Testar apenas em dispositivo físico: não corresponde à forma de teste adotada pela
  dupla.
- Usar React Native Web manualmente: mais configuração e sem benefício.

## D-011: Limpeza de `node_modules`

**Decision**: Remover `Carrinho/node_modules` do índice do Git
(`git rm -r --cached Carrinho/node_modules`) e adicionar a pasta ao `.gitignore`.

**Rationale**: Hoje o repositório versiona mais de 9.400 arquivos de dependências. A
instalação do Expo alteraria milhares deles, gerando commits enormes e difíceis de
revisar. A remoção do índice não apaga os arquivos do disco; apenas deixa de
versioná-los.

**Alternatives considered**:
- Manter versionado: commits gigantes e histórico poluído.
- Apagar a pasta e reinstalar: funciona, mas é desnecessário e mais lento.

## D-012: Estratégia de testes

**Decision**: Não adicionar framework de testes nesta etapa. Validar com
`npx tsc --noEmit` e um roteiro manual no navegador.

**Rationale**: O projeto é acadêmico, a especificação não exige testes automatizados e o
foco é o funcionamento correto do fluxo. A constituição pede verificação de
carregamento, erros e validações, o que será coberto pelo `quickstart.md`.

**Alternatives considered**:
- Jest + React Native Testing Library: dependências e configuração adicionais; pode ser
  introduzido depois se necessário.

## Unknowns resolvidos

| Desconhecido | Resolução |
|--------------|-----------|
| Onde criar o app Expo? | `Carrinho/` |
| Como persistir a sessão? | AsyncStorage + `getReactNativePersistence` |
| Como proteger telas? | Pilhas condicionais no `AppNavigator` |
| Como testar no navegador? | Expo Web com Metro (`npx expo start --web`) |
| Onde ficam as credenciais? | `Carrinho/.env` com variáveis `EXPO_PUBLIC_FIREBASE_*` |
| Como lidar com `node_modules` versionado? | Remover do índice e ignorar |
