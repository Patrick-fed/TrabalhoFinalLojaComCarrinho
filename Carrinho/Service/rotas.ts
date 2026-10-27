const API_URL = "https://loja-api-wheat.vercel.app";

export const ROTAS = {
  produtos: `${API_URL}/produtos`,
  produtoPorId: (id: number) => `${API_URL}/produtos/${id}`,

  categorias: `${API_URL}/categorias`,
  formasPagamento: `${API_URL}/formas-pagamento`,

  carrinho: (usuarioId: string) =>
    `${API_URL}/carrinho/${usuarioId}`,

  itensCarrinho: (usuarioId: string) =>
    `${API_URL}/carrinho/${usuarioId}/itens`,

  itemCarrinho: (usuarioId: string, produtoId: number) =>
    `${API_URL}/carrinho/${usuarioId}/itens/${produtoId}`,

  compras: `${API_URL}/compras`,

  compraPorId: (id: number) =>
    `${API_URL}/compras/${id}`,
};