export const MENSAGENS_CARRINHO = {
  carregando: "Carregando carrinho...",
  carrinho: "Carrinho",
  vazio: "Seu carrinho está vazio.",
  tentarNovamente: "Tentar novamente",
  adicionar: "Adicionar",
  adicionado: "Produto adicionado ao carrinho.",
  esgotado: "Esgotado",
  estoqueDisponivel: "Estoque disponível",
  estoqueEsgotado: "Produto sem estoque disponível.",
  estoqueLimite: "Limite de estoque atingido",
  estoqueLimiteMensagem:
    "Limite de estoque atingido. Não é possível adicionar mais unidades.",
  remover: "Remover",
  limparCarrinho: "Limpar carrinho",
  confirmarLimpezaTitulo: "Limpar carrinho",
  confirmarLimpezaMensagem:
    "Todos os itens serão removidos. Deseja continuar?",
  confirmar: "Limpar",
  cancelar: "Cancelar",
  quantidade: "Quantidade",
  subtotal: "Subtotal",
  total: "Total",
  quantidadeTotal: "Quantidade total",
  voltar: "Voltar",
  voltarAoCatalogo: "Voltar ao catálogo",
} as const;

export const MENSAGENS_ERRO_CARRINHO = {
  rede: "Não foi possível conectar. Verifique sua internet e tente novamente.",
  http400:
    "Não foi possível adicionar mais unidades. Verifique a quantidade e o estoque disponível.",
  http401: "Acesso à loja não autorizado. Tente novamente mais tarde.",
  http404: "O item não foi encontrado no carrinho.",
  http500: "A loja está indisponível no momento. Tente novamente em instantes.",
  respostaInvalida: "Não foi possível interpretar a resposta da loja.",
  estoque:
    "Estoque insuficiente para a quantidade desejada. Reduza a quantidade ou remova o item.",
  produtoEsgotado: "Produto esgotado. Não há unidades disponíveis.",
  desconhecido: "Não foi possível concluir a operação. Tente novamente.",
} as const;
