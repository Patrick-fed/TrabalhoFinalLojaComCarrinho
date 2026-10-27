type Categoria = "eletronicos" | "roupas" | "casa" | "livros";
type FormaPagamento = "pix" | "cartao" | "boleto";

type Produto = {

    id: number;
    nome: string;
    descricao: string;
    preco: number; // em centavos
    categoria: Categoria;
    estoque: number;
    imagem: string; // URL da imagem
};
type ItemCarrinho = {
    produtoId: number;
    nome: string;
    preco: number; // em centavos
    imagem: string;
    quantidade: number;
    subtotal: number; // em centavos
};
    type Carrinho = {
    usuarioId: string;
    itens: ItemCarrinho[];
    quantidadeTotal: number;
    total: number; // em centavos
};
type Compra = {
    id: number;
    usuarioId: string;
    itens: ItemCarrinho[];
    quantidadeTotal: number;
    total: number; // em centavos
    formaPagamento: FormaPagamento;
    status: "confirmada";

    criadaEm: string; // data ISO
};
type ErroApi = { erro: string };