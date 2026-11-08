import type { ItemCarrinho } from "./types";

export type FormaPagamentoDisponivel = {
  id: string;
  nome: string;
};

export type ErroCheckout = {
  codigo: string;
  mensagem: string;
};

export type SnapshotRevisao = {
  itens: ItemCarrinho[];
  quantidadeTotal: number;
  total: number;
};
