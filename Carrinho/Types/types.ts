export type Categoria =
  | "eletronicos"
  | "roupas"
  | "casa"
  | "livros"
  | "cervejas"
  | "carnes"
  | "refrigerantes"
  | "chocolates"
  | "cachorro-quente";

export type FormaPagamento = "pix" | "cartao" | "boleto";

export type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number; // em centavos
  categoria: Categoria;
  estoque: number;
  imagem: string; // URL da imagem
};

export type ItemCarrinho = {
  produtoId: number;
  nome: string;
  preco: number; // em centavos
  imagem: string;
  quantidade: number;
  subtotal: number; // em centavos
};

export type Carrinho = {
  usuarioId: string;
  itens: ItemCarrinho[];
  quantidadeTotal: number;
  total: number; // em centavos
};

export type Compra = {
  id: number;
  usuarioId: string;
  itens: ItemCarrinho[];
  quantidadeTotal: number;
  total: number; // em centavos
  formaPagamento: FormaPagamento;
  status: "confirmada";
  criadaEm: string; // data ISO
};

export type ErroApi = { erro: string };