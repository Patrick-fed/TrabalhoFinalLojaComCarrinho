export const MENSAGENS_CATALOGO = {
  carregando: "Carregando catálogo...",
  atualizando: "Atualizando...",
  vazio: "Nenhum produto disponível no momento.",
  semResultados: "Nenhum produto encontrado para a busca ou filtro.",
  semResultadosBusca: "Nenhum produto encontrado para a busca.",
  semResultadosCategoria:
    "Nenhum produto encontrado para a categoria selecionada.",
  semCategorias: "Nenhuma categoria disponível para filtrar.",
  tentarNovamente: "Tentar novamente",
  limparBusca: "Limpar busca",
  limparFiltros: "Limpar filtros",
  buscaAtiva: "Busca ativa",
  categoriaAtiva: "Categoria ativa",
} as const;

export const MENSAGENS_ERRO_API = {
  rede:
    "Não foi possível conectar. Verifique sua internet e tente novamente.",
  http400:
    "Não foi possível aplicar os filtros. Atualize as categorias e tente novamente.",
  http401: "Acesso à loja não autorizado. Tente novamente mais tarde.",
  http404: "Recurso não encontrado.",
  http500:
    "A loja está indisponível no momento. Tente novamente em instantes.",
  respostaInvalida: "Não foi possível interpretar a resposta da loja.",
  desconhecido: "Não foi possível carregar as informações da loja.",
} as const;
