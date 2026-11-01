# Data Model: Autenticação de Usuário

**Feature**: `001-autenticacao-usuario` | **Date**: 2026-10-31

## Entidades

### Conta de Usuário

Representa o usuário cadastrado no Firebase Authentication.

| Campo | Tipo | Obrigatório | Origem | Descrição |
|-------|------|-------------|--------|-----------|
| `uid` | `string` | Sim | Firebase | Identificador único da conta |
| `email` | `string` | Sim | Firebase | E-mail normalizado (sem espaços nas extremidades) |
| `criadaEm` | `string` (ISO) | Não | Firebase | Data de criação, quando disponível |

**Regras**:
- O `uid` é gerado pelo Firebase e não pode ser alterado pelo app.
- O e-mail é o único identificador de login.
- A senha nunca faz parte da Conta armazenada no app.

### Credenciais

Dados transitórios informados nas telas de login e cadastro.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `email` | `string` | Sim | E-mail digitado pelo usuário |
| `senha` | `string` | Sim | Senha digitada pelo usuário |

**Regras**:
- Existem apenas em memória durante a operação.
- Não são persistidas em texto puro.
- O e-mail é aparado (`trim`) e comparado sem diferenciar maiúsculas/minúsculas.

### Sessão

Representa o estado de autenticação atual do aplicativo.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `estado` | `restaurando` \| `autenticado` \| `nao_autenticado` | Estado atual da sessão |
| `usuario` | `Conta \| null` | Conta autenticada, quando houver |

**Regras**:
- Enquanto `estado = restaurando`, as telas de autenticação não devem ser exibidas.
- `estado = autenticado` exige `usuario` preenchido.
- `estado = nao_autenticado` exige `usuario = null`.

### Erro de Autenticação

Representa uma falha compreensível para o usuário.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `codigo` | `string` | Código original do Firebase ou código interno de validação |
| `mensagem` | `string` | Mensagem em português exibida ao usuário |

## Relacionamentos

```text
Conta de Usuário 1 ─── 0..1 Sessão
Credenciais      1 ─── 0..1 Conta (após cadastro/login bem-sucedido)
Sessão           1 ─── 0..1 Erro de Autenticação (em caso de falha)
```

- Uma conta pode existir sem sessão ativa.
- Uma sessão ativa sempre referencia uma conta.
- Credenciais não são armazenadas; após a operação, apenas a conta/sessão permanece.

## Regras de validação

| Regra | Campo | Condição | Mensagem |
|-------|-------|----------|----------|
| RV-001 | E-mail | Vazio | Preencha todos os campos. |
| RV-002 | Senha | Vazia | Preencha todos os campos. |
| RV-003 | E-mail | Formato inválido | Informe um e-mail válido. |
| RV-004 | Senha | Menos de 6 caracteres | A senha deve ter pelo menos 6 caracteres. |
| RV-005 | Confirmação de senha | Diferente da senha | As senhas não coincidem. |
| RV-006 | E-mail | Já cadastrado | Este e-mail já está cadastrado. |
| RV-007 | Credenciais | Incorretas | E-mail ou senha incorretos. |
| RV-008 | Conexão | Falha de rede | Não foi possível conectar. Verifique sua internet e tente novamente. |

## Transições de estado

```text
[inicial]
   │
   ▼
[restaurando] ── sessão salva válida ──▶ [autenticado]
   │
   └── sem sessão / sessão inválida ──▶ [nao_autenticado]
                                                │
                                                │ cadastro ou login com sucesso
                                                ▼
                                         [autenticado]
                                                │
                                                │ logout ou sessão invalidada
                                                ▼
                                         [nao_autenticado]
```

| De | Evento | Para | Efeito |
|----|--------|------|--------|
| `restaurando` | Sessão salva válida | `autenticado` | Exibe a área principal |
| `restaurando` | Sem sessão ou sessão inválida | `nao_autenticado` | Exibe Login/Cadastro |
| `nao_autenticado` | Cadastro com sucesso | `autenticado` | Exibe a área principal |
| `nao_autenticado` | Login com sucesso | `autenticado` | Exibe a área principal |
| `autenticado` | Logout | `nao_autenticado` | Retorna à autenticação e bloqueia telas internas |
| `autenticado` | Sessão invalidada | `nao_autenticado` | Retorna à autenticação |

## Observações de implementação

- A Conta será derivada do objeto `User` do Firebase, sem criar uma cópia persistida
  separada.
- O estado da Sessão será mantido no `AuthContext` e atualizado por
  `onAuthStateChanged`.
- As Credenciais nunca serão gravadas no `AsyncStorage`; apenas o SDK do Firebase
  gerencia o token de sessão.
