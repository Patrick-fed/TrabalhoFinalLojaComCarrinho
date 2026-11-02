import type { Categoria } from "./types";

export type CategoriaDisponivel = {
  id: Categoria;
  nome: string;
};

export type FiltrosCatalogo = {
  busca: string;
  categoria: Categoria | null;
};

export type ErroCatalogo = {
  codigo: string;
  mensagem: string;
};
