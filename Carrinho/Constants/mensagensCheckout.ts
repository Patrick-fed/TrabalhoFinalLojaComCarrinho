import type { FormaPagamento } from "../Types/types";

export const ROTULOS_FORMA_PAGAMENTO: Record<FormaPagamento, string> = {
  pix: "Pix",
  cartao: "Cartão",
  boleto: "Boleto",
};

export function ehFormaPagamentoConhecida(
  id: string
): id is FormaPagamento {
  return id === "pix" || id === "cartao" || id === "boleto";
}

export function rotuloFormaPagamento(id: string): string | null {
  if (!ehFormaPagamentoConhecida(id)) {
    return null;
  }

  return ROTULOS_FORMA_PAGAMENTO[id];
}

export const MENSAGENS_CHECKOUT = {
  titulo: "Checkout",
  voltar: "Voltar",
  resumoTitulo: "Resumo da compra",
  formaPagamentoTitulo: "Forma de pagamento",
  carregando: "Carregando...",
  carregandoFormas: "Carregando formas de pagamento...",
  tentarNovamente: "Tentar novamente",
  carrinhoVazio: "Seu carrinho está vazio.",
  formasVazias: "Nenhuma forma de pagamento disponível.",
  selecioneFormaPagamento: "Selecione uma forma de pagamento.",
  avisoDivergencia:
    "Seu carrinho foi atualizado. Revise e confirme novamente.",
  usuarioNaoIdentificado: "Usuário não identificado.",
  finalizacaoFalhou: "Não foi possível finalizar a compra.",
  confirmacaoTitulo: "Compra confirmada",
  pedido: "Pedido",
  itens: "Itens",
  total: "Total",
  formaPagamento: "Forma de pagamento",
  status: "Status",
  quantidade: "Quantidade",
  carrinhoPendente:
    "O carrinho será atualizado ao voltar ao catálogo.",
} as const;

export const MENSAGENS_ERRO_CHECKOUT = {
  formasPagamento: {
    rede: "Verifique sua conexão e tente novamente.",
    http401: "Não foi possível acessar as formas de pagamento.",
    http403: "Não foi possível acessar as formas de pagamento.",
    http500: "A loja está indisponível. Tente novamente.",
    respostaInvalida: "A loja retornou uma resposta inválida.",
    formatoInesperado: "A loja retornou uma resposta inválida.",
    desconhecido: "Não foi possível carregar as formas de pagamento.",
  },
  finalizacao: {
    rede: "Verifique sua conexão e tente novamente.",
    http400: "Não foi possível finalizar a compra. Revise os dados.",
    http401: "Sua sessão expirou. Entre novamente.",
    http403: "Sua sessão expirou. Entre novamente.",
    http404: "Carrinho ou usuário não encontrado.",
    http409: "Não foi possível finalizar a compra. Revise o carrinho.",
    http422: "Não foi possível finalizar a compra. Revise o carrinho.",
    http500: "A loja está indisponível. Tente novamente.",
    respostaInvalida: "A loja retornou uma confirmação inválida.",
    formatoInesperado: "A loja retornou uma confirmação inválida.",
    desconhecido: "Não foi possível finalizar a compra. Tente novamente.",
  },
} as const;
