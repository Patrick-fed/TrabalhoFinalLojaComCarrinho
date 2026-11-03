# Contract: Navegação e Interface dos Detalhes do Produto

**Feature**: `004-detalhes-produto` | **Date**: 2026-11-03
**Arquivos previstos**: `Carrinho/Screens/DetalhesProdutoScreen.tsx`,
`Carrinho/Constants/mensagensDetalhesProduto.ts`,
`Carrinho/Components/BotaoPrincipal.tsx` e `Carrinho/Components/MensagemErro.tsx`

## Tipos de navegação

A rota existente é preservada:

```ts
export type AppStackParamList = {
  Catalogo: undefined;
  DetalhesProduto: { produto: Produto };
  Carrinho: undefined;
};
```

- O catálogo continua chamando `navigation.navigate("DetalhesProduto", { produto })`.
- Nenhuma alteração é necessária em `Navigation/AppNavigator.tsx`.
- Ao voltar, o catálogo permanece montado e preserva busca, categoria e posição.

## Estrutura da tela

```text
SafeAreaView
├── Cabeçalho customizado
│   ├── “Voltar”
│   └── Título “Detalhes do produto”
└── ScrollView
    ├── Indicador discreto de atualização (quando aplicável)
    ├── Banner de erro de carregamento + “Tentar novamente”
    ├── Estado de carregamento (quando não há produto)
    ├── Estado de produto indisponível (404)
    ├── Área da imagem com fallback
    ├── Nome
    ├── Preço formatado
    ├── Estoque disponível / “Produto esgotado”
    ├── Descrição completa
    ├── Banner de sucesso de adição
    ├── Erro de adição
    └── BotaoPrincipal (“Adicionar ao carrinho” / “Esgotado”)
```

## Estados da tela

| Estado | Condição | Interface |
|--------|----------|-----------|
| Carregando sem produto | `carregando && produto === null` | `CarregandoScreen` |
| Carregando com produto | `carregando && produto !== null` | Conteúdo + indicador discreto |
| Erro sem produto | `erro && produto === null` | `MensagemErro` + “Tentar novamente” |
| Erro com produto inicial | `erro && produto !== null` | `MensagemErro` + conteúdo anterior |
| Produto indisponível | 404 | Mensagem específica + “Voltar ao catálogo” |
| Produto exibido | `produto !== null && !carregando` | Imagem, nome, preço, estoque, descrição e ação |
| Esgotado | `estoqueDisponivel <= 0` | Texto “Produto esgotado” e botão desabilitado |
| Adição em andamento | `operacao?.tipo === "adicionar"` | Spinner no botão e ações bloqueadas |
| Adição com sucesso | `sucessoAdicao !== null` | Banner temporário de confirmação |
| Adição com falha | `erroAdicao !== null` | `MensagemErro` acima do botão |

## Contrato de componentes

### `BotaoPrincipal` (existente)

```ts
type BotaoPrincipalProps = {
  titulo: string;
  aoPressionar: () => void;
  carregando?: boolean;
  desabilitado?: boolean;
};
```

**Uso na tela**:

- `titulo`: “Adicionar ao carrinho” ou “Esgotado”.
- `carregando`: `adicionando`.
- `desabilitado`: `adicaoDesabilitada`.
- Não é necessário alterar o componente.

### `MensagemErro` (existente)

```ts
type MensagemErroProps = {
  mensagem?: string | null;
};
```

**Uso na tela**:

- Erro de carregamento e erro de adição.
- Já possui `accessibilityRole="alert"`.

### `CarregandoScreen` (existente)

- Usado apenas quando `carregando && produto === null`.
- Para atualização com produto já visível, usar um indicador inline discreto.

## Fluxo de carregamento

1. A tela abre com o `Produto` recebido pela navegação.
2. Executa `buscarProdutoPorId(produto.id)`.
3. Enquanto carrega, mantém o conteúdo e mostra “Atualizando detalhes...”.
4. Em sucesso, substitui os dados e limpa o erro.
5. Em falha temporária, mantém o conteúdo e mostra `MensagemErro` com “Tentar novamente”.
6. Em `404`, mostra o estado de produto indisponível com “Voltar ao catálogo”.
7. Ao desmontar ou trocar de produto, aborta a consulta pendente.

## Fluxo de adição

1. Usuário toca em “Adicionar ao carrinho”.
2. Se `estoqueDisponivel <= 0` ou houver operação ativa, a ação não é executada.
3. A tela chama `adicionarProduto(produto.id, 1)`.
4. Durante a operação, o botão mostra spinner e fica desabilitado.
5. Em sucesso, exibe banner temporário e o carrinho/badge são atualizados.
6. Em falha, exibe `MensagemErro` e mantém o carrinho anterior.
7. A disponibilidade é recalculada; se chegar a zero, o botão passa a “Esgotado”.

## Acessibilidade

- Botão “Voltar” com `accessibilityRole="button"` e rótulo claro.
- Imagem com `accessibilityLabel` do produto; fallback com texto legível.
- Botão de adicionar com `accessibilityState={{ disabled, busy }}`.
- `MensagemErro` usa `accessibilityRole="alert"`.
- Textos de estoque e esgotado devem ser legíveis por leitores de tela.
- O banner de sucesso deve ser anunciado de forma não intrusiva.

## Restrições

- A tela NÃO deve chamar a API diretamente; usa `Service/catalogo.ts`.
- A tela NÃO deve implementar lógica de carrinho; usa `CarrinhoContext`.
- A tela NÃO deve calcular totais; apenas exibe preço e estoque.
- A rota e o `AppNavigator` NÃO devem ser alterados.
- Nenhuma tela interna deve ser registrada na pilha de autenticação.
