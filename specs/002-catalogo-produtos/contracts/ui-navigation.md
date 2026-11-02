# Contract: Navegação e Interface

**Feature**: `002-catalogo-produtos` | **Date**: 2026-11-02
**Arquivos previstos**: `Carrinho/Types/navigation.ts`,
`Carrinho/Navigation/AppNavigator.tsx`, `Carrinho/Screens/CatalogoScreen.tsx`,
`Carrinho/Screens/DetalhesProdutoScreen.tsx`,
`Carrinho/Components/CartaoProduto.tsx` e
`Carrinho/Components/SeletorCategorias.tsx`

## Tipos de navegação

```ts
export type AppStackParamList = {
  Catalogo: undefined;
  DetalhesProduto: { produto: Produto };
};
```

## Estrutura de navegação

```text
AppNavigator
├── carregando = true
│   └── CarregandoScreen
├── usuario != null
│   └── AppStack
│       ├── CatalogoScreen
│       └── DetalhesProdutoScreen
└── usuario == null
    └── AuthStack
        ├── LoginScreen
        └── CadastroScreen
```

## Regras de navegação

| Origem | Ação | Destino | Observação |
|--------|------|---------|------------|
| Login/cadastro com sucesso | Estado do `AuthContext` muda | `CatalogoScreen` | Automático, sem navegação manual |
| Card de produto | Toque | `DetalhesProdutoScreen` | Envia `{ produto }` |
| Detalhes | Voltar | `CatalogoScreen` | Busca, categoria e posição da lista preservadas |
| Catálogo | "Sair" | `LoginScreen` | Troca de pilha via `AuthContext` |
| Toques repetidos no card | Segundo toque | Nenhum destino novo | Guarda de navegação impede telas duplicadas |

## Contrato dos componentes

### `CartaoProduto`

```ts
type CartaoProdutoProps = {
  produto: Produto;
  aoPressionar: (produto: Produto) => void;
  desabilitado?: boolean;
};
```

**Comportamento**:
- Exibe imagem, nome e preço formatado.
- A imagem usa `resizeMode="cover"` e `accessibilityLabel` com o nome do produto.
- Se a imagem falhar, exibe um placeholder visual e mantém nome/preço.
- Nome longo usa `numberOfLines` para não sobrepor o preço.
- É um `Pressable` com `accessibilityRole="button"` e rótulo que inclui nome e preço.
- Fica visualmente desabilitado quando `desabilitado` for `true`.

### `SeletorCategorias`

```ts
type SeletorCategoriasProps = {
  categorias: CategoriaDisponivel[];
  selecionada: Categoria | null;
  aoSelecionar: (categoria: Categoria | null) => void;
  carregando?: boolean;
  erro?: string | null;
  aoTentarNovamente?: () => void;
};
```

**Comportamento**:
- Renderiza um `ScrollView` horizontal.
- O primeiro chip é "Todas" e representa `null`.
- Cada chip usa `accessibilityRole="button"` e
  `accessibilityState={{ selected: ... }}`.
- A seleção é indicada por cor de fundo/borda, não apenas por texto.
- Com `carregando`, os chips ficam desabilitados.
- Com `erro`, exibe a mensagem (via `MensagemErro`) e um botão "Tentar novamente" sem
  esconder os produtos.
- Com lista vazia e sem erro, exibe "Nenhuma categoria disponível para filtrar.".

## Estados da `CatalogoScreen`

| Estado | Condição | Interface |
|--------|----------|-----------|
| Carregamento inicial | Primeira consulta em andamento | `ActivityIndicator` centralizado em tela cheia |
| Erro inicial | Primeira consulta falhou e não há lista | `MensagemErro` + "Tentar novamente" |
| Lista carregada | Produtos retornados | Cabeçalho, busca, filtros e `FlatList` |
| Atualizando | Busca/filtro em andamento | Lista anterior visível + indicador discreto |
| Erro posterior | Falha após lista carregada | Lista anterior + erro e "Tentar novamente" junto aos filtros |
| Catálogo vazio | Sucesso com `[]` e sem filtros | "Nenhum produto disponível no momento." |
| Sem resultados | Sucesso com `[]` e filtros ativos | "Nenhum produto encontrado para a busca ou filtro." |
| Categorias com erro | Falha em `/categorias` | Erro na área de filtros; produtos permanecem |
| Sem categorias | Sucesso com `[]` | Aviso de que não há categorias para filtrar |
| Logout em andamento | `saindo = true` | Botão "Sair" desabilitado com indicador |
| Logout com erro | Falha ao sair | `MensagemErro` no cabeçalho |

## Cabeçalho do catálogo

- Título "Loja Virtual".
- Identificação do usuário autenticado (`usuario.email` ou fallback).
- Botão "Sair" sempre visível.
- Área de erro de logout logo abaixo do cabeçalho.
- O cabeçalho NÃO deve depender do header nativo do React Navigation.

## Busca e filtros

- Campo de busca com label "Buscar produtos", placeholder "Digite o nome do produto" e
  `returnKeyType="search"`.
- A consulta é disparada 300 ms após a última alteração.
- Um botão "Limpar" aparece quando há texto e limpa a busca.
- Um botão "Limpar filtros" aparece quando há busca aplicada ou categoria selecionada e
  restaura o estado inicial.
- A indicação de filtros ativos deve ser textual e visual (chip selecionado e/ou resumo).
- Categoria e busca são combinadas na mesma consulta.

## Acessibilidade

- `MensagemErro` já usa `accessibilityRole="alert"`.
- Cards e chips usam `accessibilityRole="button"`.
- Chips usam `accessibilityState.selected`.
- O botão "Sair" usa `accessibilityState={{ disabled, busy }}` (via
  `BotaoPrincipal` ou equivalente).
- Indicadores de carregamento devem ter texto associado quando possível.

## Restrições

- A tela NÃO deve chamar a API diretamente; usa `Service/catalogo.ts`.
- A tela NÃO deve verificar autenticação manualmente; a proteção vem do `AppNavigator`.
- A tela de detalhes NÃO deve buscar o produto na API nesta etapa.
- Nenhuma tela interna deve ser registrada na pilha de autenticação.
- O objeto `Produto` passado nos parâmetros deve ser serializável.
