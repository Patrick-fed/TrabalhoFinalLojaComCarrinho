# Contract: Serviço de Autenticação

**Feature**: `001-autenticacao-usuario` | **Date**: 2026-10-31
**Arquivo previsto**: `Carrinho/Service/auth.ts`

Este contrato define as funções que as telas e o contexto usam. As chamadas ao Firebase
ficam restritas a este serviço.

## Tipos

```ts
export type Credenciais = {
  email: string;
  senha: string;
};

export type Conta = {
  uid: string;
  email: string | null;
};

export type ErroAutenticacao = {
  codigo: string;
  mensagem: string;
};
```

## Funções

### `cadastrarUsuario`

```ts
export async function cadastrarUsuario(
  credenciais: Credenciais
): Promise<Conta>;
```

**Comportamento**:
- Remove espaços das extremidades do e-mail.
- Chama `createUserWithEmailAndPassword`.
- Retorna a conta criada.
- Em caso de falha, lança um `ErroAutenticacao` com `codigo` e `mensagem` em português.

**Erros esperados**:
- `auth/email-already-in-use`
- `auth/weak-password`
- `auth/invalid-email`
- `auth/network-request-failed`
- `auth/too-many-requests`

### `entrar`

```ts
export async function entrar(
  credenciais: Credenciais
): Promise<Conta>;
```

**Comportamento**:
- Remove espaços das extremidades do e-mail.
- Chama `signInWithEmailAndPassword`.
- Retorna a conta autenticada.
- Em caso de falha, lança um `ErroAutenticacao` com mensagem em português.

**Erros esperados**:
- `auth/invalid-credential`
- `auth/user-not-found`
- `auth/wrong-password`
- `auth/invalid-email`
- `auth/network-request-failed`
- `auth/too-many-requests`

### `sair`

```ts
export async function sair(): Promise<void>;
```

**Comportamento**:
- Chama `signOut(auth)`.
- Não retorna valor.
- Em caso de falha, lança `ErroAutenticacao`.

### `observarSessao`

```ts
export function observarSessao(
  callback: (usuario: Conta | null) => void
): () => void;
```

**Comportamento**:
- Registra `onAuthStateChanged`.
- Converte o `User` do Firebase para `Conta` ou `null`.
- Retorna a função de cancelamento do listener.

## Contrato de erros

Toda falha lançada pelo serviço deve ter o formato:

```ts
{
  codigo: string;
  mensagem: string;
}
```

As mensagens são definidas em `Carrinho/Constants/mensagensErro.ts` e devem estar em
português. Erros desconhecidos usam:

> Não foi possível concluir a operação. Tente novamente.

## Restrições

- O serviço não deve exibir `Alert`, navegar ou manipular estado de tela.
- O serviço não deve receber parâmetros adicionais além de `Credenciais`.
- Nenhuma senha deve ser registrada em log ou armazenada.
