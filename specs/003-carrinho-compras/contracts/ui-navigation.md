# Contract: Navegação e Interface do Carrinho

**Feature**: `003-carrinho-compras` | **Date**: 2026-11-02
**Arquivos previstos**: `Carrinho/Types/navigation.ts`,
`Carrinho/Navigation/AppNavigator.tsx`, `Carrinho/Screens/CatalogoScreen.tsx`,
`Carrinho/Screens/CarrinhoScreen.tsx`, `Carrinho/Components/CartaoProduto.tsx`,
`Carrinho/Components/ItemCarrinhoCard.tsx` e
`Carrinho/Components/ModalConfirmacao.tsx`

## Tipos de navegação

```ts
export type AppStackParamList = {
  Catalogo: undefined;
  DetalhesProduto: { produto: Produto };
  Carrinho: undefined;
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
│       ├── DetalhesProdutoScreen
│       └── CarrinhoScreen
└── usuario == null
    └── AuthStack
        ├── LoginScreen
        └── CadastroScreen
```

## Regras de navegação

| Origem | Ação | Destino | Observação |
|--------|------|---------|------------|
| Catálogo | Botão “Carrinho” | CarrinhoScreen | Mantém o catálogo montado na pilha |
| Carrinho | “Voltar” | CatalogoScreen | Busca, categoria e posição preservadas |
| Carrinho vazio | “Voltar ao catálogo” | CatalogoScreen | Atalho de retorno |
| Catálogo | “Adicionar” no card | Nenhuma navegação | Adiciona quantidade 1 e permanece no catálogo |
| Card de produto | Toque na área principal | DetalhesProdutoScreen | Comportamento existente preservado |
| Catálogo | “Sair” | LoginScreen | Troca de pilha via AuthContext |
| Toques repetidos no botão do carrinho | Segundo toque | Nenhum destino novo | Guarda de navegação impede telas duplicadas |

## Contrato dos componentes

### `CartaoProduto`

```ts
type CartaoProdutoProps = {
  produto: Produto;
  aoPressionar: (produto: Produto) => void;
  aoAdicionar: (produto: Produto) => void;
  adicionando?: boolean;
  adicaoDesabilitada?: boolean;
  desabilitado?: boolean;
};
```

**Comportamento**:

- Exibe imagem, nome e preço formatado.
- A área principal abre os detalhes do produto.
- A ação “Adicionar” é separada da área de navegação para não abrir detalhes.
- Quando `produto.estoque <= 0`, exibe “Esgotado” e desabilita a adição.
- Quando `adicionando`, exibe `ActivityIndicator` e desabilita a ação.
- Quando `adicaoDesabilitada`, desabilita a ação sem alterar a navegação principal.
- A imagem usa placeholder quando falha, mantendo nome e preço.
- Usa `accessibilityRole="button"` e rótulos que incluem o produto e a ação.

### `ItemCarrinhoCard`

```ts
type ItemCarrinhoCardProps = {
  item: ItemCarrinho;
  operacao: OperacaoCarrinho | null;
  aoAumentar: (item: ItemCarrinho) => void;
  aoDiminuir: (item: ItemCarrinho) => void;
  aoRemover: (item: ItemCarrinho) => void;
};
```

**Comportamento**:

- Exibe imagem/fallback, nome, preço unitário, quantidade, subtotal e controles.
- “−” fica desabilitado quando `item.quantidade <= 1` ou há operação em andamento.
- “+” e “Remover” ficam desabilitados durante qualquer operação.
- O item em operação exibe indicador de carregamento.
- Usa `accessibilityLabel` para “Aumentar quantidade”, “Diminuir quantidade” e
  “Remover item”.
- O subtotal usa `item.subtotal` da API.

### `ModalConfirmacao`

```ts
type ModalConfirmacaoProps = {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  textoCancelar: string;
  aoConfirmar: () => void;
  aoCancelar: () => void;
  carregando?: boolean;
};
```

**Comportamento**:

- Usa `Modal` transparente com fundo escurecido.
- Exibe título, mensagem e dois botões.
- Durante `carregando`, o botão de confirmar mostra spinner e ambos ficam desabilitados.
- Não fecha ao tocar no fundo enquanto `carregando`.
- É usado para confirmar a limpeza do carrinho.

## Cabeçalho do catálogo

- Título “Loja Virtual”.
- Identificação do usuário autenticado (`usuario.email` ou fallback).
- Botão “Carrinho” com badge de `quantidadeTotal`.
- Botão “Sair” sempre visível.
- Área de erro de logout logo abaixo do cabeçalho.
- O cabeçalho NÃO deve depender do header nativo do React Navigation.

## Tela do carrinho

### Estados

| Estado | Condição | Interface |
|--------|----------|-----------|
| Carregamento inicial | `carregando && carrinho === null` | `CarregandoScreen` |
| Erro inicial | `erro && carrinho === null` | `MensagemErro` + “Tentar novamente” |
| Vazio | `carrinho.itens.length === 0` | Mensagem de vazio + “Voltar ao catálogo” |
| Com itens | `carrinho.itens.length > 0` | Lista, resumo e ação “Limpar carrinho” |
| Operação | `operacao !== null` | Controles desabilitados + indicador |
| Erro de operação | Falha em adicionar/alterar/remover/limpar | `MensagemErro` acima da lista, dados anteriores preservados |
| Limpeza em andamento | `operacao.tipo === "limpar"` | Modal com spinner e controles bloqueados |

### Layout

- Cabeçalho customizado com “Voltar”, título “Carrinho” e “Limpar carrinho”.
- `FlatList` de `ItemCarrinhoCard`.
- Resumo com “Quantidade total” e “Total” formatados.
- A ação “Limpar carrinho” só aparece quando há itens.
- O estado vazio não oferece limpeza.

## Fluxo de adicionar no catálogo

1. Usuário toca em “Adicionar” no card.
2. Se `produto.estoque <= 0`, a ação está desabilitada e o texto é “Esgotado”.
3. Caso contrário, o catálogo chama `adicionarProduto(produto.id, 1)`.
4. Durante a operação, o card mostra spinner e as ações de adição ficam bloqueadas.
5. Em caso de sucesso, exibe banner temporário e o badge é atualizado.
6. Em caso de falha, exibe `MensagemErro` no catálogo e mantém os dados anteriores.

## Fluxo de limpar o carrinho

1. Usuário toca em “Limpar carrinho”.
2. `ModalConfirmacao` é exibido.
3. Cancelar fecha o modal sem alterar o carrinho.
4. Confirmar chama `limparCarrinho`.
5. Durante a operação, o modal mostra spinner e os controles ficam desabilitados.
6. Em caso de sucesso, o estado vazio e os totais zerados são exibidos.
7. Em caso de falha, o modal fecha e os itens anteriores permanecem com mensagem de erro.

## Acessibilidade

- `MensagemErro` já usa `accessibilityRole="alert"`.
- Botões usam `accessibilityRole="button"`.
- Controles de quantidade usam `accessibilityState={{ disabled, busy }}`.
- O badge do carrinho deve ter rótulo com a quantidade total.
- Indicadores de carregamento devem ter texto associado quando possível.
- O modal deve ter título e mensagem legíveis por leitores de tela.

## Restrições

- A tela NÃO deve chamar a API diretamente; usa `CarrinhoContext` e `Service/carrinho.ts`.
- A tela NÃO deve verificar autenticação manualmente; a proteção vem do `AppNavigator`.
- O catálogo NÃO deve perder busca, categoria ou posição ao voltar do carrinho.
- A tela do carrinho NÃO deve calcular totais localmente.
- Nenhuma tela interna deve ser registrada na pilha de autenticação.
