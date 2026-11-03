# Contract: Serviço de Detalhes do Produto

**Feature**: `004-detalhes-produto` | **Date**: 2026-11-03
**Arquivos previstos**: `Carrinho/Service/catalogo.ts`,
`Carrinho/Constants/mensagensDetalhesProduto.ts` e
`Carrinho/Screens/DetalhesProdutoScreen.tsx`

## `Service/catalogo.ts`

Adicionar uma função ao serviço existente, sem alterar o comportamento de
`listarProdutos` e `listarCategorias`.

```ts
import type { Produto } from "../Types/types";

export async function buscarProdutoPorId(
  id: number,
  signal?: AbortSignal
): Promise<Produto>;
```

### Regras

- Usa `ROTAS.produtoPorId(id)` de `Service/rotas.ts`.
- Reutiliza o helper `requisitar` existente, que envia `x-api-key` e
  `Accept: application/json`.
- Reutiliza `converterProduto` para validar e normalizar a resposta.
- Reutiliza `erroPorStatus` e as mensagens de `Constants/mensagensCatalogo.ts`.
- Lança `ErroCatalogo` para rede, status não OK, JSON inválido ou formato inesperado.
- Propaga `AbortError` quando o `signal` é abortado, para que a tela ignore o resultado.
- Não inclui a chave da API, corpo bruto ou stack trace nas mensagens.
- `404` gera `ErroCatalogo` com `codigo: "http_404"`, usado pela tela para o estado de
  produto indisponível.

### Exemplo de uso

```ts
const produto = await buscarProdutoPorId(produtoId, controller.signal);
```

## `Constants/mensagensDetalhesProduto.ts`

Novo arquivo de textos da tela. Pode reutilizar `MENSAGENS_CARRINHO` para ações de
carrinho, mas centraliza os textos específicos.

```ts
export const MENSAGENS_DETALHES_PRODUTO = {
  titulo: "Detalhes do produto",
  voltar: "Voltar",
  carregando: "Carregando detalhes...",
  atualizando: "Atualizando detalhes...",
  tentarNovamente: "Tentar novamente",
  descricao: "Descrição",
  descricaoVazia: "Este produto não possui descrição.",
  estoqueDisponivel: "Estoque disponível",
  esgotado: "Produto esgotado",
  adicionarAoCarrinho: "Adicionar ao carrinho",
  adicionado: "Produto adicionado ao carrinho.",
  produtoIndisponivel: "Produto não encontrado ou indisponível.",
  voltarAoCatalogo: "Voltar ao catálogo",
  imagemIndisponivel: "Imagem indisponível",
} as const;
```

- Mensagens de erro de rede/HTTP continuam vindo de `ErroCatalogo` +
  `obterMensagemDeErro`.

## `Screens/DetalhesProdutoScreen.tsx`

### Dependências

```ts
const { produto: produtoDaRota } = route.params;
const { carrinho, operacao, adicionarProduto } = useCarrinho();
```

### Estado

```ts
const [produto, setProduto] = useState<Produto | null>(produtoDaRota);
const [carregando, setCarregando] = useState(true);
const [erro, setErro] = useState<string | null>(null);
const [erroAdicao, setErroAdicao] = useState<string | null>(null);
const [sucessoAdicao, setSucessoAdicao] = useState<string | null>(null);
const [imagemFalhou, setImagemFalhou] = useState(false);
```

### Carregamento

- Executar `buscarProdutoPorId(produtoDaRota.id, signal)` em `useEffect` ao montar.
- Usar `AbortController` e um `requisicaoRef` para descartar respostas obsoletas.
- Em sucesso: `setProduto(dados)`, limpar `erro`, resetar `imagemFalhou`.
- Em `http_404`: limpar `produto` e definir `erro` com a mensagem de indisponível.
- Em falha temporária: manter o produto inicial, definir `erro` e permitir retry.
- Em cancelamento: ignorar.
- `carregando` controla o indicador discreto quando já houver produto e o estado de tela
  quando não houver.

### Adição

```ts
async function adicionarAoCarrinho() {
  if (!produto || operacao !== null || estoqueDisponivel <= 0) {
    return;
  }

  setErroAdicao(null);
  setSucessoAdicao(null);

  try {
    await adicionarProduto(produto.id, 1);
    setSucessoAdicao(MENSAGENS_DETALHES_PRODUTO.adicionado);
    // limpar o banner após alguns segundos
  } catch (erroOperacao) {
    setErroAdicao(obterMensagemDeErro(erroOperacao));
  }
}
```

- Não chamar `Service/carrinho.ts` diretamente.
- Não recalcular totais.
- O contexto atualiza o carrinho e o badge do catálogo automaticamente.
- A disponibilidade é recalculada a partir de `carrinho.itens`.

## Restrições

- Telas NÃO devem chamar `fetch` diretamente.
- URLs NÃO devem ser duplicadas fora de `Service/rotas.ts`.
- O serviço NÃO deve calcular disponibilidade nem exibir mensagens; isso é da tela.
- Nenhuma dependência nova deve ser adicionada.
- `listarProdutos` e `listarCategorias` NÃO devem mudar de comportamento.
