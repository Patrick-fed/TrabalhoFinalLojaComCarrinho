export type ErroCarrinho = {
  codigo: string;
  mensagem: string;
};

export type OperacaoCarrinho = {
  tipo: "adicionar" | "alterar" | "remover" | "limpar";
  produtoId?: number;
};
