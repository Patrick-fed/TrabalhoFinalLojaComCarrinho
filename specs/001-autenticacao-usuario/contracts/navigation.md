# Contract: Navegação e Proteção de Telas

**Feature**: `001-autenticacao-usuario` | **Date**: 2026-10-31
**Arquivos previstos**: `Carrinho/Navigation/AppNavigator.tsx` e
`Carrinho/Types/navigation.ts`

## Tipos de navegação

```ts
export type AuthStackParamList = {
  Login: undefined;
  Cadastro: undefined;
};

export type AppStackParamList = {
  Home: undefined;
};
```

## Estrutura de navegação

```text
AppNavigator
├── carregando = true
│   └── CarregandoScreen
├── usuario != null
│   └── AppStack
│       └── HomeScreen
└── usuario == null
    └── AuthStack
        ├── LoginScreen
        └── CadastroScreen
```

## Regras de proteção

| Condição | Resultado |
|----------|-----------|
| Sessão em restauração | Exibir apenas `CarregandoScreen` |
| Usuário autenticado | Exibir apenas a pilha da loja (`HomeScreen`) |
| Usuário não autenticado | Exibir apenas a pilha de autenticação |
| Logout | Trocar para a pilha de autenticação e descartar a pilha da loja |
| Tentativa de voltar após logout | Não deve encontrar telas da loja no histórico |

## Navegação entre telas de autenticação

| Origem | Ação | Destino |
|--------|------|---------|
| `LoginScreen` | Toque em "Criar conta" | `CadastroScreen` |
| `CadastroScreen` | Toque em "Já tenho conta" | `LoginScreen` |
| Login/cadastro com sucesso | Estado do `AuthContext` muda | `HomeScreen` automaticamente |
| `HomeScreen` | Toque em "Sair" | `LoginScreen` automaticamente |

## Estados de interface

| Tela | Estado | Comportamento |
|------|--------|---------------|
| Login | Enviando | Botão desabilitado com indicador de carregamento |
| Login | Erro | Mensagem em português acima do formulário |
| Cadastro | Enviando | Botão desabilitado com indicador de carregamento |
| Cadastro | Erro | Mensagem em português acima do formulário |
| Home | Autenticado | Exibe e-mail do usuário e botão "Sair" |
| Carregando | Restaurando sessão | Indicador visual centralizado |

## Restrições

- O `AppNavigator` não deve chamar o Firebase diretamente.
- A decisão de qual pilha exibir deve vir exclusivamente do `AuthContext`.
- Nenhuma tela interna deve ser registrada na pilha de autenticação.
- As telas não devem navegar manualmente após login/logout; a troca de pilha é
  consequência do estado de autenticação.
